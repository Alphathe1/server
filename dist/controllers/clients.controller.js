import { StatusCodes } from "http-status-codes";
import { randomBytes } from "node:crypto";
import { Types } from "mongoose";
import { User } from "../models/user.model.js";
import { Appointment } from "../models/appointment.model.js";
import { Prestation } from "../models/prestation.model.js";
import { errorResponse, successResponse } from "../utils/responseFormatter.js";
import { withRefs } from "../utils/refs.js";
/** GET /clients?search — admins see all, barbers see clients they served */
export async function listClients(req, res, next) {
    try {
        const user = req.user;
        const search = req.query.search;
        const filter = { role: "client" };
        if (user.role === "barber") {
            const ids = await Appointment.distinct("client", { barber: user._id });
            filter._id = { $in: ids };
        }
        if (search) {
            const rx = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
            filter.$or = [{ username: rx }, { email: rx }, { phone: rx }];
        }
        const clients = await User.find(filter)
            .select("username email phone avatarUrl createdAt isActive")
            .sort({ createdAt: -1 })
            .lean({ virtuals: false });
        const stats = await Prestation.aggregate([
            { $match: { client: { $in: clients.map((c) => c._id) } } },
            {
                $group: {
                    _id: "$client",
                    visits: { $sum: 1 },
                    spent: { $sum: "$price" },
                    lastVisit: { $max: "$date" },
                },
            },
        ]);
        const byId = new Map(stats.map((s) => [s._id.toString(), s]));
        successResponse(res, clients.map((c) => {
            const s = byId.get(c._id.toString());
            return {
                ...c,
                visitCount: s?.visits ?? 0,
                totalSpent: s?.spent ?? 0,
                lastVisit: s?.lastVisit ?? null,
            };
        }));
    }
    catch (error) {
        next(error);
    }
}
/** POST /clients — create a client file (walk-in); a random password is set */
export async function createClient(req, res, next) {
    try {
        const { username, email, phone, preferences, staffNotes } = req.body;
        const client = await User.create({
            username: username,
            email: email,
            ...(phone ? { phone } : {}),
            ...(preferences ? { preferences } : {}),
            ...(staffNotes ? { staffNotes } : {}),
            role: "client",
            password: randomBytes(12).toString("hex") + "Aa1",
        });
        const obj = client.toObject();
        delete obj.password;
        successResponse(res, obj, "Client created", StatusCodes.CREATED);
    }
    catch (error) {
        next(error);
    }
}
/** GET /clients/:id — the full client file */
export async function getClient(req, res, next) {
    try {
        const client = await User.findOne({
            _id: req.params.id,
            role: "client",
        }).select("-password");
        if (!client) {
            errorResponse(res, "Client not found", StatusCodes.NOT_FOUND);
            return;
        }
        if (req.user.role === "barber") {
            const served = await Appointment.exists({
                client: client._id,
                barber: req.user._id,
            });
            if (!served) {
                errorResponse(res, "Client not found", StatusCodes.NOT_FOUND);
                return;
            }
        }
        const [appointments, prestations] = await Promise.all([
            Appointment.find({ client: client._id })
                .populate("barber", "username avatarUrl")
                .populate("service", "name price duration")
                .sort({ start: -1 }),
            Prestation.find({ client: client._id })
                .populate("barber", "username avatarUrl")
                .populate("service", "name price")
                .sort({ date: -1 }),
        ]);
        successResponse(res, {
            client,
            appointments: withRefs(appointments, "barber", "service"),
            prestations: withRefs(prestations, "barber", "service"),
            stats: {
                visitCount: prestations.length,
                totalSpent: prestations.reduce((sum, p) => sum + p.price, 0),
                cancelled: appointments.filter((a) => a.status === "cancelled").length,
                noShows: appointments.filter((a) => a.status === "no-show").length,
                lastVisit: prestations[0]?.date ?? null,
            },
        });
    }
    catch (error) {
        next(error);
    }
}
/** PATCH /clients/:id/notes — staff notes & preferences */
export async function updateClientNotes(req, res, next) {
    try {
        const client = await User.findOneAndUpdate({ _id: req.params.id, role: "client" }, req.body, { new: true, runValidators: true }).select("-password");
        if (!client) {
            errorResponse(res, "Client not found", StatusCodes.NOT_FOUND);
            return;
        }
        successResponse(res, client, "Client notes updated");
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=clients.controller.js.map