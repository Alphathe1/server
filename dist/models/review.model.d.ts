import { Types } from "mongoose";
export interface IReview {
    client: Types.ObjectId;
    barber: Types.ObjectId;
    appointment: Types.ObjectId;
    rating: number;
    comment?: string;
}
export declare const Review: import("mongoose").Model<IReview, {}, {}, {}, import("mongoose").Document<unknown, {}, IReview, {}, import("mongoose").DefaultSchemaOptions> & IReview & {
    _id: Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}, any, IReview & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
//# sourceMappingURL=review.model.d.ts.map