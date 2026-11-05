import { Router } from "express";
import {
  validateBodySchema,
  validateParamsSchema,
} from "../middleware/validations.js";
import { idParamSchema, reviewSchema } from "../validation/barbershop.js";
import {
  createReview,
  deleteReview,
  listReviews,
} from "../controllers/reviews.controller.js";
import { authorize, CheckAuth } from "../middleware/auth.middleware.js";

const reviewsRouter = Router();

reviewsRouter.get("/", listReviews);
reviewsRouter.post(
  "/",
  CheckAuth,
  authorize("client"),
  validateBodySchema(reviewSchema),
  createReview,
);
reviewsRouter.delete(
  "/:id",
  CheckAuth,
  authorize("owner", "manager"),
  validateParamsSchema(idParamSchema),
  deleteReview,
);

export default reviewsRouter;
