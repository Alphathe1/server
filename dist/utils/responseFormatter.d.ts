import { StatusCodes } from "http-status-codes";
import type { Response } from "express";
export declare function successResponse(res: Response, data: unknown, message?: string, statusCode?: StatusCodes, token?: string): void;
export declare function errorResponse(res: Response, message?: string, statusCode?: StatusCodes, field?: string): void;
export declare function paginatedResponse(res: Response, data: unknown, pagination: {
    totalCount: number;
    totalPages: number;
    currentPage: number;
}, message?: string): void;
export declare function noContentResponse(res: Response): void;
//# sourceMappingURL=responseFormatter.d.ts.map