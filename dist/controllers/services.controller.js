import { StatusCodes } from "http-status-codes";
import { Service } from "../models/service.model.js";
import { Appointment } from "../models/appointment.model.js";
import { errorResponse, successResponse } from "../utils/responseFormatter.js";
/** GET /services — public; admins can pass ?all=true to include inactive */
export async function listServices(req, res, next) {
    try {
        const showAll = req.query.all === "true" && req.user?.isAdmin;
        const services = await Service.find(showAll ? {} : { isActive: true }).sort({
            category: 1,
            price: 1,
        });
        successResponse(res, services);
    }
    catch (error) {
        next(error);
    }
}
export async function createService(req, res, next) {
    try {
        const service = await Service.create(req.body);
        successResponse(res, service, "Service created", StatusCodes.CREATED);
    }
    catch (error) {
        next(error);
    }
}
export async function updateService(req, res, next) {
    try {
        const service = await Service.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!service) {
            errorResponse(res, "Service not found", StatusCodes.NOT_FOUND);
            return;
        }
        successResponse(res, service, "Service updated");
    }
    catch (error) {
        next(error);
    }
}
/** DELETE /services/:id — archived instead when it has bookings */
export async function deleteService(req, res, next) {
    try {
        const used = await Appointment.exists({ service: req.params.id });
        if (used) {
            await Service.findByIdAndUpdate(req.params.id, { isActive: false });
            successResponse(res, { archived: true }, "Service archived (has bookings)");
            return;
        }
        const deleted = await Service.findByIdAndDelete(req.params.id);
        if (!deleted) {
            errorResponse(res, "Service not found", StatusCodes.NOT_FOUND);
            return;
        }
        successResponse(res, { archived: false }, "Service deleted");
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=services.controller.js.map