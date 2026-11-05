import { Router } from "express";
import { validateQuerySchema } from "../middleware/validations.js";
import { statsQuerySchema } from "../validation/barbershop.js";
import { getStats } from "../controllers/dashboard.controller.js";
import { authorize, CheckAuth } from "../middleware/auth.middleware.js";
const dashboardRouter = Router();
dashboardRouter.get("/stats", CheckAuth, authorize("owner", "manager", "barber"), validateQuerySchema(statsQuerySchema), getStats);
export default dashboardRouter;
//# sourceMappingURL=dashboard.routes.js.map