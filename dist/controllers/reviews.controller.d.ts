import type { Request, Response, NextFunction } from "express";
/** GET /reviews?barber — public */
export declare function listReviews(req: Request, res: Response, next: NextFunction): Promise<void>;
/** POST /reviews — a client rates the barber of a completed appointment */
export declare function createReview(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function deleteReview(req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=reviews.controller.d.ts.map