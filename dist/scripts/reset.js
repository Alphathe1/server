/**
 * Wipe every document in the configured database (MONGODB_DBNAME).
 * Collections and indexes are kept; only their documents are removed.
 * Irreversible — requires an explicit flag:  npm run db:reset -- --yes
 */
import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
if (!process.argv.includes("--yes")) {
    console.error("Refusing to run without --yes. This permanently deletes ALL data in the database.");
    console.error("Usage: npm run db:reset -- --yes");
    process.exit(1);
}
await connectDB();
const db = mongoose.connection.db;
console.log(`Clearing database "${db.databaseName}"…`);
for (const { name } of await db.listCollections().toArray()) {
    const { deletedCount } = await db.collection(name).deleteMany({});
    console.log(`  ${name}: ${deletedCount} deleted`);
}
console.log("Done. Run `npm run seed` to recreate the demo data.");
await mongoose.disconnect();
//# sourceMappingURL=reset.js.map