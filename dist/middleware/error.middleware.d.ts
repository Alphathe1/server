import type { Request, Response, NextFunction } from "express";
export declare class HttpError extends Error {
    statusCode: number;
    constructor(statusCode: number, message: string);
}
export declare function notFound(req: Request, res: Response): void;
export declare function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void;
//# sourceMappingURL=error.middleware.d.ts.map