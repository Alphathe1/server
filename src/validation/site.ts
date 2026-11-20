import { z } from "zod/v4";
import { StatusCodes } from "http-status-codes";

/** Field limits (spec §6.2). client/src/lib/site/validate.ts declares the same table; tests/site.test.ts checks both match. */
export const LIMITS = {
  tagline: 90,
  description: 200,
  phoneMin: 6,
  phoneMax: 24,
  address: 140,
  url: 500,
  hoursSummary: 60,
  announcementText: 140,
  announcementLinkLabel: 30,
  heroTitle: 90,
  heroText: 240,
  heroCta: 24,
  featuresMin: 2,
  featuresMax: 4,
  featureTitle: 40,
  featureText: 140,
  salonKicker: 30,
  salonTitle: 70,
  salonPointsMin: 1,
  salonPointsMax: 3,
  salonPointTitle: 50,
  salonPointText: 240,
  salonImagesMax: 2,
  pricesTitle: 50,
  pricesText: 160,
  highlightsMin: 1,
  highlightsMax: 2,
  highlightTitle: 50,
  highlightText: 160,
  teamTitle: 50,
  teamText: 160,
  invitationTitle: 70,
  invitationText: 160,
  invitationSign: 50,
  pageTitle: 40,
  pageText: 200,
} as const;

/** Same sources as the client's PATTERNS (checked by tests/site.test.ts) */
export const PATTERNS = {
  phone: /^[0-9 +().-]+$/,
  time: /^([01]\d|2[0-3]):[0-5]\d$/,
  https: /^https:\/\/[^\s"'<>]+$/,
  /** "/…" inside the site; "//host" and "/\host" would leave it (browsers read a backslash as a slash) */
  internalPath: /^\/(?!\/)[^\s"'<>\\]*$/,
  mediaPath: /^\/site\/media\/[a-f0-9]{24}$/,
  imagesPath: /^\/images\/[\w-]+(?:\/[\w-]+)*\.(?:jpe?g|png|webp)$/,
} as const;

export const HOME_SECTION_IDS = ["hero", "features", "salon", "prices", "highlights", "team", "testimonial", "invitation"] as const;
export const FEATURE_ICONS = ["scissors", "drop", "shield", "ruler", "star", "clock", "armchair", "sparkle", "towel", "dryer", "medal", "coffee"] as const;

/** The editor shows these when a publication is refused (same wording as the client's MESSAGES) */
const MESSAGES = {
  required: "Champ obligatoire.",
  max: (n: number) => `${n} caractères au maximum.`,
  count: (min: number, max: number) => (min === 0 ? `${max} au maximum.` : `De ${min} à ${max} éléments.`),
  phone: "De 6 à 24 caractères : chiffres, espaces et + ( ) . -",
  link: "Adresse commençant par https://, ou rien.",
  linkOrPath: "Adresse commençant par https://, ou chemin du site commençant par /.",
  image: "Image envoyée, adresse https:// ou chemin /images/…",
  imageRequired: "Choisissez une image ou retirez cet emplacement.",
  icon: "Icône inconnue.",
  time: "Heure au format HH:mm, par exemple 09:00.",
  timeOrder: "L'heure de fermeture doit suivre l'heure d'ouverture.",
  day: "Jour inconnu.",
  days: "Les sept jours doivent figurer une fois chacun.",
  order: "Chaque section doit figurer une fois.",
  section: "Section inconnue.",
  hidden: "Section masquée en double.",
  linkTo: "Indiquez où mène le lien.",
  linkLabel: "Indiquez le texte du lien.",
};

const isLink = (v: string) => v === "" || PATTERNS.https.test(v);
const isLinkOrPath = (v: string) => isLink(v) || PATTERNS.internalPath.test(v);
const isImage = (v: string) => v === "" || PATTERNS.https.test(v) || PATTERNS.mediaPath.test(v) || PATTERNS.imagesPath.test(v);
const unique = (list: readonly unknown[]) => new Set(list).size === list.length;

const text = (max: number) => z.string().max(max, MESSAGES.max(max));
const required = (max: number) => text(max).refine((v) => v.trim() !== "", MESSAGES.required);
const url = (ok: (v: string) => boolean, message: string) => text(LIMITS.url).refine(ok, message);
const image = url(isImage, MESSAGES.image);
const filledImage = image.refine((v) => v !== "", MESSAGES.imageRequired);
const time = z.string().regex(PATTERNS.time, MESSAGES.time);
const sectionId = z.enum(HOME_SECTION_IDS, { error: MESSAGES.section });
const list = <T extends z.ZodType>(item: T, min: number, max: number) =>
  z.array(item).min(min, MESSAGES.count(min, max)).max(max, MESSAGES.count(min, max));

const day = z
  .strictObject({
    day: z.number().int(MESSAGES.day).min(0, MESSAGES.day).max(6, MESSAGES.day),
    open: z.boolean(),
    start: time,
    end: time,
  })
  .refine((d) => !d.open || d.start < d.end, { error: MESSAGES.timeOrder, path: ["end"] });

const copy = (titleMax: number, textMax: number) => z.strictObject({ title: required(titleMax), text: required(textMax) });

export const siteContentSchema = z.strictObject({
  identity: z.strictObject({ tagline: required(LIMITS.tagline), description: required(LIMITS.description) }),
  contact: z.strictObject({
    phone: z.string().min(LIMITS.phoneMin, MESSAGES.phone).max(LIMITS.phoneMax, MESSAGES.phone).regex(PATTERNS.phone, MESSAGES.phone),
    address: text(LIMITS.address),
    mapsUrl: url(isLink, MESSAGES.link),
    instagram: url(isLink, MESSAGES.link),
    tiktok: url(isLink, MESSAGES.link),
  }),
  hours: z.strictObject({
    detailed: z.boolean(),
    summary: required(LIMITS.hoursSummary),
    days: z
      .array(day)
      .length(7, MESSAGES.days)
      .refine((days) => unique(days.map((d) => d.day)), MESSAGES.days),
  }),
  announcement: z
    .strictObject({
      enabled: z.boolean(),
      text: text(LIMITS.announcementText),
      linkLabel: text(LIMITS.announcementLinkLabel),
      linkTo: url(isLinkOrPath, MESSAGES.linkOrPath),
    })
    .superRefine((a, ctx) => {
      if (a.enabled && a.text.trim() === "") ctx.addIssue({ code: "custom", path: ["text"], message: MESSAGES.required });
      if (a.linkLabel.trim() !== "" && a.linkTo === "") ctx.addIssue({ code: "custom", path: ["linkTo"], message: MESSAGES.linkTo });
      if (a.linkTo !== "" && a.linkLabel.trim() === "") ctx.addIssue({ code: "custom", path: ["linkLabel"], message: MESSAGES.linkLabel });
    }),
  home: z.strictObject({
    order: z.array(sectionId).length(HOME_SECTION_IDS.length, MESSAGES.order).refine(unique, MESSAGES.order),
    hidden: z.array(sectionId).max(HOME_SECTION_IDS.length, MESSAGES.hidden).refine(unique, MESSAGES.hidden),
    hero: z.strictObject({ title: required(LIMITS.heroTitle), text: required(LIMITS.heroText), image, cta: required(LIMITS.heroCta) }),
    features: z.strictObject({
      items: list(
        z.strictObject({ icon: z.enum(FEATURE_ICONS, { error: MESSAGES.icon }), title: required(LIMITS.featureTitle), text: required(LIMITS.featureText) }),
        LIMITS.featuresMin,
        LIMITS.featuresMax,
      ),
    }),
    salon: z.strictObject({
      kicker: required(LIMITS.salonKicker),
      title: required(LIMITS.salonTitle),
      points: list(copy(LIMITS.salonPointTitle, LIMITS.salonPointText), LIMITS.salonPointsMin, LIMITS.salonPointsMax),
      images: list(filledImage, 0, LIMITS.salonImagesMax),
    }),
    prices: copy(LIMITS.pricesTitle, LIMITS.pricesText),
    highlights: z.strictObject({
      items: list(
        z.strictObject({ image, title: required(LIMITS.highlightTitle), text: required(LIMITS.highlightText) }),
        LIMITS.highlightsMin,
        LIMITS.highlightsMax,
      ),
    }),
    team: copy(LIMITS.teamTitle, LIMITS.teamText),
    invitation: z.strictObject({
      title: required(LIMITS.invitationTitle),
      text: required(LIMITS.invitationText),
      sign: required(LIMITS.invitationSign),
    }),
  }),
  pages: z.strictObject({
    services: copy(LIMITS.pageTitle, LIMITS.pageText),
    barbers: copy(LIMITS.pageTitle, LIMITS.pageText),
    gallery: copy(LIMITS.pageTitle, LIMITS.pageText),
  }),
});

export type SiteContentInput = z.infer<typeof siteContentSchema>;

/** PUT /site: `baseUpdatedAt` is the version the editor started from (null while nothing is published) */
export const putSiteSchema = z.strictObject({
  content: siteContentSchema,
  baseUpdatedAt: z.iso.datetime().nullable(),
});

export const MAX_MEDIA_BYTES = 2 * 1024 * 1024;

/** POST /site/media: a transport guard only (express.json bounds the body at 25 MB). The 2 MB limit is checked on the decoded bytes, which answers 413 */
export const mediaUploadSchema = z.strictObject({
  dataUrl: z.string().max(40_000_000),
});

export type ImageMime = "image/jpeg" | "image/png" | "image/webp";

type MediaRefusal = StatusCodes.BAD_REQUEST | StatusCodes.REQUEST_TOO_LONG | StatusCodes.UNSUPPORTED_MEDIA_TYPE;

const DATA_URL = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/]+={0,2})$/;

/** The format the bytes really are, whatever the data URL claims */
function sniff(bytes: Buffer): ImageMime | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  if (bytes.length >= 12 && bytes.toString("latin1", 0, 4) === "RIFF" && bytes.toString("latin1", 8, 12) === "WEBP") return "image/webp";
  return null;
}

/** Decode an uploaded data URL. Only real JPEG, PNG or WebP bytes pass: SVG can carry script (spec §6.8). */
export function parseImageDataUrl(
  dataUrl: string,
): { ok: true; mime: ImageMime; data: Buffer } | { ok: false; status: MediaRefusal; error: string } {
  const declared = /^data:([^;,]+)[;,]/.exec(dataUrl)?.[1];
  if (!declared) return { ok: false, status: StatusCodes.BAD_REQUEST, error: "Image illisible." };
  if (!/^image\/(?:jpeg|png|webp)$/.test(declared)) {
    return { ok: false, status: StatusCodes.UNSUPPORTED_MEDIA_TYPE, error: "Formats acceptés : JPEG, PNG ou WebP." };
  }
  const match = DATA_URL.exec(dataUrl);
  if (!match?.[2]) return { ok: false, status: StatusCodes.BAD_REQUEST, error: "Image illisible." };
  const data = Buffer.from(match[2], "base64");
  if (data.length > MAX_MEDIA_BYTES) return { ok: false, status: StatusCodes.REQUEST_TOO_LONG, error: "Image trop lourde (2 Mo au maximum)." };
  const mime = sniff(data);
  if (!mime || mime !== declared) return { ok: false, status: StatusCodes.UNSUPPORTED_MEDIA_TYPE, error: "Le fichier ne correspond pas à son format." };
  return { ok: true, mime, data };
}

/** Ids of the uploads the content refers to, wherever they appear */
export function referencedMediaIds(content: unknown): string[] {
  const found = JSON.stringify(content ?? null).matchAll(/\/site\/media\/([a-f0-9]{24})/g);
  return [...new Set([...found].map((m) => m[1]).filter((id): id is string => Boolean(id)))];
}
