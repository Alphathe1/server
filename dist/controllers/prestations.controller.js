import { StatusCodes } from "http-status-codes";
import { Prestation } from "../models/prestation.model.js";
import { Appointment } from "../models/appointment.model.js";
import { Service } from "../models/service.model.js";
import { errorResponse, successResponse } from "../utils/responseFormatter.js";
import { withOptionalRefs, withRefs } from "../utils/refs.js";
const POPULATE = [
    { path: "client", select: "username email phone avatarUrl" },
    { path: "barber", select: "username avatarUrl" },
    { path: "service", select: "name price duration category" },
];
function ownsPrestation(user, p) {
    if (user.isAdmin)
        return true;
    const id = user._id.toString();
    const ref = (v) => v?._id?.toString?.() ?? String(v);
    return user.role === "barber" ? ref(p.barber) === id : ref(p.client) === id;
}
/** POST /prestations — record work done by a barber */
export async function createPrestation(req, res, next) {
    try {
        const user = req.user;
        const body = { ...req.body };
        if (user.role === "barber")
            body.barber = user._id;
        if (!body.barber) {
            errorResponse(res, "Barber is required", StatusCodes.BAD_REQUEST, "barber");
            return;
        }
        if (body.appointment) {
            const appt = await Appointment.findById(body.appointment);
            if (!appt) {
                errorResponse(res, "Appointment not found", StatusCodes.NOT_FOUND);
                return;
            }
            body.client = appt.client;
            body.barber = appt.barber;
            body.service ??= appt.service;
            body.price ??= appt.price;
            body.date ??= appt.start;
            body.source = "appointment";
            appt.status = "completed";
            await appt.save();
        }
        if (body.price === undefined) {
            const service = await Service.findById(body.service);
            body.price = service?.price ?? 0;
        }
        body.recordedBy = user._id;
        const prestation = await Prestation.create(body);
        await prestation.populate(POPULATE);
        successResponse(res, prestation, "Prestation recorded", StatusCodes.CREATED);
    }
    catch (error) {
        next(error);
    }
}
/** GET /prestations?client&barber — clients see their own, barbers theirs */
export async function listPrestations(req, res, next) {
    try {
        const user = req.user;
        const { client, barber, cutType } = req.query;
        const filter = {};
        if (user.role === "client")
            filter.client = user._id;
        else {
            // barbers can read a client's full history, otherwise only their own work
            if (user.role === "barber" && !client)
                filter.barber = user._id;
            if (client)
                filter.client = client;
            if (barber && user.isAdmin)
                filter.barber = barber;
        }
        if (cutType)
            filter.cutType = cutType;
        const prestations = await Prestation.find(filter)
            .populate(POPULATE)
            .sort({ date: -1 })
            .limit(300);
        successResponse(res, withOptionalRefs(withRefs(prestations, "barber", "service"), "client"));
    }
    catch (error) {
        next(error);
    }
}
export async function getPrestation(req, res, next) {
    try {
        const p = await Prestation.findById(req.params.id).populate(POPULATE);
        if (!p || !withOptionalRefs(withRefs([p], "barber", "service"), "client").length || (req.user.role === "client" && !ownsPrestation(req.user, p))) {
            errorResponse(res, "Prestation not found", StatusCodes.NOT_FOUND);
            return;
        }
        successResponse(res, p);
    }
    catch (error) {
        next(error);
    }
}
export async function updatePrestation(req, res, next) {
    try {
        const p = await Prestation.findById(req.params.id);
        if (!p || !ownsPrestation(req.user, p)) {
            errorResponse(res, "Prestation not found", StatusCodes.NOT_FOUND);
            return;
        }
        const updates = { ...req.body };
        if (!req.user.isAdmin)
            delete updates.barber;
        Object.assign(p, updates);
        await p.save();
        await p.populate(POPULATE);
        successResponse(res, p, "Prestation updated");
    }
    catch (error) {
        next(error);
    }
}
export async function deletePrestation(req, res, next) {
    try {
        const p = await Prestation.findById(req.params.id);
        if (!p || !ownsPrestation(req.user, p)) {
            errorResponse(res, "Prestation not found", StatusCodes.NOT_FOUND);
            return;
        }
        await p.deleteOne();
        successResponse(res, null, "Prestation deleted");
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=prestations.controller.js.map