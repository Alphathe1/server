import { z } from "zod/v4";
const passwordRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}$/;
const optionalString = (max, message) => z
    .string()
    .max(max, message)
    .optional()
    .transform((val) => val ?? undefined);
export const loginSchema = z.object({
    email: z.email("Email must be valid").trim().toLowerCase(),
    password: z.string().regex(passwordRegex, "Password isn't strong enough."),
});
export const userSchema = loginSchema.extend({
    username: z
        .string()
        .min(3, "Username must have at least 3 characters")
        .max(50, "Username must have at most 50 characters")
        .trim(),
    phone: optionalString(30, "Phone must be at most 30 characters"),
    avatarUrl: z
        .string()
        .optional()
        .transform((val) => val ?? undefined),
    bio: optionalString(300, "Bio must be at most 300 characters"),
});
const workingHoursSchema = z.array(z.object({
    day: z.number().int().min(0).max(6),
    start: z.string().regex(/^\d{2}:\d{2}$/, "Use HH:mm"),
    end: z.string().regex(/^\d{2}:\d{2}$/, "Use HH:mm"),
}));
export const fullUserSchema = userSchema.extend({
    role: z.enum(["owner", "manager", "barber", "client"]).optional(),
    specialties: z.array(z.string().trim()).optional(),
    workingHours: workingHoursSchema.optional(),
});
/** Admin update: every field optional, password optional */
export const adminUpdateUserSchema = z.object({
    email: z.email("Email must be valid").trim().toLowerCase().optional(),
    username: z.string().min(3).max(50).trim().optional(),
    password: z
        .string()
        .regex(passwordRegex, "Password isn't strong enough.")
        .optional(),
    role: z.enum(["owner", "manager", "barber", "client"]).optional(),
    phone: z.string().max(30).optional(),
    avatarUrl: z.string().optional(),
    bio: z.string().max(300).optional(),
    specialties: z.array(z.string().trim()).optional(),
    workingHours: workingHoursSchema.optional(),
    isActive: z.boolean().optional(),
    preferences: z.string().max(1000).optional(),
    staffNotes: z.string().max(2000).optional(),
});
export const updateProfileSchema = z.object({
    username: z.string().min(3).max(50).trim().optional(),
    phone: z.string().max(30).optional(),
    avatarUrl: z.string().optional(),
    bio: z.string().max(300).optional(),
    preferences: z.string().max(1000).optional(),
    specialties: z.array(z.string().trim()).optional(),
    workingHours: workingHoursSchema.optional(),
});
export const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
        .string()
        .regex(passwordRegex, "Password isn't strong enough."),
});
export const createClientSchema = z.object({
    username: z.string().min(3).max(50).trim(),
    email: z.email("Email must be valid").trim().toLowerCase(),
    phone: z.string().max(30).optional(),
    preferences: z.string().max(1000).optional(),
    staffNotes: z.string().max(2000).optional(),
});
export const clientNotesSchema = z.object({
    staffNotes: z.string().max(2000).optional(),
    preferences: z.string().max(1000).optional(),
});
//# sourceMappingURL=users.js.map