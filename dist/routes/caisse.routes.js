import { Router } from "express";
import { validateBodySchema, validateParamsSchema, validateQuerySchema, } from "../middleware/validations.js";
import { idParamSchema, registerQuerySchema, saleSchema, ticketSchema, } from "../validation/barbershop.js";
import { cancelSale, cancelTicket, createSale, createTicket, getRegister, } from "../controllers/caisse.controller.js";
import { authorize, CheckAuth } from "../middleware/auth.middleware.js";
const caisseRouter = Router();
// the register is for the owner and managers only
caisseRouter.use(CheckAuth, authorize("owner", "manager"));
caisseRouter.get("/", validateQuerySchema(registerQuerySchema), getRegister);
caisseRouter.post("/sales", validateBodySchema(saleSchema), createSale);
caisseRouter.delete("/sales/:id", validateParamsSchema(idParamSchema), cancelSale);
caisseRouter.post("/tickets", validateBodySchema(ticketSchema), createTicket);
caisseRouter.delete("/tickets/:id", validateParamsSchema(idParamSchema), cancelTicket);
export default caisseRouter;
//# sourceMappingURL=caisse.routes.js.map