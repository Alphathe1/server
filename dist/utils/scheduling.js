import { Appointment } from "../models/appointment.model.js";
export const SLOT_STEP_MINUTES = 15;
const ACTIVE_STATUSES = ["pending", "confirmed", "completed"];
function toMinutes(hhmm) {
    const [h = "0", m = "0"] = hhmm.split(":");
    return Number(h) * 60 + Number(m);
}
function pad(n) {
    return n.toString().padStart(2, "0");
}
/** Build a local Date from "YYYY-MM-DD" + minutes since midnight */
function atMinutes(date, minutes) {
    const [y, mo, d] = date.split("-").map(Number);
    return new Date(y, mo - 1, d, Math.floor(minutes / 60), minutes % 60);
}
export function dayBounds(date) {
    return { from: atMinutes(date, 0), to: atMinutes(date, 24 * 60) };
}
export function toDateKey(d) {
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
/**
 * Every bookable start time for a barber on a given day.
 * Busy appointments (other than `excludeId`) automatically block their range.
 */
export async function getAvailableSlots(barber, date, durationMinutes, excludeId) {
    const { from, to } = dayBounds(date);
    const hours = (barber.workingHours ?? []).filter((h) => h.day === from.getDay());
    if (!hours.length)
        return [];
    const filter = {
        barber: barber._id,
        status: { $in: ACTIVE_STATUSES },
        start: { $lt: to },
        end: { $gt: from },
    };
    if (excludeId)
        filter._id = { $ne: excludeId };
    const busy = await Appointment.find(filter).select("start end");
    const now = Date.now();
    const slots = [];
    for (const range of hours) {
        const open = toMinutes(range.start);
        const close = toMinutes(range.end);
        for (let m = open; m + durationMinutes <= close; m += SLOT_STEP_MINUTES) {
            const start = atMinutes(date, m);
            const end = new Date(start.getTime() + durationMinutes * 60_000);
            if (start.getTime() <= now)
                continue;
            const overlaps = busy.some((a) => a.start < end && a.end > start);
            if (!overlaps) {
                slots.push({
                    time: `${pad(Math.floor(m / 60))}:${pad(m % 60)}`,
                    start: start.toISOString(),
                });
            }
        }
    }
    return slots;
}
export async function isSlotAvailable(barber, start, durationMinutes, excludeId) {
    const slots = await getAvailableSlots(barber, toDateKey(start), durationMinutes, excludeId);
    return slots.some((s) => new Date(s.start).getTime() === start.getTime());
}
//# sourceMappingURL=scheduling.js.map