import { model, Schema, Types } from "mongoose";
import { User } from "./user.model.js";

export const DEFAULT_COMMISSION_RATE = 0.5;

export type PaymentMethod = "cash" | "card";
export type PrestationSource = "caisse" | "appointment" | "manual";

export interface IPrestation {
  appointment?: Types.ObjectId;
  /** optional: walk-in sales at the register have no client file */
  client?: Types.ObjectId;
  barber: Types.ObjectId;
  service: Types.ObjectId;
  price: number; // DZD
  date: Date;
  cutType?: string;
  notes?: string;
  beforePhotos: string[];
  afterPhotos: string[];
  /** barber's share, snapshotted when the sale is recorded */
  commissionRate: number;
  commission: number;
  paymentMethod: PaymentMethod;
  source: PrestationSource;
  recordedBy?: Types.ObjectId;
  /** register receipt this haircut was paid on */
  ticket?: Types.ObjectId;
  ticketNumber?: number;
}

const prestationSchema = new Schema<IPrestation>(
  {
    appointment: { type: Schema.Types.ObjectId, ref: "Appointment" },
    client: { type: Schema.Types.ObjectId, ref: "User" },
    barber: { type: Schema.Types.ObjectId, ref: "User", required: true },
    service: { type: Schema.Types.ObjectId, ref: "Service", required: true },
    price: { type: Number, required: true, min: 0 },
    date: { type: Date, default: Date.now },
    cutType: { type: String, trim: true },
    notes: { type: String },
    beforePhotos: [{ type: String }],
    afterPhotos: [{ type: String }],
    commissionRate: { type: Number, min: 0, max: 1 },
    commission: { type: Number, min: 0, default: 0 },
    paymentMethod: { type: String, enum: ["cash", "card"], default: "cash" },
    source: {
      type: String,
      enum: ["caisse", "appointment", "manual"],
      default: "manual",
    },
    recordedBy: { type: Schema.Types.ObjectId, ref: "User" },
    ticket: { type: Schema.Types.ObjectId, ref: "Ticket" },
    ticketNumber: { type: Number },
  },
  { timestamps: true },
);

prestationSchema.index({ client: 1, date: -1 });
prestationSchema.index({ barber: 1, date: -1 });
prestationSchema.index({ date: -1 });

// every recorded haircut pays the barber their commission (50% by default)
prestationSchema.pre("save", async function () {
  if (this.commissionRate == null) {
    const barber = await User.findById(this.barber).select("commissionRate");
    this.commissionRate = barber?.commissionRate ?? DEFAULT_COMMISSION_RATE;
  }
  if (this.isNew || this.isModified("price") || this.isModified("commissionRate")) {
    this.commission = Math.round(this.price * this.commissionRate);
  }
});

export const Prestation = model<IPrestation>("Prestation", prestationSchema);
