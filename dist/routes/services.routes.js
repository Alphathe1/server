import { Router } from "express";
import { validateBodySchema, validateParamsSchema, } from "../middleware/validations.js";
import { idParamSchema, serviceSchema, updateServiceSchema, } from "../validation/barbershop.js";
import { createService, deleteService, listServices, updateService, } from "../controllers/services.controller.js";
import { authorize, CheckAuth, optionalAuth, } from "../middleware/auth.middleware.js";
const servicesRouter = Router();
const admin = [CheckAuth, authorize("owner", "manager")];
servicesRouter.get("/", optionalAuth, listServices);
servicesRouter.post("/", ...admin, validateBodySchema(serviceSchema), createService);
servicesRouter.patch("/:id", ...admin, validateParamsSchema(idParamSchema), validateBodySchema(updateServiceSchema), updateService);
servicesRouter.delete("/:id", ...admin, validateParamsSchema(idParamSchema), deleteService);
export default servicesRouter;
//# sourceMappingURL=services.routes.js.map