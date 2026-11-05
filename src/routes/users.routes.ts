import { Router } from "express";
import {
  validateBodySchema,
  validateParamsSchema,
} from "../middleware/validations.js";
import { adminUpdateUserSchema, fullUserSchema } from "../validation/users.js";
import { idParamSchema } from "../validation/barbershop.js";
import {
  createUser,
  deactivateUser,
  getBarber,
  listBarbers,
  listUsers,
  updateUser,
} from "../controllers/users.controller.js";
import { authorize, CheckAuth } from "../middleware/auth.middleware.js";

const usersRouter = Router();

// public
usersRouter.get("/barbers", listBarbers);
usersRouter.get("/barbers/:id", validateParamsSchema(idParamSchema), getBarber);

// owner & manager
usersRouter.use(CheckAuth, authorize("owner", "manager"));
usersRouter.get("/", listUsers);
usersRouter.post("/", validateBodySchema(fullUserSchema), createUser);
usersRouter.patch(
  "/:id",
  validateParamsSchema(idParamSchema),
  validateBodySchema(adminUpdateUserSchema),
  updateUser,
);
usersRouter.delete("/:id", validateParamsSchema(idParamSchema), deactivateUser);

export default usersRouter;
