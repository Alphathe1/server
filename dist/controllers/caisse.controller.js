import { StatusCodes } from "http-status-codes";
import { Prestation } from "../models/prestation.model.js";
import { Service } from "../models/service.model.js";
import { User } from "../models/user.model.js";
import { Ticket } from "../models/ticket.model.js";
import { errorResponse, successResponse } from "../utils/responseFormatter.js";
import { withOptionalRefs, withRefs } from "../utils/refs.js";
import { dayBounds, toDateKey } from "../utils/scheduling.js";
const POPULATE = [
    { path: "client", select: "username phone" },
    { path: "barber", select: "username avatarUrl" },
    { path: "service", select: "name category" },
    { path: "recordedBy", select: "username" },
];
/** POST /caisse/sales — ring up one haircut: service + barber (owner & manager) */
export async function createSale(req, res, next) {
    try {
        const { barber, service, price, paymentMethod, client, notes } = req.body;
        const [barberDoc, serviceDoc] = await Promise.all([
            User.findOne({ _id: barber, role: "barber" }),
            Service.findById(service),
        ]);
        if (!barberDoc || !serviceDoc) {
            errorResponse(res, "Barber or service not found", StatusCodes.NOT_FOUND);
            return;
        }
        if (client && !(await User.exists({ _id: client, role: "client" }))) {
            errorResponse(res, "Client not found", StatusCodes.NOT_FOUND, "client");
            return;
        }
        const sale = await Prestation.create({
            barber: barberDoc._id,
            service: serviceDoc._id,
            price: price ?? serviceDoc.price,
            paymentMethod: paymentMethod ?? "cash",
            source: "caisse",
            recordedBy: req.user._id,
            date: new Date(),
            ...(client ? { client } : {}),
            ...(notes ? { notes } : {}),
        });
        await sale.populate(POPULATE);
        successResponse(res, sale, "Sale recorded", StatusCodes.CREATED);
    }
    catch (error) {
        next(error);
    }
}
/** GET /caisse?from=YYYY-MM-DD&to=YYYY-MM-DD — register summary (default: today) */
export async function getRegister(req, res, next) {
    try {
        const q = req.parsedQuery;
        const fromKey = q.from ?? toDateKey(new Date());
        const toKey = q.to ?? fromKey;
        const from = dayBounds(fromKey).from;
        const to = dayBounds(toKey).to;
        const sales = withOptionalRefs(withRefs(await Prestation.find({ date: { $gte: from, $lt: to } })
            .populate(POPULATE)
            .sort({ date: -1 }), "barber", "service"), "client");
        // older records may predate commissions: fall back to the default 50%
        const commissionOf = (s) => s.commission || Math.round(s.price * (s.commissionRate ?? 0.5));
        const barbers = new Map();
        let revenue = 0;
        let commission = 0;
        let cash = 0;
        let card = 0;
        for (const s of sales) {
            const b = s.barber;
            const id = b._id.toString();
            const c = commissionOf(s);
            const row = barbers.get(id) ?? { _id: id, username: b.username, ...(b.avatarUrl ? { avatarUrl: b.avatarUrl } : {}), count: 0, revenue: 0, commission: 0 };
            row.count += 1;
            row.revenue += s.price;
            row.commission += c;
            barbers.set(id, row);
            revenue += s.price;
            commission += c;
            if (s.paymentMethod === "card")
                card += s.price;
            else
                cash += s.price;
        }
        successResponse(res, {
            from: fromKey,
            to: toKey,
            nextTicketNumber: await nextNumber(toDateKey(new Date())),
            totals: {
                count: sales.length,
                revenue,
                commission,
                shop: revenue - commission,
                cash,
                card,
            },
            barbers: [...barbers.values()].sort((a, b) => b.revenue - a.revenue),
            sales: sales.map((s) => ({ ...s.toObject(), commission: commissionOf(s) })),
        });
    }
    catch (error) {
        next(error);
    }
}
/** DELETE /caisse/sales/:id — cancel a sale recorded by mistake */
export async function cancelSale(req, res, next) {
    try {
        const sale = await Prestation.findByIdAndDelete(req.params.id);
        if (!sale) {
            errorResponse(res, "Sale not found", StatusCodes.NOT_FOUND);
            return;
        }
        successResponse(res, null, "Sale cancelled");
    }
    catch (error) {
        next(error);
    }
}
const nextNumber = async (day) => ((await Ticket.findOne({ day }).sort({ number: -1 }).select("number"))?.number ?? 0) + 1;
/**
 * POST /caisse/tickets — pay a whole ticket (several haircuts, possibly several barbers).
 * Each haircut becomes a Prestation so commissions and stats stay per haircut;
 * a global discount is spread across the haircuts so commissions follow the price actually paid.
 */
export async function createTicket(req, res, next) {
    try {
        const body = req.body;
        const serviceIds = [...new Set(body.lines.map((l) => l.service))];
        const barberIds = [...new Set(body.lines.map((l) => l.barber))];
        const [services, barbers] = await Promise.all([
            Service.find({ _id: { $in: serviceIds } }),
            User.find({ _id: { $in: barberIds }, role: "barber" }),
        ]);
        const serviceById = new Map(services.map((s) => [s._id.toString(), s]));
        const barberById = new Map(barbers.map((b) => [b._id.toString(), b]));
        if (serviceById.size !== serviceIds.length || barberById.size !== barberIds.length) {
            errorResponse(res, "Barber or service not found", StatusCodes.NOT_FOUND);
            return;
        }
        if (body.client && !(await User.exists({ _id: body.client, role: "client" }))) {
            errorResponse(res, "Client not found", StatusCodes.NOT_FOUND, "client");
            return;
        }
        const lines = body.lines.map((l) => {
            const service = serviceById.get(l.service);
            const barber = barberById.get(l.barber);
            return {
                service: service._id,
                serviceName: service.name,
                barber: barber._id,
                barberName: barber.username,
                unitPrice: l.unitPrice ?? service.price,
                quantity: l.quantity,
            };
        });
        const subtotal = lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0);
        const discount = Math.min(body.discount ?? 0, subtotal);
        const total = subtotal - discount;
        let change;
        if (body.paymentMethod === "cash" && body.cashGiven !== undefined) {
            if (body.cashGiven < total) {
                errorResponse(res, "Montant reçu insuffisant", StatusCodes.BAD_REQUEST, "cashGiven");
                return;
            }
            change = body.cashGiven - total;
        }
        // daily ticket number; retry if two registers pay at the same instant
        const day = toDateKey(new Date());
        let ticket;
        for (let attempt = 0; !ticket; attempt++) {
            try {
                ticket = await Ticket.create({
                    number: await nextNumber(day),
                    day,
                    lines,
                    subtotal,
                    discount,
                    total,
                    paymentMethod: body.paymentMethod,
                    cashier: req.user._id,
                    ...(body.cashGiven !== undefined ? { cashGiven: body.cashGiven } : {}),
                    ...(change !== undefined ? { change } : {}),
                    ...(body.client ? { client: body.client } : {}),
                });
            }
            catch (err) {
                if (err.code !== 11000 || attempt >= 3)
                    throw err;
            }
        }
        // one unit per haircut, discounted proportionally; rounding goes to the last unit
        const units = lines.flatMap((l) => Array.from({ length: l.quantity }, () => l));
        const ratio = subtotal ? total / subtotal : 0;
        const paid = units.map((u) => Math.round(u.unitPrice * ratio));
        paid[paid.length - 1] += total - paid.reduce((s, p) => s + p, 0);
        try {
            const now = new Date();
            const prestations = await Prestation.create(units.map((u, i) => ({
                barber: u.barber,
                service: u.service,
                price: Math.max(0, paid[i]),
                paymentMethod: body.paymentMethod,
                source: "caisse",
                recordedBy: req.user._id,
                date: now,
                ticket: ticket._id,
                ticketNumber: ticket.number,
                ...(body.client ? { client: body.client } : {}),
            })));
            ticket.prestations = prestations.map((p) => p._id);
            await ticket.save();
            const commission = prestations.reduce((s, p) => s + p.commission, 0);
            successResponse(res, { ...ticket.toObject(), commission }, "Ticket encaissé", StatusCodes.CREATED);
        }
        catch (err) {
            // never leave a paid ticket without its haircuts
            await Prestation.deleteMany({ ticket: ticket._id });
            await ticket.deleteOne();
            throw err;
        }
    }
    catch (error) {
        next(error);
    }
}
/** DELETE /caisse/tickets/:id — cancel a whole ticket and its haircuts */
export async function cancelTicket(req, res, next) {
    try {
        const ticket = await Ticket.findByIdAndDelete(req.params.id);
        if (!ticket) {
            errorResponse(res, "Ticket not found", StatusCodes.NOT_FOUND);
            return;
        }
        await Prestation.deleteMany({ ticket: ticket._id });
        successResponse(res, null, "Ticket annulé");
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=caisse.controller.js.map