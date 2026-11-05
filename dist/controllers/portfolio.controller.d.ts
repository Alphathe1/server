import type { Request, Response, NextFunction } from "express";
/** GET /portfolio?barber&cutType — public gallery */
export declare function listPortfolio(req: Request, res: Response, next: NextFunction): Promise<void>;
/** POST /portfolio — barbers add to their own gallery */
export declare function createPortfolioItem(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function deletePortfolioItem(req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=portfolio.controller.d.ts.map