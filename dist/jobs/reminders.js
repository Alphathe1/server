import { Appointment } from "../models/appointment.model.js";
import { formatSlot, notify } from "../utils/notify.js";
const INTERVAL_MS = 15 * 60_000;
const REMIND_BEFORE_MS = 24 * 60 * 60_000;
/** Send a reminder to the client and barber ~24h before each appointment */
async function sendReminders() {
    const now = new Date();
    const due = await Appointment.find({
        status: { $in: ["pending", "confirmed"] },
        reminderSent: false,
        start: { $gt: now, $lte: new Date(now.getTime() + REMIND_BEFORE_MS) },
    }).populate("service", "name");
    for (const appt of due) {
        await notify([appt.client, appt.barber], {
            type: "reminder",
            title: "Rappel de rendez-vous",
            message: `${appt.service?.name ?? "Rendez-vous"} — ${formatSlot(appt.start)}`,
            link: "/dashboard/appointments",
        });
        appt.reminderSent = true;
        await appt.save();
    }
}
export function startReminderJob() {
    const run = () => sendReminders().catch((err) => console.error("Reminder job failed:", err));
    run();
    setInterval(run, INTERVAL_MS);
}
//# sourceMappingURL=reminders.js.map