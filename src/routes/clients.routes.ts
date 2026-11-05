import { Router } from "express";
import {
  validateBodySchema,
  validateParamsSchema,
} from "../middleware/validations.js";
import { clientNotesSchema, createClientSchema } from "../validation/users.js";
import { idParamSchema } from "../validation/barbershop.js";
import {
  createClient,
  getClient,
  listClients,
  updateClientNotes,
} from "../controllers/clients.controller.js";
import { authorize, CheckAuth } from "../middleware/auth.middleware.js";

const clientsRouter = Router();

clientsRouter.use(CheckAuth, authorize("owner", "manager", "barber"));
clientsRouter.get("/", listClients);
clientsRouter.post("/", validateBodySchema(createClientSchema), createClient);
clientsRouter.get("/:id", validateParamsSchema(idParamSchema), getClient);
clientsRouter.patch(
  "/:id/notes",
  validateParamsSchema(idParamSchema),
  validateBodySchema(clientNotesSchema),
  updateClientNotes,
);

export default clientsRouter;
