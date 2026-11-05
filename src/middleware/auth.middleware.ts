import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import { errorResponse } from "../utils/responseFormatter.js";
import { User } from "../models/user.model.js";
import type { Role } from "../types/user.js";

interface AccessTokenPayload {
  id: string;
  role: string;
  iat?: number;
  exp?: number;
}

export async function CheckAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      errorResponse(res, "No authorization header", StatusCodes.UNAUTHORIZED);
      return;
    }

    // extract the token
    const token = authHeader.split(" ")[1];
    if (!token) {
      errorResponse(res, "No token provided", StatusCodes.UNAUTHORIZED);
      return;
    }

    // Verify token
    const payload = jwt.verify(
      token,
      process.env.AUTH_SECRET!,
    ) as AccessTokenPayload;
    if (!payload) {
      errorResponse(res, "Unverified token used", StatusCodes.UNAUTHORIZED);
      return;
    }

    // Find user and attach to request
    const user = await User.findById(payload.id).select("-password");
    if (!user) {
      errorResponse(res, "User not found or deleted", StatusCodes.UNAUTHORIZED);
      return;
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Restrict a route to the given roles. Must run after CheckAuth.
 */
export function authorize(...roles: Role[]) {
  return function (req: Request, res: Response, next: NextFunction): void {
    if (req.user && roles.includes(req.user.role)) {
      next();
    } else {
      errorResponse(
        res,
        "You don't have permission to access this route",
        StatusCodes.FORBIDDEN,
      );
    }
  };
}

/**
 * Attach the user when a valid token is present, but never block the request.
 */
export async function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (token) {
      const payload = jwt.verify(
        token,
        process.env.AUTH_SECRET!,
      ) as AccessTokenPayload;
      const user = await User.findById(payload.id).select("-password");
      if (user) req.user = user;
    }
  } catch {
    // invalid token: continue as anonymous
  }
  next();
}

export function isAdmin(req: Request, res: Response, next: NextFunction): void {
  if (req.user?.isAdmin) {
    next();
  } else {
    errorResponse(
      res,
      "You are not an admin, you can't access this route",
      StatusCodes.FORBIDDEN,
    );
  }
}
