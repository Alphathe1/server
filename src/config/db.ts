import mongoose from "mongoose";

mongoose.set("debug", process.env.NODE_ENV === "development");

export async function connectDB(): Promise<typeof mongoose> {
  try {
    const connection = await mongoose.connect(
      process.env.MONGODB_URI as string,
      {
        dbName: process.env.MONGODB_DBNAME as string,
        auth: {
          username: process.env.MONGODB_USERNAME as string,
          password: process.env.MONGODB_PASSWORD as string,
        },
      },
    );

    console.log("Database connected successfully !");

    return connection;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
}
