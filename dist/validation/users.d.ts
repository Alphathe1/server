import { z } from "zod/v4";
export declare const loginSchema: z.ZodObject<{
    email: z.ZodEmail;
    password: z.ZodString;
}, z.core.$strip>;
export declare const userSchema: z.ZodObject<{
    email: z.ZodEmail;
    password: z.ZodString;
    username: z.ZodString;
    phone: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<string | undefined, string | undefined>>;
    avatarUrl: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<string | undefined, string | undefined>>;
    bio: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<string | undefined, string | undefined>>;
}, z.core.$strip>;
export declare const fullUserSchema: z.ZodObject<{
    email: z.ZodEmail;
    password: z.ZodString;
    username: z.ZodString;
    phone: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<string | undefined, string | undefined>>;
    avatarUrl: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<string | undefined, string | undefined>>;
    bio: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<string | undefined, string | undefined>>;
    role: z.ZodOptional<z.ZodEnum<{
        barber: "barber";
        client: "client";
        manager: "manager";
        owner: "owner";
    }>>;
    specialties: z.ZodOptional<z.ZodArray<z.ZodString>>;
    workingHours: z.ZodOptional<z.ZodArray<z.ZodObject<{
        day: z.ZodNumber;
        start: z.ZodString;
        end: z.ZodString;
    }, z.core.$strip>>>;
}, z.core.$strip>;
/** Admin update: every field optional, password optional */
export declare const adminUpdateUserSchema: z.ZodObject<{
    email: z.ZodOptional<z.ZodEmail>;
    username: z.ZodOptional<z.ZodString>;
    password: z.ZodOptional<z.ZodString>;
    role: z.ZodOptional<z.ZodEnum<{
        barber: "barber";
        client: "client";
        manager: "manager";
        owner: "owner";
    }>>;
    phone: z.ZodOptional<z.ZodString>;
    avatarUrl: z.ZodOptional<z.ZodString>;
    bio: z.ZodOptional<z.ZodString>;
    specialties: z.ZodOptional<z.ZodArray<z.ZodString>>;
    workingHours: z.ZodOptional<z.ZodArray<z.ZodObject<{
        day: z.ZodNumber;
        start: z.ZodString;
        end: z.ZodString;
    }, z.core.$strip>>>;
    isActive: z.ZodOptional<z.ZodBoolean>;
    preferences: z.ZodOptional<z.ZodString>;
    staffNotes: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const updateProfileSchema: z.ZodObject<{
    username: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    avatarUrl: z.ZodOptional<z.ZodString>;
    bio: z.ZodOptional<z.ZodString>;
    preferences: z.ZodOptional<z.ZodString>;
    specialties: z.ZodOptional<z.ZodArray<z.ZodString>>;
    workingHours: z.ZodOptional<z.ZodArray<z.ZodObject<{
        day: z.ZodNumber;
        start: z.ZodString;
        end: z.ZodString;
    }, z.core.$strip>>>;
}, z.core.$strip>;
export declare const changePasswordSchema: z.ZodObject<{
    currentPassword: z.ZodString;
    newPassword: z.ZodString;
}, z.core.$strip>;
export declare const createClientSchema: z.ZodObject<{
    username: z.ZodString;
    email: z.ZodEmail;
    phone: z.ZodOptional<z.ZodString>;
    preferences: z.ZodOptional<z.ZodString>;
    staffNotes: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const clientNotesSchema: z.ZodObject<{
    staffNotes: z.ZodOptional<z.ZodString>;
    preferences: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
//# sourceMappingURL=users.d.ts.map