import { Router } from "express";
import { validateParamsSchema } from "../middleware/validations.js";
import { idParamSchema } from "../validation/barbershop.js";
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../controllers/notifications.controller.js";
import { CheckAuth } from "../middleware/auth.middleware.js";

const notificationsRouter = Router();

notificationsRouter.use(CheckAuth);
notificationsRouter.get("/", listNotifications);
notificationsRouter.patch("/read-all", markAllNotificationsRead);
notificationsRouter.patch(
  "/:id/read",
  validateParamsSchema(idParamSchema),
  markNotificationRead,
);

export default notificationsRouter;
