import type { Request, Response, NextFunction } from "express";
/** GET /users — owner & manager */
export declare function listUsers(req: Request, res: Response, next: NextFunction): Promise<void>;
/** POST /users — owner & manager create staff or clients */
export declare function createUser(req: Request, res: Response, next: NextFunction): Promise<void>;
/** PATCH /users/:id */
export declare function updateUser(req: Request, res: Response, next: NextFunction): Promise<void>;
/** DELETE /users/:id — soft delete keeps history intact */
export declare function deactivateUser(req: Request, res: Response, next: NextFunction): Promise<void>;
/** GET /users/barbers — public list with ratings */
export declare function listBarbers(_req: Request, res: Response, next: NextFunction): Promise<void>;
/** GET /users/barbers/:id — public profile, portfolio and reviews */
export declare function getBarber(req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=users.controller.d.ts.map