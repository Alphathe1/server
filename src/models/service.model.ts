import { model, Schema } from "mongoose";

export interface IService {
  name: string;
  description?: string;
  price: number;
  duration: number; // minutes
  category: string;
  imageUrl?: string;
  isActive: boolean;
}

const serviceSchema = new Schema<IService>(
  {
    name: { type: String, required: true, trim: true, unique: true },
    description: { type: String },
    price: { type: Number, required: true, min: 0 },
    duration: { type: Number, required: true, min: 5 },
    category: { type: String, default: "Coupe", trim: true },
    imageUrl: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const Service = model<IService>("Service", serviceSchema);
