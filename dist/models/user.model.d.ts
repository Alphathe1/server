import { Model } from "mongoose";
import type { IUser, IUserMethods } from "../types/user.js";
type UserModel = Model<IUser, Record<string, never>, IUserMethods>;
export declare const DEFAULT_HOURS: {
    day: number;
    start: string;
    end: string;
}[];
export declare const User: UserModel;
export {};
//# sourceMappingURL=user.model.d.ts.map