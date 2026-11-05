import mongoose from "mongoose";
mongoose.set("debug", process.env.NODE_ENV === "development");
export async function connectDB() {
    try {
        const connection = await mongoose.connect(process.env.MONGODB_URI, {
            dbName: process.env.MONGODB_DBNAME,
            auth: {
                username: process.env.MONGODB_USERNAME,
                password: process.env.MONGODB_PASSWORD,
            },
        });
        console.log("Database connected successfully !");
        return connection;
    }
    catch (error) {
        console.error("MongoDB connection error:", error);
        process.exit(1);
    }
}
//# sourceMappingURL=db.js.map