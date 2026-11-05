import { model, Schema, Types } from "mongoose";

export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "no-show";

export interface IAppointment {
  client: Types.ObjectId;
  barber: Types.ObjectId;
  service: Types.ObjectId;
  start: Date;
  end: Date;
  price: number;
  status: AppointmentStatus;
  notes?: string;
  cancelReason?: string;
  reminderSent: boolean;
  reviewed: boolean;
}

const appointmentSchema = new Schema<IAppointment>(
  {
    client: { type: Schema.Types.ObjectId, ref: "User", required: true },
    barber: { type: Schema.Types.ObjectId, ref: "User", required: true },
    service: { type: Schema.Types.ObjectId, ref: "Service", required: true },
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    price: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled", "no-show"],
      default: "confirmed",
    },
    notes: { type: String },
    cancelReason: { type: String },
    reminderSent: { type: Boolean, default: false },
    reviewed: { type: Boolean, default: false },
  },
  { timestamps: true },
);

appointmentSchema.index({ barber: 1, start: 1 });
appointmentSchema.index({ client: 1, start: -1 });

export const Appointment = model<IAppointment>(
  "Appointment",
  appointmentSchema,
);
