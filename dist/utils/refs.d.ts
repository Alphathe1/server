/**
 * Drop documents whose populated references no longer exist.
 * If a user or service is removed directly from the database, Mongoose
 * populates the dangling reference as `null`; the client expects objects.
 */
export declare function withRefs<T>(docs: T[], ...keys: string[]): T[];
/** Like withRefs for optional references: only a dangling (null) value is dropped, an unset one is kept */
export declare function withOptionalRefs<T>(docs: T[], ...keys: string[]): T[];
//# sourceMappingURL=refs.d.ts.map