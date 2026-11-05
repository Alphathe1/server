import { model, Schema, Types } from "mongoose";

export interface IPortfolioItem {
  barber: Types.ObjectId;
  imageUrl: string;
  title?: string;
  cutType: string;
  description?: string;
}

const portfolioSchema = new Schema<IPortfolioItem>(
  {
    barber: { type: Schema.Types.ObjectId, ref: "User", required: true },
    imageUrl: { type: String, required: true },
    title: { type: String, trim: true },
    cutType: { type: String, required: true, trim: true },
    description: { type: String },
  },
  { timestamps: true },
);

export const PortfolioItem = model<IPortfolioItem>(
  "PortfolioItem",
  portfolioSchema,
);
