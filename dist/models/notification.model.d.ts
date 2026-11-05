import { Types } from "mongoose";
export type NotificationType = "booking_confirmed" | "new_appointment" | "reminder" | "cancelled" | "modified" | "review";
export interface INotification {
    user: Types.ObjectId;
    type: NotificationType;
    title: string;
    message: string;
    link?: string;
    read: boolean;
}
export declare const Notification: import("mongoose").Model<INotification, {}, {}, {}, import("mongoose").Document<unknown, {}, INotification, {}, import("mongoose").DefaultSchemaOptions> & INotification & {
    _id: Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}, any, INotification & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
//# sourceMappingURL=notification.model.d.ts.map