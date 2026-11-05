export type Role = "owner" | "manager" | "barber" | "client";
export interface IWorkingHours {
    day: number;
    start: string;
    end: string;
}
export interface IUser {
    email: string;
    username: string;
    password: string;
    role: Role;
    phone?: string;
    avatarUrl?: string;
    bio?: string;
    specialties?: string[];
    workingHours?: IWorkingHours[];
    /** share of each haircut paid to the barber (0.5 = 50%) */
    commissionRate?: number;
    preferences?: string;
    staffNotes?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    isAdmin: boolean;
}
export interface IUserMethods {
    comparePassword(plain: string): Promise<boolean>;
}
//# sourceMappingURL=user.d.ts.map