import type { Request, Response, NextFunction } from "express";
/** GET /services — public; admins can pass ?all=true to include inactive */
export declare function listServices(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function createService(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function updateService(req: Request, res: Response, next: NextFunction): Promise<void>;
/** DELETE /services/:id — archived instead when it has bookings */
export declare function deleteService(req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=services.controller.d.ts.map