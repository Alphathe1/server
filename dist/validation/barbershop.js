import { z } from "zod/v4";
const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid id");
export const idParamSchema = z.object({ id: objectId });
export const serviceSchema = z.object({
    name: z.string().min(2, "Name is too short").max(80).trim(),
    description: z.string().max(500).optional(),
    price: z.number().min(0, "Price must be positive"),
    duration: z.number().int().min(5, "Duration must be at least 5 minutes"),
    category: z.string().max(40).optional(),
    imageUrl: z.string().optional(),
    isActive: z.boolean().optional(),
});
export const updateServiceSchema = serviceSchema.partial();
export const availabilityQuerySchema = z.object({
    barber: objectId,
    service: objectId,
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD"),
    exclude: objectId.optional(),
});
export const createAppointmentSchema = z.object({
    barber: objectId,
    service: objectId,
    start: z.coerce.date(),
    notes: z.string().max(500).optional(),
    /** Staff can book on behalf of a client */
    client: objectId.optional(),
});
export const rescheduleAppointmentSchema = z.object({
    barber: objectId.optional(),
    service: objectId.optional(),
    start: z.coerce.date().optional(),
    notes: z.string().max(500).optional(),
});
export const appointmentStatusSchema = z.object({
    status: z.enum(["pending", "confirmed", "completed", "cancelled", "no-show"]),
    cancelReason: z.string().max(300).optional(),
});
export const prestationSchema = z.object({
    appointment: objectId.optional(),
    client: objectId,
    barber: objectId.optional(),
    service: objectId,
    price: z.number().min(0).optional(),
    date: z.coerce.date().optional(),
    cutType: z.string().max(60).optional(),
    notes: z.string().max(2000).optional(),
    beforePhotos: z.array(z.string()).max(6).optional(),
    afterPhotos: z.array(z.string()).max(6).optional(),
});
export const updatePrestationSchema = prestationSchema
    .omit({ client: true, appointment: true })
    .partial();
export const portfolioSchema = z.object({
    imageUrl: z.string().min(1, "Image is required"),
    title: z.string().max(80).optional(),
    cutType: z.string().min(2, "Cut type is required").max(60),
    description: z.string().max(500).optional(),
    barber: objectId.optional(),
});
export const reviewSchema = z.object({
    appointment: objectId,
    rating: z.number().int().min(1).max(5),
    comment: z.string().max(1000).optional(),
});
export const saleSchema = z.object({
    barber: objectId,
    service: objectId,
    /** override the catalogue price (DZD), e.g. a discount */
    price: z.number().int("Price must be a whole number of dinars").min(0).optional(),
    paymentMethod: z.enum(["cash", "card"]).optional(),
    client: objectId.optional(),
    notes: z.string().max(500).optional(),
});
export const ticketSchema = z.object({
    lines: z
        .array(z.object({
        service: objectId,
        barber: objectId,
        /** override the catalogue price (DZD) */
        unitPrice: z.number().int().min(0).optional(),
        quantity: z.number().int().min(1).max(20),
    }))
        .min(1, "Le ticket est vide")
        .max(50),
    discount: z.number().int().min(0).optional(),
    paymentMethod: z.enum(["cash", "card"]),
    cashGiven: z.number().int().min(0).optional(),
    client: objectId.optional(),
});
const dateKey = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD");
export const registerQuerySchema = z.object({
    from: dateKey.optional(),
    to: dateKey.optional(),
});
export const statsQuerySchema = z.object({
    range: z.enum(["day", "week", "month"]).default("week"),
    barber: objectId.optional(),
});
//# sourceMappingURL=barbershop.js.map