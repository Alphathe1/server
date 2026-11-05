import type { Types } from "mongoose";
import type { IWorkingHours, Role } from "./user.js";

declare global {
  namespace Express {
    interface Request {
      user?: {
        _id: Types.ObjectId;
        email: string;
        username: string;
        role: Role;
        /** Virtual: true when role is 'owner' or 'manager'. Populated by Mongoose virtual. */
        isAdmin: boolean;
        phone?: string;
        avatarUrl?: string;
        bio?: string;
        specialties?: string[];
        workingHours?: IWorkingHours[];
        preferences?: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
      };
      parsedQuery?: unknown;
    }
  }
}
