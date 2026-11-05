import { Types } from "mongoose";
export interface IPortfolioItem {
    barber: Types.ObjectId;
    imageUrl: string;
    title?: string;
    cutType: string;
    description?: string;
}
export declare const PortfolioItem: import("mongoose").Model<IPortfolioItem, {}, {}, {}, import("mongoose").Document<unknown, {}, IPortfolioItem, {}, import("mongoose").DefaultSchemaOptions> & IPortfolioItem & {
    _id: Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}, any, IPortfolioItem & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
//# sourceMappingURL=portfolio.model.d.ts.map