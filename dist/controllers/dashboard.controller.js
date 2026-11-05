import { Types } from "mongoose";
import { Appointment } from "../models/appointment.model.js";
import { Prestation } from "../models/prestation.model.js";
import { Review } from "../models/review.model.js";
import { User } from "../models/user.model.js";
import { successResponse } from "../utils/responseFormatter.js";
import { withRefs } from "../utils/refs.js";
import { toDateKey } from "../utils/scheduling.js";
function rangeStart(range) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    if (range === "week")
        d.setDate(d.getDate() - 6);
    if (range === "month")
        d.setDate(d.getDate() - 29);
    return d;
}
/** GET /dashboard/stats?range=day|week|month&barber — barbers only see their own */
export async function getStats(req, res, next) {
    try {
        const user = req.user;
        const { range, barber } = req.parsedQuery;
        const from = rangeStart(range);
        const to = new Date();
        to.setHours(23, 59, 59, 999);
        const barberId = user.role === "barber"
            ? user._id
            : barber
                ? new Types.ObjectId(barber)
                : undefined;
        const scope = barberId ? { barber: barberId } : {};
        const [appointmentsCount, cancelledCount, prestations, newClients, byBarber, topServices, ratings, upcoming,] = await Promise.all([
            Appointment.countDocuments({ ...scope, start: { $gte: from, $lte: to } }),
            Appointment.countDocuments({
                ...scope,
                start: { $gte: from, $lte: to },
                status: { $in: ["cancelled", "no-show"] },
            }),
            Prestation.find({ ...scope, date: { $gte: from, $lte: to } }).select("price date commission"),
            User.countDocuments({ role: "client", createdAt: { $gte: from, $lte: to } }),
            Prestation.aggregate([
                { $match: { ...scope, date: { $gte: from, $lte: to } } },
                {
                    $group: {
                        _id: "$barber",
                        prestations: { $sum: 1 },
                        revenue: { $sum: "$price" },
                        commission: { $sum: { $ifNull: ["$commission", 0] } },
                    },
                },
                { $sort: { revenue: -1 } },
            ]),
            Prestation.aggregate([
                { $match: { ...scope, date: { $gte: from, $lte: to } } },
                {
                    $group: {
                        _id: "$service",
                        count: { $sum: 1 },
                        revenue: { $sum: "$price" },
                    },
                },
                { $sort: { count: -1 } },
                { $limit: 6 },
                {
                    $lookup: {
                        from: "services",
                        localField: "_id",
                        foreignField: "_id",
                        as: "service",
                    },
                },
                { $unwind: "$service" },
                {
                    $project: {
                        count: 1,
                        revenue: 1,
                        name: "$service.name",
                    },
                },
            ]),
            Review.aggregate([
                { $match: scope },
                {
                    $group: {
                        _id: "$barber",
                        rating: { $avg: "$rating" },
                        count: { $sum: 1 },
                    },
                },
            ]),
            Appointment.find({
                ...scope,
                start: { $gte: new Date() },
                status: { $in: ["pending", "confirmed"] },
            })
                .populate("client", "username avatarUrl")
                .populate("barber", "username")
                .populate("service", "name duration")
                .sort({ start: 1 })
                .limit(8),
        ]);
        // barber names + ratings
        const barbers = await User.find({ role: "barber", ...(barberId ? { _id: barberId } : {}) })
            .select("username avatarUrl")
            .lean({ virtuals: false });
        const ratingMap = new Map(ratings.map((r) => [r._id.toString(), r]));
        const perfMap = new Map(byBarber.map((b) => [b._id.toString(), b]));
        const barberPerformance = barbers
            .map((b) => {
            const perf = perfMap.get(b._id.toString());
            const rating = ratingMap.get(b._id.toString());
            return {
                _id: b._id,
                username: b.username,
                avatarUrl: b.avatarUrl,
                prestations: perf?.prestations ?? 0,
                revenue: perf?.revenue ?? 0,
                commission: perf?.commission ?? 0,
                rating: rating ? Math.round(rating.rating * 10) / 10 : null,
                reviewCount: rating?.count ?? 0,
            };
        })
            .sort((a, b) => b.revenue - a.revenue);
        // time series: hourly for a day, daily otherwise
        const series = [];
        if (range === "day") {
            for (let h = 8; h <= 20; h++) {
                const items = prestations.filter((p) => p.date.getHours() === h);
                series.push({
                    label: `${h}h`,
                    commission: items.reduce((s, p) => s + (p.commission ?? 0), 0),
                    revenue: items.reduce((s, p) => s + p.price, 0),
                    prestations: items.length,
                });
            }
        }
        else {
            const cursor = new Date(from);
            while (cursor <= to) {
                const key = toDateKey(cursor);
                const items = prestations.filter((p) => toDateKey(p.date) === key);
                series.push({
                    label: cursor.toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "short",
                    }),
                    commission: items.reduce((s, p) => s + (p.commission ?? 0), 0),
                    revenue: items.reduce((s, p) => s + p.price, 0),
                    prestations: items.length,
                });
                cursor.setDate(cursor.getDate() + 1);
            }
        }
        const revenue = prestations.reduce((s, p) => s + p.price, 0);
        const commission = prestations.reduce((s, p) => s + (p.commission ?? 0), 0);
        successResponse(res, {
            range,
            appointmentsCount,
            cancelledCount,
            prestationsCount: prestations.length,
            revenue,
            commission,
            shopRevenue: revenue - commission,
            averageTicket: prestations.length ? revenue / prestations.length : 0,
            newClients,
            barberPerformance,
            topServices,
            series,
            upcoming: withRefs(upcoming, "client", "barber", "service"),
        });
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=dashboard.controller.js.map