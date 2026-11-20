// Server schema of the site content (spec §6.2, §6.8) and its parity with the client's validation.
//   cd server && node --import tsx --test tests/site.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  FEATURE_ICONS,
  HOME_SECTION_IDS,
  LIMITS,
  MAX_MEDIA_BYTES,
  PATTERNS,
  mediaUploadSchema,
  parseImageDataUrl,
  putSiteSchema,
  referencedMediaIds,
  siteContentSchema,
} from "../src/validation/site.js";
import { DEFAULT_CONTENT } from "../../client/src/lib/site/defaults.ts";
import * as clientTypes from "../../client/src/lib/site/types.ts";
import * as clientRules from "../../client/src/lib/site/validate.ts";

const PNG = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
const MEDIA = "/site/media/0123456789abcdef01234567";
// the fixtures break the types on purpose
const clone = (): any => structuredClone(DEFAULT_CONTENT);
const serverPaths = (value: unknown) => {
  const r = siteContentSchema.safeParse(value);
  return r.success ? [] : [...new Set(r.error.issues.map((i) => i.path.join(".")))].sort();
};
const clientPaths = (value: any) => [...new Set(clientRules.validateContent(value).map((i) => i.path))].sort();
const status = (r: ReturnType<typeof parseImageDataUrl>) => (r.ok ? 200 : r.status);

/** one defect each, and the field both sides must name */
const CASES: [string, (c: any) => void][] = [
  ["identity.tagline", (c) => { c.identity.tagline = "a".repeat(LIMITS.tagline + 1); }],
  ["home.hero.title", (c) => { c.home.hero.title = "   "; }],
  ["contact.phone", (c) => { c.contact.phone = "06 58 x6 14 45"; }],
  ["contact.instagram", (c) => { c.contact.instagram = "javascript:alert(1)"; }],
  ["contact.mapsUrl", (c) => { c.contact.mapsUrl = "http://maps.example.com"; }],
  ["announcement.linkTo", (c) => { c.announcement.linkLabel = "Voir"; c.announcement.linkTo = "//evil.example"; }],
  ["announcement.linkTo", (c) => { c.announcement.linkLabel = "Voir"; c.announcement.linkTo = "/\\evil.example"; }],
  ["announcement.linkTo", (c) => { c.announcement.linkLabel = "Voir"; }],
  ["announcement.linkLabel", (c) => { c.announcement.linkTo = "/services"; }],
  ["announcement.text", (c) => { c.announcement.enabled = true; }],
  ["home.hero.image", (c) => { c.home.hero.image = "data:image/svg+xml;base64,PHN2Zz4="; }],
  ["home.highlights.items.0.image", (c) => { c.home.highlights.items[0].image = "/site/media/123"; }],
  ["home.salon.images.0", (c) => { c.home.salon.images = ["/images/../secret.jpg"]; }],
  ["home.salon.images.1", (c) => { c.home.salon.images = [MEDIA, ""]; }],
  ["home.salon.images", (c) => { c.home.salon.images = [MEDIA, MEDIA, MEDIA]; }],
  ["home.order", (c) => { c.home.order[1] = "hero"; }],
  ["home.order.7", (c) => { c.home.order[7] = "footer"; }],
  ["home.hidden.0", (c) => { c.home.hidden = ["footer"]; }],
  ["home.hidden", (c) => { c.home.hidden = ["team", "team"]; }],
  ["home.features.items", (c) => { c.home.features.items = c.home.features.items.slice(0, 1); }],
  ["home.features.items.0.icon", (c) => { c.home.features.items[0].icon = "skull"; }],
  ["home.salon.points", (c) => { c.home.salon.points = []; }],
  ["home.highlights.items", (c) => { c.home.highlights.items = []; }],
  ["hours.days", (c) => { c.hours.days = c.hours.days.slice(0, 6); }],
  ["hours.days", (c) => { c.hours.days[1].day = c.hours.days[0].day; }],
  ["hours.days.0.end", (c) => { Object.assign(c.hours.days[0], { open: true, start: "19:00", end: "09:00" }); }],
  ["hours.days.0.start", (c) => { Object.assign(c.hours.days[0], { open: false, start: "24:00" }); }],
  ["hours.days.0.day", (c) => { c.hours.days[0].day = 9; }],
  ["pages.gallery.text", (c) => { c.pages.gallery.text = "a".repeat(LIMITS.pageText + 1); }],
];

test("the client's default content passes the server schema", () => {
  const r = siteContentSchema.safeParse(DEFAULT_CONTENT);
  assert.equal(r.success, true, r.success ? "" : JSON.stringify(r.error.issues));
});

test("limits, section ids, icons and patterns are the client's", () => {
  assert.deepEqual(LIMITS, clientRules.LIMITS);
  assert.deepEqual([...HOME_SECTION_IDS], [...clientTypes.HOME_SECTION_IDS]);
  assert.deepEqual([...FEATURE_ICONS], [...clientTypes.FEATURE_ICONS]);
  assert.deepEqual(Object.keys(PATTERNS).sort(), Object.keys(clientRules.PATTERNS).sort());
  for (const key of Object.keys(PATTERNS) as (keyof typeof PATTERNS)[]) {
    assert.equal(PATTERNS[key].source, clientRules.PATTERNS[key].source, key);
  }
});

test("unknown fields are refused at every level", () => {
  const mutations: ((c: any) => void)[] = [
    (c) => { c.extra = 1; },
    (c) => { c.home.hero.subtitle = "Sous-titre"; },
    (c) => { c.home.features.items[0].color = "rouge"; },
  ];
  for (const mutate of mutations) {
    const c = clone();
    mutate(c);
    assert.equal(siteContentSchema.safeParse(c).success, false);
  }
});

test("each defect is reported on the same field by the server and by the client", () => {
  for (const [path, mutate] of CASES) {
    const c = clone();
    mutate(c);
    assert.deepEqual(serverPaths(c), [path], `serveur — ${path}`);
    assert.deepEqual(clientPaths(c), [path], `client — ${path}`);
  }
});

test("values at the limits are accepted by both sides", () => {
  const c = clone();
  c.identity.tagline = "a".repeat(LIMITS.tagline);
  c.contact.phone = "+213 (0) 6.58-86";
  c.contact.address = "";
  c.contact.instagram = "";
  c.announcement = { enabled: true, text: "Fermé le 1er mai", linkLabel: "Voir les tarifs", linkTo: "/services" };
  c.home.hero.image = MEDIA;
  c.home.salon.images = [];
  c.home.hidden = [...HOME_SECTION_IDS];
  c.home.features.items = c.home.features.items.slice(0, 2);
  c.home.highlights.items[0].image = "";
  Object.assign(c.hours.days[0], { open: false, start: "20:00", end: "09:00" });
  assert.deepEqual(serverPaths(c), []);
  assert.deepEqual(clientPaths(c), []);
});

test("PUT body: the content and an ISO baseUpdatedAt or null, nothing else", () => {
  assert.equal(putSiteSchema.safeParse({ content: DEFAULT_CONTENT, baseUpdatedAt: null }).success, true);
  assert.equal(putSiteSchema.safeParse({ content: DEFAULT_CONTENT, baseUpdatedAt: "2026-11-19T10:00:00.000Z" }).success, true);
  assert.equal(putSiteSchema.safeParse({ content: DEFAULT_CONTENT, baseUpdatedAt: "hier" }).success, false);
  assert.equal(putSiteSchema.safeParse({ content: DEFAULT_CONTENT }).success, false);
  assert.equal(putSiteSchema.safeParse({ content: DEFAULT_CONTENT, baseUpdatedAt: null, force: true }).success, false);
});

test("upload body: a dataUrl string, nothing else", () => {
  assert.equal(mediaUploadSchema.safeParse({ dataUrl: `data:image/png;base64,${PNG}` }).success, true);
  assert.equal(mediaUploadSchema.safeParse({ dataUrl: "x", name: "photo.png" }).success, false);
  assert.equal(mediaUploadSchema.safeParse({}).success, false);
});

test("uploads: real JPEG, PNG or WebP bytes only, 2 MB at most", () => {
  const png = parseImageDataUrl(`data:image/png;base64,${PNG}`);
  assert.equal(png.ok && png.mime, "image/png");
  const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]).toString("base64");
  assert.equal(status(parseImageDataUrl(`data:image/jpeg;base64,${jpeg}`)), 200);
  const webp = Buffer.concat([Buffer.from("RIFF"), Buffer.alloc(4), Buffer.from("WEBPVP8 ")]).toString("base64");
  assert.equal(status(parseImageDataUrl(`data:image/webp;base64,${webp}`)), 200);
  assert.equal(status(parseImageDataUrl("data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=")), 415);
  assert.equal(status(parseImageDataUrl(`data:image/jpeg;base64,${PNG}`)), 415);
  const big = Buffer.concat([Buffer.from(PNG, "base64"), Buffer.alloc(MAX_MEDIA_BYTES)]).toString("base64");
  assert.equal(status(parseImageDataUrl(`data:image/png;base64,${big}`)), 413);
  assert.equal(status(parseImageDataUrl("pas une image")), 400);
  assert.equal(status(parseImageDataUrl("data:image/png;base64,@@@")), 400);
});

test("media references are found anywhere in the content", () => {
  const a = "a".repeat(24);
  const b = "b".repeat(24);
  const c = clone();
  c.home.hero.image = `/site/media/${a}`;
  c.home.highlights.items[0].image = `/site/media/${b}`;
  c.home.salon.images = [`/site/media/${a}`];
  assert.deepEqual(referencedMediaIds(c).sort(), [a, b]);
  assert.deepEqual(referencedMediaIds(DEFAULT_CONTENT), []);
});
