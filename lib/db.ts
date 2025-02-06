import mongoose from "mongoose";

const MONGODB_URL = process.env.MONGODB_URL || "";

if (!MONGODB_URL) throw new Error("Please define MONGODB_URL in .env.local");

let cached = (global as any).mongoose || { conn: null, promise: null };

export async function connectDB() {
  if (cached.conn) return cached.conn;
  
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URL, {
      dbName: "notesApp",
    }).then((mongoose) => mongoose);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
