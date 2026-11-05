import { model, Schema } from "mongoose";
const serviceSchema = new Schema({
    name: { type: String, required: true, trim: true, unique: true },
    description: { type: String },
    price: { type: Number, required: true, min: 0 },
    duration: { type: Number, required: true, min: 5 },
    category: { type: String, default: "Coupe", trim: true },
    imageUrl: { type: String },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });
export const Service = model("Service", serviceSchema);
//# sourceMappingURL=service.model.js.map