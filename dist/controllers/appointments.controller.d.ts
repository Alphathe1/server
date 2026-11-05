import type { Request, Response, NextFunction } from "express";
/** GET /appointments/availability?barber&service&date */
export declare function availability(req: Request, res: Response, next: NextFunction): Promise<void>;
/** POST /appointments */
export declare function createAppointment(req: Request, res: Response, next: NextFunction): Promise<void>;
/** GET /appointments?from&to&status&barber&client — scoped by role */
export declare function listAppointments(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getAppointment(req: Request, res: Response, next: NextFunction): Promise<void>;
/** PATCH /appointments/:id — change barber, service or time */
export declare function rescheduleAppointment(req: Request, res: Response, next: NextFunction): Promise<void>;
/** PATCH /appointments/:id/status */
export declare function updateAppointmentStatus(req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=appointments.controller.d.ts.map