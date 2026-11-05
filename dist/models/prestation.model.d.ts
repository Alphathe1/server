import { Types } from "mongoose";
export declare const DEFAULT_COMMISSION_RATE = 0.5;
export type PaymentMethod = "cash" | "card";
export type PrestationSource = "caisse" | "appointment" | "manual";
export interface IPrestation {
    appointment?: Types.ObjectId;
    /** optional: walk-in sales at the register have no client file */
    client?: Types.ObjectId;
    barber: Types.ObjectId;
    service: Types.ObjectId;
    price: number;
    date: Date;
    cutType?: string;
    notes?: string;
    beforePhotos: string[];
    afterPhotos: string[];
    /** barber's share, snapshotted when the sale is recorded */
    commissionRate: number;
    commission: number;
    paymentMethod: PaymentMethod;
    source: PrestationSource;
    recordedBy?: Types.ObjectId;
    /** register receipt this haircut was paid on */
    ticket?: Types.ObjectId;
    ticketNumber?: number;
}
export declare const Prestation: import("mongoose").Model<IPrestation, {}, {}, {}, import("mongoose").Document<unknown, {}, IPrestation, {}, import("mongoose").DefaultSchemaOptions> & IPrestation & {
    _id: Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}, any, IPrestation & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
//# sourceMappingURL=prestation.model.d.ts.map