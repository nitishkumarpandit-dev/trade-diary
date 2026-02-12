import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local",
  );
}

/**
 * Global interface for caching the Mongoose connection.
 * This prevents creating multiple connections in development mode due to hot reloading.
 */
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

/**
 * Connects to MongoDB with connection pooling.
 * This function handles connection caching and error logging.
 */
async function connectDB() {
  if (cached!.conn) {
    // Connection already exists
    return cached!.conn;
  }

  if (!cached!.promise) {
    const opts = {
      bufferCommands: false, // Disable buffering to fail fast if connection is lost
    };

    console.log("Initializing new MongoDB connection...");

    cached!.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
      console.log("✅ MongoDB connected successfully");
      return mongoose;
    });
  }

  try {
    cached!.conn = await cached!.promise;
  } catch (e) {
    cached!.promise = null;
    console.error("❌ Error connecting to MongoDB:", e);
    throw e;
  }

  return cached!.conn;
}

// Event listeners for connection health monitoring
mongoose.connection.on("connected", () => {
  console.log("MongoDB connection established");
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB disconnected");
});

export default connectDB;
