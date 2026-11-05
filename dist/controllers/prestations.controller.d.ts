import type { Request, Response, NextFunction } from "express";
/** POST /prestations — record work done by a barber */
export declare function createPrestation(req: Request, res: Response, next: NextFunction): Promise<void>;
/** GET /prestations?client&barber — clients see their own, barbers theirs */
export declare function listPrestations(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getPrestation(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function updatePrestation(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function deletePrestation(req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=prestations.controller.d.ts.map