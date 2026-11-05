import type { Request, Response, NextFunction } from "express";
import type { Role } from "../types/user.js";
import "../types/express.js";
export declare function CheckAuth(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * Restrict a route to the given roles. Must run after CheckAuth.
 */
export declare function authorize(...roles: Role[]): (req: Request, res: Response, next: NextFunction) => void;
/**
 * Attach the user when a valid token is present, but never block the request.
 */
export declare function optionalAuth(req: Request, _res: Response, next: NextFunction): Promise<void>;
export declare function isAdmin(req: Request, res: Response, next: NextFunction): void;
//# sourceMappingURL=auth.middleware.d.ts.map