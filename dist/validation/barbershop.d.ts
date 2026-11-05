import { z } from "zod/v4";
export declare const idParamSchema: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
export declare const serviceSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    price: z.ZodNumber;
    duration: z.ZodNumber;
    category: z.ZodOptional<z.ZodString>;
    imageUrl: z.ZodOptional<z.ZodString>;
    isActive: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export declare const updateServiceSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    price: z.ZodOptional<z.ZodNumber>;
    duration: z.ZodOptional<z.ZodNumber>;
    category: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    imageUrl: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    isActive: z.ZodOptional<z.ZodOptional<z.ZodBoolean>>;
}, z.core.$strip>;
export declare const availabilityQuerySchema: z.ZodObject<{
    barber: z.ZodString;
    service: z.ZodString;
    date: z.ZodString;
    exclude: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const createAppointmentSchema: z.ZodObject<{
    barber: z.ZodString;
    service: z.ZodString;
    start: z.ZodCoercedDate<unknown>;
    notes: z.ZodOptional<z.ZodString>;
    client: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const rescheduleAppointmentSchema: z.ZodObject<{
    barber: z.ZodOptional<z.ZodString>;
    service: z.ZodOptional<z.ZodString>;
    start: z.ZodOptional<z.ZodCoercedDate<unknown>>;
    notes: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const appointmentStatusSchema: z.ZodObject<{
    status: z.ZodEnum<{
        cancelled: "cancelled";
        completed: "completed";
        confirmed: "confirmed";
        "no-show": "no-show";
        pending: "pending";
    }>;
    cancelReason: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const prestationSchema: z.ZodObject<{
    appointment: z.ZodOptional<z.ZodString>;
    client: z.ZodString;
    barber: z.ZodOptional<z.ZodString>;
    service: z.ZodString;
    price: z.ZodOptional<z.ZodNumber>;
    date: z.ZodOptional<z.ZodCoercedDate<unknown>>;
    cutType: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
    beforePhotos: z.ZodOptional<z.ZodArray<z.ZodString>>;
    afterPhotos: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strip>;
export declare const updatePrestationSchema: z.ZodObject<{
    barber: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    service: z.ZodOptional<z.ZodString>;
    price: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    date: z.ZodOptional<z.ZodOptional<z.ZodCoercedDate<unknown>>>;
    cutType: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    notes: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    beforePhotos: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString>>>;
    afterPhotos: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString>>>;
}, z.core.$strip>;
export declare const portfolioSchema: z.ZodObject<{
    imageUrl: z.ZodString;
    title: z.ZodOptional<z.ZodString>;
    cutType: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    barber: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const reviewSchema: z.ZodObject<{
    appointment: z.ZodString;
    rating: z.ZodNumber;
    comment: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const saleSchema: z.ZodObject<{
    barber: z.ZodString;
    service: z.ZodString;
    price: z.ZodOptional<z.ZodNumber>;
    paymentMethod: z.ZodOptional<z.ZodEnum<{
        card: "card";
        cash: "cash";
    }>>;
    client: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const ticketSchema: z.ZodObject<{
    lines: z.ZodArray<z.ZodObject<{
        service: z.ZodString;
        barber: z.ZodString;
        unitPrice: z.ZodOptional<z.ZodNumber>;
        quantity: z.ZodNumber;
    }, z.core.$strip>>;
    discount: z.ZodOptional<z.ZodNumber>;
    paymentMethod: z.ZodEnum<{
        card: "card";
        cash: "cash";
    }>;
    cashGiven: z.ZodOptional<z.ZodNumber>;
    client: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const registerQuerySchema: z.ZodObject<{
    from: z.ZodOptional<z.ZodString>;
    to: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const statsQuerySchema: z.ZodObject<{
    range: z.ZodDefault<z.ZodEnum<{
        day: "day";
        month: "month";
        week: "week";
    }>>;
    barber: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
//# sourceMappingURL=barbershop.d.ts.map