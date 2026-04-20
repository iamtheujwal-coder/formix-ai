import mongoose from "mongoose";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  lastError: string | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache || {
  conn: null,
  promise: null,
  lastError: null,
};

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export function isDBConnected(): boolean {
  return !!cached.conn;
}

export function getDBConnectionError(): string | null {
  return cached.lastError;
}

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    throw new Error(
      "Please define the MONGODB_URI environment variable inside .env.local"
    );
  }

  // Diagnostic: Check for placeholder password
  if (MONGODB_URI.includes("<db_password>")) {
    console.warn("MongoDB Warning: MONGODB_URI still contains the '<db_password>' placeholder. Entering Demo Mode.");
    return mongoose; // Return unitialized mongoose
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      connectTimeoutMS: 10000, // 10 seconds timeout
      serverSelectionTimeoutMS: 10000,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((m) => {
      console.log("MongoDB Connected Successfully");
      return m;
    });
  }

  try {
    cached.conn = await cached.promise;
    cached.lastError = null; // Clear error on success
  } catch (e: any) {
    cached.promise = null;
    cached.lastError = e.message;
    console.error("MongoDB Connection Error Details:");
    console.error(`- Message: ${e.message}`);
    // ... rest of error logic
    throw e;
  }

  return cached.conn;
}
