import { Router } from "express";
import { authorize, CheckAuth } from "../middleware/auth.middleware.js";
import { validateBodySchema, validateParamsSchema } from "../middleware/validations.js";
import { idParamSchema } from "../validation/barbershop.js";
import { mediaUploadSchema, putSiteSchema } from "../validation/site.js";
import { getMedia, getSite, putSite, uploadMedia } from "../controllers/site.controller.js";

const siteRouter = Router();

// public: the shop window reads its content and images without an account
siteRouter.get("/", getSite);
siteRouter.get("/media/:id", validateParamsSchema(idParamSchema), getMedia);
// owner only (spec §6.1, §6.8)
siteRouter.put("/", CheckAuth, authorize("owner"), validateBodySchema(putSiteSchema), putSite);
siteRouter.post("/media", CheckAuth, authorize("owner"), validateBodySchema(mediaUploadSchema), uploadMedia);

export default siteRouter;
