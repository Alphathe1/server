import type { Types } from "mongoose";
import {
  Notification,
  type NotificationType,
} from "../models/notification.model.js";
import { User } from "../models/user.model.js";

interface NotifyPayload {
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
}

export async function notify(
  users: (Types.ObjectId | string)[],
  payload: NotifyPayload,
): Promise<void> {
  const unique = [...new Set(users.map((u) => u.toString()))];
  if (!unique.length) return;
  await Notification.insertMany(unique.map((user) => ({ user, ...payload })));
}

/** Owners and managers receive every shop-level event */
export async function adminIds(): Promise<Types.ObjectId[]> {
  const admins = await User.find({
    role: { $in: ["owner", "manager"] },
    isActive: true,
  }).select("_id");
  return admins.map((a) => a._id);
}

export function formatSlot(date: Date): string {
  return date.toLocaleString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}
