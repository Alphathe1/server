import { Types } from "mongoose";
import type { PaymentMethod } from "./prestation.model.js";
export interface ITicketLine {
    service: Types.ObjectId;
    serviceName: string;
    barber: Types.ObjectId;
    barberName: string;
    unitPrice: number;
    quantity: number;
}
/** One paid receipt at the register; each haircut on it is also a Prestation */
export interface ITicket {
    number: number;
    day: string;
    lines: ITicketLine[];
    subtotal: number;
    discount: number;
    total: number;
    paymentMethod: PaymentMethod;
    cashGiven?: number;
    change?: number;
    client?: Types.ObjectId;
    cashier: Types.ObjectId;
    prestations: Types.ObjectId[];
}
export declare const Ticket: import("mongoose").Model<ITicket, {}, {}, {}, import("mongoose").Document<unknown, {}, ITicket, {}, import("mongoose").DefaultSchemaOptions> & ITicket & {
    _id: Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}, any, ITicket & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
//# sourceMappingURL=ticket.model.d.ts.map