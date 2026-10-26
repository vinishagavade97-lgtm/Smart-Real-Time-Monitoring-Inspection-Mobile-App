import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined in .env.local");
}

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = {
        conn: null,
        promise: null,
    };
}

export async function connectDB() {
    // Already connected
    if (cached.conn) {
        return cached.conn;
    }

    // Connection is already being established
    if (!cached.promise) {
        console.log("🔄 [MongoDB] Connecting to database...");

        cached.promise = mongoose.connect(MONGODB_URI, {
            bufferCommands: false,
        });
    }

    try {
        cached.conn = await cached.promise;

        console.log("✅ [MongoDB] Database connected successfully");

        return cached.conn;
    } catch (error) {
        cached.promise = null;

        console.error("❌ [MongoDB] Database connection failed");
        console.error("   └─", error.message);

        throw error;
    }
}