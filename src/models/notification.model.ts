import { model, Schema, Types } from "mongoose";

export type NotificationType =
  | "booking_confirmed"
  | "new_appointment"
  | "reminder"
  | "cancelled"
  | "modified"
  | "review";

export interface INotification {
  user: Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  read: boolean;
}

const notificationSchema = new Schema<INotification>(
  {
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
  },
  { timestamps: true },
);

notificationSchema.index({ user: 1, createdAt: -1 });

export const Notification = model<INotification>(
  "Notification",
  notificationSchema,
);
