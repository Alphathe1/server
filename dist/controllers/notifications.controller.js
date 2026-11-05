import { Notification } from "../models/notification.model.js";
import { successResponse } from "../utils/responseFormatter.js";
export async function listNotifications(req, res, next) {
    try {
        const [items, unread] = await Promise.all([
            Notification.find({ user: req.user._id })
                .sort({ createdAt: -1 })
                .limit(50),
            Notification.countDocuments({ user: req.user._id, read: false }),
        ]);
        successResponse(res, { items, unread });
    }
    catch (error) {
        next(error);
    }
}
export async function markNotificationRead(req, res, next) {
    try {
        await Notification.updateOne({ _id: req.params.id, user: req.user._id }, { read: true });
        successResponse(res, null, "Marked as read");
    }
    catch (error) {
        next(error);
    }
}
export async function markAllNotificationsRead(req, res, next) {
    try {
        await Notification.updateMany({ user: req.user._id, read: false }, { read: true });
        successResponse(res, null, "All notifications marked as read");
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=notifications.controller.js.map