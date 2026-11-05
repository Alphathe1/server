import { model, Schema, Types } from "mongoose";

export interface IReview {
  client: Types.ObjectId;
  barber: Types.ObjectId;
  appointment: Types.ObjectId;
  rating: number;
  comment?: string;
}

const reviewSchema = new Schema<IReview>(
  {
    client: { type: Schema.Types.ObjectId, ref: "User", required: true },
    barber: { type: Schema.Types.ObjectId, ref: "User", required: true },
    appointment: {
      type: Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
      unique: true,
    },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, maxlength: 1000 },
  },
  { timestamps: true },
);

export const Review = model<IReview>("Review", reviewSchema);
