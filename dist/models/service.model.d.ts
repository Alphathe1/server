export interface IService {
    name: string;
    description?: string;
    price: number;
    duration: number;
    category: string;
    imageUrl?: string;
    isActive: boolean;
}
export declare const Service: import("mongoose").Model<IService, {}, {}, {}, import("mongoose").Document<unknown, {}, IService, {}, import("mongoose").DefaultSchemaOptions> & IService & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}, any, IService & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
//# sourceMappingURL=service.model.d.ts.map