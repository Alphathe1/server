import type { Request, Response, NextFunction } from "express";
/** POST /caisse/sales — ring up one haircut: service + barber (owner & manager) */
export declare function createSale(req: Request, res: Response, next: NextFunction): Promise<void>;
/** GET /caisse?from=YYYY-MM-DD&to=YYYY-MM-DD — register summary (default: today) */
export declare function getRegister(req: Request, res: Response, next: NextFunction): Promise<void>;
/** DELETE /caisse/sales/:id — cancel a sale recorded by mistake */
export declare function cancelSale(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * POST /caisse/tickets — pay a whole ticket (several haircuts, possibly several barbers).
 * Each haircut becomes a Prestation so commissions and stats stay per haircut;
 * a global discount is spread across the haircuts so commissions follow the price actually paid.
 */
export declare function createTicket(req: Request, res: Response, next: NextFunction): Promise<void>;
/** DELETE /caisse/tickets/:id — cancel a whole ticket and its haircuts */
export declare function cancelTicket(req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=caisse.controller.d.ts.map