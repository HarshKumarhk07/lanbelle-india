import mongoose, { type Mongoose } from "mongoose";
import { getServerEnv } from "@/lib/env";

/**
 * Cached Mongoose connection. In serverless environments (Vercel) modules are
 * re-evaluated frequently; caching the connection on `globalThis` prevents
 * exhausting the database connection pool across hot reloads and lambdas.
 */
interface MongooseCache {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

const globalForMongoose = globalThis as unknown as {
  _mongoose?: MongooseCache;
};

const cache: MongooseCache =
  globalForMongoose._mongoose ?? { conn: null, promise: null };

globalForMongoose._mongoose = cache;

export async function connectDB(): Promise<Mongoose> {
  if (cache.conn) return cache.conn;

  if (!cache.promise) {
    const { MONGODB_URI } = getServerEnv();

    mongoose.set("strictQuery", true);

    cache.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10_000,
      socketTimeoutMS: 45_000,
    });
  }

  try {
    cache.conn = await cache.promise;
  } catch (error) {
    cache.promise = null;
    throw error;
  }

  return cache.conn;
}

export { mongoose };
