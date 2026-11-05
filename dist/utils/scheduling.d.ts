import type { Types } from "mongoose";
import type { IWorkingHours } from "../types/user.js";
export declare const SLOT_STEP_MINUTES = 15;
export declare function dayBounds(date: string): {
    from: Date;
    to: Date;
};
export declare function toDateKey(d: Date): string;
export interface Slot {
    time: string;
    start: string;
}
/**
 * Every bookable start time for a barber on a given day.
 * Busy appointments (other than `excludeId`) automatically block their range.
 */
export declare function getAvailableSlots(barber: {
    _id: Types.ObjectId;
    workingHours?: IWorkingHours[];
}, date: string, durationMinutes: number, excludeId?: string): Promise<Slot[]>;
export declare function isSlotAvailable(barber: {
    _id: Types.ObjectId;
    workingHours?: IWorkingHours[];
}, start: Date, durationMinutes: number, excludeId?: string): Promise<boolean>;
//# sourceMappingURL=scheduling.d.ts.map