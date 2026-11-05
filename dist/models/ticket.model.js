import { model, Schema, Types } from "mongoose";
const ticketSchema = new Schema({
    number: { type: Number, required: true },
    day: { type: String, required: true },
    lines: [
        {
            _id: false,
            service: { type: Schema.Types.ObjectId, ref: "Service", required: true },
            serviceName: { type: String, required: true },
            barber: { type: Schema.Types.ObjectId, ref: "User", required: true },
            barberName: { type: String, required: true },
            unitPrice: { type: Number, required: true, min: 0 },
            quantity: { type: Number, required: true, min: 1 },
        },
    ],
    subtotal: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, enum: ["cash", "card"], default: "cash" },
    cashGiven: { type: Number, min: 0 },
    change: { type: Number, min: 0 },
    client: { type: Schema.Types.ObjectId, ref: "User" },
    cashier: { type: Schema.Types.ObjectId, ref: "User", required: true },
    prestations: [{ type: Schema.Types.ObjectId, ref: "Prestation" }],
}, { timestamps: true });
ticketSchema.index({ day: 1, number: 1 }, { unique: true });
export const Ticket = model("Ticket", ticketSchema);
//# sourceMappingURL=ticket.model.js.map