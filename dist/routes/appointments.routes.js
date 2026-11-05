import { Router } from "express";
import { validateBodySchema, validateParamsSchema, validateQuerySchema, } from "../middleware/validations.js";
import { appointmentStatusSchema, availabilityQuerySchema, createAppointmentSchema, idParamSchema, rescheduleAppointmentSchema, } from "../validation/barbershop.js";
import { availability, createAppointment, getAppointment, listAppointments, rescheduleAppointment, updateAppointmentStatus, } from "../controllers/appointments.controller.js";
import { CheckAuth } from "../middleware/auth.middleware.js";
const appointmentsRouter = Router();
// public: anyone can check free slots
appointmentsRouter.get("/availability", validateQuerySchema(availabilityQuerySchema), availability);
appointmentsRouter.use(CheckAuth);
appointmentsRouter.get("/", listAppointments);
appointmentsRouter.post("/", validateBodySchema(createAppointmentSchema), createAppointment);
appointmentsRouter.get("/:id", validateParamsSchema(idParamSchema), getAppointment);
appointmentsRouter.patch("/:id", validateParamsSchema(idParamSchema), validateBodySchema(rescheduleAppointmentSchema), rescheduleAppointment);
appointmentsRouter.patch("/:id/status", validateParamsSchema(idParamSchema), validateBodySchema(appointmentStatusSchema), updateAppointmentStatus);
export default appointmentsRouter;
//# sourceMappingURL=appointments.routes.js.map