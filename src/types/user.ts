export type Role = "owner" | "manager" | "barber" | "client";

export interface IWorkingHours {
  day: number; // 0 = Sunday ... 6 = Saturday
  start: string; // "09:00"
  end: string; // "19:00"
}

export interface IUser {
  email: string;
  username: string;
  password: string;
  role: Role;
  phone?: string;
  avatarUrl?: string;
  bio?: string;
  // barber fields
  specialties?: string[];
  workingHours?: IWorkingHours[];
  /** share of each haircut paid to the barber (0.5 = 50%) */
  commissionRate?: number;
  // client fields
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
