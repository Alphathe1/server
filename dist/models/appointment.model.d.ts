import { Types } from "mongoose";
export type AppointmentStatus = "pending" | "confirmed" | "completed" | "cancelled" | "no-show";
export interface IAppointment {
    client: Types.ObjectId;
    barber: Types.ObjectId;
    service: Types.ObjectId;
    start: Date;
    end: Date;
    price: number;
    status: AppointmentStatus;
    notes?: string;
    cancelReason?: string;
    reminderSent: boolean;
    reviewed: boolean;
}
export declare const Appointment: import("mongoose").Model<IAppointment, {}, {}, {}, import("mongoose").Document<unknown, {}, IAppointment, {}, import("mongoose").DefaultSchemaOptions> & IAppointment & {
    _id: Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}, any, IAppointment & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
//# sourceMappingURL=appointment.model.d.ts.map