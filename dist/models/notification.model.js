import { model, Schema, Types } from "mongoose";
const notificationSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: {
        type: String,
        enum: [
            "booking_confirmed",
            "new_appointment",
            "reminder",
            "cancelled",
            "modified",
            "review",
        ],
        required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String },
    read: { type: Boolean, default: false },
}, { timestamps: true });
notificationSchema.index({ user: 1, createdAt: -1 });
export const Notification = model("Notification", notificationSchema);
//# sourceMappingURL=notification.model.js.map