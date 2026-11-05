import { Router } from "express";
import { validateBodySchema } from "../middleware/validations.js";
import { changePasswordSchema, loginSchema, updateProfileSchema, userSchema, } from "../validation/users.js";
import { changePassword, checkUser, login, register, updateProfile, } from "../controllers/auth.controller.js";
import { CheckAuth } from "../middleware/auth.middleware.js";
const authRouter = Router();
authRouter.get("/", CheckAuth, checkUser);
authRouter.post("/login", validateBodySchema(loginSchema), login);
authRouter.post("/register", validateBodySchema(userSchema), register);
authRouter.patch("/me", CheckAuth, validateBodySchema(updateProfileSchema), updateProfile);
authRouter.patch("/me/password", CheckAuth, validateBodySchema(changePasswordSchema), changePassword);
export default authRouter;
//# sourceMappingURL=auth.routes.js.map