import { Router } from "express";
import {
  validateBodySchema,
  validateParamsSchema,
} from "../middleware/validations.js";
import {
  idParamSchema,
  prestationSchema,
  updatePrestationSchema,
} from "../validation/barbershop.js";
import {
  createPrestation,
  deletePrestation,
  getPrestation,
  listPrestations,
  updatePrestation,
} from "../controllers/prestations.controller.js";
import { authorize, CheckAuth } from "../middleware/auth.middleware.js";

const prestationsRouter = Router();
const staff = authorize("owner", "manager", "barber");

prestationsRouter.use(CheckAuth);
prestationsRouter.get("/", listPrestations);
prestationsRouter.get("/:id", validateParamsSchema(idParamSchema), getPrestation);
prestationsRouter.post(
  "/",
  staff,
  validateBodySchema(prestationSchema),
  createPrestation,
);
prestationsRouter.patch(
  "/:id",
  staff,
  validateParamsSchema(idParamSchema),
  validateBodySchema(updatePrestationSchema),
  updatePrestation,
);
prestationsRouter.delete(
  "/:id",
  staff,
  validateParamsSchema(idParamSchema),
  deletePrestation,
);

export default prestationsRouter;
