import { model, Schema, Types } from "mongoose";

/** The site content is a single document with this fixed id */
export const SITE_DOC_ID = "site";

export interface ISiteContent {
  _id: string;
  /** validated by validation/site.ts before it gets here */
  content: Record<string, unknown>;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const siteContentSchema = new Schema<ISiteContent>(
  {
    _id: { type: String, default: SITE_DOC_ID },
    content: { type: Schema.Types.Mixed, required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  // explicit collection names: Mongoose would pluralise "SiteMedia" into "sitemedias"
  { timestamps: true, collection: "sitecontents", minimize: false },
);

export const SiteContent = model<ISiteContent>("SiteContent", siteContentSchema);

export type SiteMediaMime = "image/jpeg" | "image/png" | "image/webp";

/** An image uploaded by the owner, served by GET /site/media/:id so that GET /site stays small */
export interface ISiteMedia {
  data: Buffer;
  mime: SiteMediaMime;
  /** bytes */
  size: number;
  author: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const siteMediaSchema = new Schema<ISiteMedia>(
  {
    data: { type: Buffer, required: true },
    mime: { type: String, enum: ["image/jpeg", "image/png", "image/webp"], required: true },
    size: { type: Number, required: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true, collection: "sitemedia" },
);

export const SiteMedia = model<ISiteMedia>("SiteMedia", siteMediaSchema);
