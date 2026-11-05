import type { Types } from "mongoose";
import { type NotificationType } from "../models/notification.model.js";
interface NotifyPayload {
    type: NotificationType;
    title: string;
    message: string;
    link?: string;
}
export declare function notify(users: (Types.ObjectId | string)[], payload: NotifyPayload): Promise<void>;
/** Owners and managers receive every shop-level event */
export declare function adminIds(): Promise<Types.ObjectId[]>;
export declare function formatSlot(date: Date): string;
export {};
//# sourceMappingURL=notify.d.ts.map