import { Router } from "express";
import { validateBodySchema, validateParamsSchema, } from "../middleware/validations.js";
import { idParamSchema, portfolioSchema } from "../validation/barbershop.js";
import { createPortfolioItem, deletePortfolioItem, listPortfolio, } from "../controllers/portfolio.controller.js";
import { authorize, CheckAuth } from "../middleware/auth.middleware.js";
const portfolioRouter = Router();
const staff = [CheckAuth, authorize("owner", "manager", "barber")];
portfolioRouter.get("/", listPortfolio);
portfolioRouter.post("/", ...staff, validateBodySchema(portfolioSchema), createPortfolioItem);
portfolioRouter.delete("/:id", ...staff, validateParamsSchema(idParamSchema), deletePortfolioItem);
export default portfolioRouter;
//# sourceMappingURL=portfolio.routes.js.map