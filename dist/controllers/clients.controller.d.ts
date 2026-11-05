import type { Request, Response, NextFunction } from "express";
/** GET /clients?search — admins see all, barbers see clients they served */
export declare function listClients(req: Request, res: Response, next: NextFunction): Promise<void>;
/** POST /clients — create a client file (walk-in); a random password is set */
export declare function createClient(req: Request, res: Response, next: NextFunction): Promise<void>;
/** GET /clients/:id — the full client file */
export declare function getClient(req: Request, res: Response, next: NextFunction): Promise<void>;
/** PATCH /clients/:id/notes — staff notes & preferences */
export declare function updateClientNotes(req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=clients.controller.d.ts.map