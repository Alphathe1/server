import type { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { Appointment } from "../models/appointment.model.js";
import { Service } from "../models/service.model.js";
import { User } from "../models/user.model.js";
import { errorResponse, successResponse } from "../utils/responseFormatter.js";
import { withRefs } from "../utils/refs.js";
import { getAvailableSlots, isSlotAvailable } from "../utils/scheduling.js";
import { adminIds, formatSlot, notify } from "../utils/notify.js";

const POPULATE = [
  { path: "client", select: "username email phone avatarUrl" },
  { path: "barber", select: "username avatarUrl" },
  { path: "service", select: "name price duration category" },
];

/** Can the current user act on this appointment? */
function canAccess(
  user: NonNullable<Request["user"]>,
  appt: { client: unknown; barber: unknown },
): boolean {
  if (user.isAdmin) return true;
  const id = user._id.toString();
  const ref = (v: unknown) =>
    (v as { _id?: unknown })?._id?.toString?.() ?? String(v);
  return ref(appt.client) === id || ref(appt.barber) === id;
}

/** GET /appointments/availability?barber&service&date */
export async function availability(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { barber, service, date, exclude } = req.parsedQuery as {
      barber: string;
      service: string;
      date: string;
      exclude?: string;
    };
    const [barberDoc, serviceDoc] = await Promise.all([
      User.findOne({ _id: barber, role: "barber", isActive: true }),
      Service.findById(service),
    ]);
    if (!barberDoc || !serviceDoc) {
      errorResponse(res, "Barber or service not found", StatusCodes.NOT_FOUND);
      return;
    }
    const slots = await getAvailableSlots(
      barberDoc,
      date,
      serviceDoc.duration,
      exclude,
    );
    successResponse(res, slots);
  } catch (error) {
    next(error);
  }
}

/** POST /appointments */
export async function createAppointment(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const user = req.user!;
    const { barber, service, start, notes } = req.body as {
      barber: string;
      service: string;
      start: Date;
      notes?: string;
      client?: string;
    };
    // clients always book for themselves; staff can book for a client
    const clientId =
      user.role === "client" ? user._id.toString() : req.body.client;
    if (!clientId) {
      errorResponse(res, "Client is required", StatusCodes.BAD_REQUEST, "client");
      return;
    }

    const [barberDoc, serviceDoc, clientDoc] = await Promise.all([
      User.findOne({ _id: barber, role: "barber", isActive: true }),
      Service.findOne({ _id: service, isActive: true }),
      User.findById(clientId),
    ]);
    if (!barberDoc || !serviceDoc || !clientDoc) {
      errorResponse(res, "Barber, service or client not found", StatusCodes.NOT_FOUND);
      return;
    }

    if (!(await isSlotAvailable(barberDoc, start, serviceDoc.duration))) {
      errorResponse(res, "This time slot is no longer available", StatusCodes.CONFLICT, "start");
      return;
    }

    const appt = await Appointment.create({
      client: clientDoc._id,
      barber: barberDoc._id,
      service: serviceDoc._id,
      start,
      end: new Date(start.getTime() + serviceDoc.duration * 60_000),
      price: serviceDoc.price,
      ...(notes ? { notes } : {}),
      status: "confirmed",
    });

    const when = formatSlot(start);
    await Promise.all([
      notify([clientDoc._id], {
        type: "booking_confirmed",
        title: "Réservation confirmée",
        message: `${serviceDoc.name} avec ${barberDoc.username} — ${when}`,
        link: "/dashboard/appointments",
      }),
      notify([barberDoc._id, ...(await adminIds())], {
        type: "new_appointment",
        title: "Nouveau rendez-vous",
        message: `${clientDoc.username} · ${serviceDoc.name} — ${when}`,
        link: "/dashboard/appointments",
      }),
    ]);

    await appt.populate(POPULATE);
    successResponse(res, appt, "Appointment booked", StatusCodes.CREATED);
  } catch (error) {
    next(error);
  }
}

/** GET /appointments?from&to&status&barber&client — scoped by role */
export async function listAppointments(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const user = req.user!;
    const { from, to, status, barber, client } = req.query as Record<
      string,
      string | undefined
    >;
    const filter: Record<string, unknown> = {};

    if (user.role === "client") filter.client = user._id;
    else if (user.role === "barber") filter.barber = user._id;
    else {
      if (barber) filter.barber = barber;
      if (client) filter.client = client;
    }
    if (status) filter.status = { $in: status.split(",") };
    if (from || to) {
      filter.start = {
        ...(from ? { $gte: new Date(from) } : {}),
        ...(to ? { $lt: new Date(to) } : {}),
      };
    }

    const appointments = await Appointment.find(filter)
      .populate(POPULATE)
      .sort({ start: from ? 1 : -1 })
      .limit(500);
    successResponse(res, withRefs(appointments, "client", "barber", "service"));
  } catch (error) {
    next(error);
  }
}

export async function getAppointment(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const appt = await Appointment.findById(req.params.id).populate(POPULATE);
    if (!appt || !withRefs([appt], "client", "barber", "service").length || !canAccess(req.user!, appt)) {
      errorResponse(res, "Appointment not found", StatusCodes.NOT_FOUND);
      return;
    }
    successResponse(res, appt);
  } catch (error) {
    next(error);
  }
}

/** PATCH /appointments/:id — change barber, service or time */
export async function rescheduleAppointment(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const appt = await Appointment.findById(req.params.id);
    if (!appt || !canAccess(req.user!, appt)) {
      errorResponse(res, "Appointment not found", StatusCodes.NOT_FOUND);
      return;
    }
    if (!["pending", "confirmed"].includes(appt.status)) {
      errorResponse(res, "Only upcoming appointments can be modified", StatusCodes.BAD_REQUEST);
      return;
    }

    const { barber, service, start, notes } = req.body as {
      barber?: string;
      service?: string;
      start?: Date;
      notes?: string;
    };
    const [barberDoc, serviceDoc] = await Promise.all([
      User.findOne({ _id: barber ?? appt.barber, role: "barber", isActive: true }),
      Service.findById(service ?? appt.service),
    ]);
    if (!barberDoc || !serviceDoc) {
      errorResponse(res, "Barber or service not found", StatusCodes.NOT_FOUND);
      return;
    }
    const newStart = start ?? appt.start;
    const ok = await isSlotAvailable(
      barberDoc,
      newStart,
      serviceDoc.duration,
      appt._id.toString(),
    );
    if (!ok) {
      errorResponse(res, "This time slot is not available", StatusCodes.CONFLICT, "start");
      return;
    }

    const previousBarber = appt.barber;
    appt.barber = barberDoc._id;
    appt.service = serviceDoc._id;
    appt.start = newStart;
    appt.end = new Date(newStart.getTime() + serviceDoc.duration * 60_000);
    appt.price = serviceDoc.price;
    appt.reminderSent = false;
    if (notes !== undefined) appt.notes = notes;
    await appt.save();

    await notify(
      [appt.client, appt.barber, previousBarber, ...(await adminIds())].filter(
        (id) => id.toString() !== req.user!._id.toString(),
      ),
      {
        type: "modified",
        title: "Rendez-vous modifié",
        message: `${serviceDoc.name} avec ${barberDoc.username} — ${formatSlot(newStart)}`,
        link: "/dashboard/appointments",
      },
    );

    await appt.populate(POPULATE);
    successResponse(res, appt, "Appointment updated");
  } catch (error) {
    next(error);
  }
}

/** PATCH /appointments/:id/status */
export async function updateAppointmentStatus(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const user = req.user!;
    const { status, cancelReason } = req.body as {
      status: "pending" | "confirmed" | "completed" | "cancelled" | "no-show";
      cancelReason?: string;
    };
    const appt = await Appointment.findById(req.params.id).populate<{
      service: { name: string };
    }>("service", "name");
    if (!appt || !canAccess(user, appt)) {
      errorResponse(res, "Appointment not found", StatusCodes.NOT_FOUND);
      return;
    }
    if (user.role === "client" && status !== "cancelled") {
      errorResponse(res, "Clients can only cancel appointments", StatusCodes.FORBIDDEN);
      return;
    }
    if (status === "cancelled" && !["pending", "confirmed"].includes(appt.status)) {
      errorResponse(res, "This appointment can no longer be cancelled", StatusCodes.BAD_REQUEST);
      return;
    }

    appt.status = status;
    if (cancelReason) appt.cancelReason = cancelReason;
    await appt.save();

    if (status === "cancelled") {
      await notify(
        [appt.client, appt.barber, ...(await adminIds())].filter(
          (id) => id.toString() !== user._id.toString(),
        ),
        {
          type: "cancelled",
          title: "Rendez-vous annulé",
          message: `${appt.service?.name ?? "Rendez-vous"} — ${formatSlot(appt.start)}${
            cancelReason ? ` · ${cancelReason}` : ""
          }`,
          link: "/dashboard/appointments",
        },
      );
    }

    await appt.populate(POPULATE);
    successResponse(res, appt, "Status updated");
  } catch (error) {
    next(error);
  }
}
