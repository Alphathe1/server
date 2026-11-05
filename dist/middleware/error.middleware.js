import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { errorResponse } from "../utils/responseFormatter.js";
export class HttpError extends Error {
    statusCode;
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
    }
}
export function notFound(req, res) {
    errorResponse(res, `Route ${req.originalUrl} not found`, StatusCodes.NOT_FOUND);
}
export function errorHandler(err, _req, res, _next) {
    if (err instanceof HttpError) {
        errorResponse(res, err.message, err.statusCode);
        return;
    }
    if (err instanceof jwt.JsonWebTokenError) {
        errorResponse(res, "Invalid or expired token", StatusCodes.UNAUTHORIZED);
        return;
    }
    if (err instanceof mongoose.Error.ValidationError) {
        const first = Object.values(err.errors)[0];
        errorResponse(res, first?.message ?? "Validation failed", StatusCodes.BAD_REQUEST, first?.path);
        return;
    }
    if (err instanceof mongoose.Error.CastError) {
        errorResponse(res, `Invalid ${err.path}`, StatusCodes.BAD_REQUEST, err.path);
        return;
    }
    // Mongo duplicate key
    if (typeof err === "object" &&
        err !== null &&
        err.code === 11000) {
        const field = Object.keys(err.keyValue ?? {})[0];
        errorResponse(res, `${field ?? "Value"} already exists`, StatusCodes.CONFLICT, field);
        return;
    }
    console.error(err);
    errorResponse(res, err instanceof Error ? err.message : "Internal server error");
}
//# sourceMappingURL=error.middleware.js.map