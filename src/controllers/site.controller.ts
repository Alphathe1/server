import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { Types } from "mongoose";
import { SITE_DOC_ID, SiteContent, SiteMedia } from "../models/site.model.js";
import { errorResponse, successResponse } from "../utils/responseFormatter.js";
import { parseImageDataUrl, referencedMediaIds, type SiteContentInput } from "../validation/site.js";

/** An upload no published content refers to is deleted once it is this old: until then an editor draft may still use it */
const ORPHAN_AGE_MS = 24 * 60 * 60 * 1000;

const payload = (doc: { content: unknown; updatedAt: Date } | null) => ({
  content: doc?.content ?? null,
  updatedAt: doc ? doc.updatedAt.toISOString() : null,
});

/** GET /site — public. `content` is null while nothing has been published: the client then shows its default. */
export async function getSite(_req: Request, res: Response, next: NextFunction) {
  try {
    const doc = await SiteContent.findById(SITE_DOC_ID).lean();
    // revalidated on every visit: a publication shows up on the next page load
    res.set("Cache-Control", "no-cache");
    successResponse(res, payload(doc));
  } catch (error) {
    next(error);
  }
}

async function createFirst(content: SiteContentInput, author: Types.ObjectId) {
  try {
    return await SiteContent.create({ _id: SITE_DOC_ID, content, updatedBy: author });
  } catch (error) {
    // another device published first: the fixed _id already exists
    if ((error as { code?: number }).code === 11000) return null;
    throw error;
  }
}

/** Deletes uploads older than a day that the published content no longer uses */
async function removeOrphanMedia(content: unknown) {
  try {
    const used = referencedMediaIds(content).map((id) => new Types.ObjectId(id));
    await SiteMedia.deleteMany({ _id: { $nin: used }, createdAt: { $lt: new Date(Date.now() - ORPHAN_AGE_MS) } });
  } catch (error) {
    // the content is already saved: a failed cleanup must not turn the publication into an error
    console.error("Site media cleanup failed:", error);
  }
}

/** PUT /site — owner. Writes only if `baseUpdatedAt` is still the stored version: two devices never overwrite each other silently. */
export async function putSite(req: Request, res: Response, next: NextFunction) {
  try {
    const { content, baseUpdatedAt } = req.body as { content: SiteContentInput; baseUpdatedAt: string | null };
    const author = req.user!._id;
    const doc =
      baseUpdatedAt === null
        ? await createFirst(content, author)
        : await SiteContent.findOneAndUpdate(
            { _id: SITE_DOC_ID, updatedAt: new Date(baseUpdatedAt) },
            { $set: { content, updatedBy: author } },
            { returnDocument: "after" },
          );
    if (!doc) {
      errorResponse(res, "Le site a été modifié depuis un autre appareil.", StatusCodes.CONFLICT);
      return;
    }
    await removeOrphanMedia(content);
    successResponse(res, payload(doc), "Site published");
  } catch (error) {
    next(error);
  }
}

/** POST /site/media — owner. Real JPEG, PNG or WebP bytes only, 2 MB at most. */
export async function uploadMedia(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = parseImageDataUrl((req.body as { dataUrl: string }).dataUrl);
    if (!parsed.ok) {
      errorResponse(res, parsed.error, parsed.status);
      return;
    }
    const media = await SiteMedia.create({ data: parsed.data, mime: parsed.mime, size: parsed.data.length, author: req.user!._id });
    successResponse(res, { url: `/site/media/${media._id.toString()}` }, "Image uploaded", StatusCodes.CREATED);
  } catch (error) {
    next(error);
  }
}

/** GET /site/media/:id — public. An id never changes content, so browsers keep the image for a year. */
export async function getMedia(req: Request, res: Response, next: NextFunction) {
  try {
    const media = await SiteMedia.findById(req.params.id).select("data mime");
    if (!media) {
      errorResponse(res, "Image not found", StatusCodes.NOT_FOUND);
      return;
    }
    res.set({
      "Content-Type": media.mime,
      "Cache-Control": "public, max-age=31536000, immutable",
      // public images, may be embedded by a site served from another origin (helmet defaults to same-origin)
      "Cross-Origin-Resource-Policy": "cross-origin",
    });
    res.send(media.data);
  } catch (error) {
    next(error);
  }
}
