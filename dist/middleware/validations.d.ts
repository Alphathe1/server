import type { Request, Response, NextFunction } from "express";
import * as z from "zod/v4";
/**
 * Validate request body against a Zod schema
 */
export declare function validateBodySchema<T extends z.ZodTypeAny>(schema: T): (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Validate request query parameters against a Zod schema
 * Attaches parsed data to req.parsedQuery
 */
export declare function validateQuerySchema<T extends z.ZodTypeAny>(schema: T): (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Validate URL parameters against a Zod schema
 */
export declare function validateParamsSchema<T extends z.ZodTypeAny>(schema: T): (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=validations.d.ts.map