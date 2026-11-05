/**
 * Drop documents whose populated references no longer exist.
 * If a user or service is removed directly from the database, Mongoose
 * populates the dangling reference as `null`; the client expects objects.
 */
export function withRefs(docs, ...keys) {
    return docs.filter((doc) => keys.every((k) => doc[k] != null));
}
/** Like withRefs for optional references: only a dangling (null) value is dropped, an unset one is kept */
export function withOptionalRefs(docs, ...keys) {
    return docs.filter((doc) => keys.every((k) => doc[k] !== null));
}
//# sourceMappingURL=refs.js.map