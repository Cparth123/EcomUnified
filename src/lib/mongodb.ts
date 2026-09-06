import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecom_unified';
export const IS_LIVE_DATA = process.env.LIVE_DATA === 'true' || process.env.LIVE_DETA === 'true';

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongooseCache: MongooseCache | undefined;
}

let cached = global.mongooseCache;

if (!cached) {
  cached = global.mongooseCache = { conn: null, promise: null };
}

export async function connectToDatabase(): Promise<{ isConnected: boolean; error?: string }> {
  // If not in live data mode, don't force a strict connection
  if (!IS_LIVE_DATA) {
    return { isConnected: false, error: 'LIVE_DATA is set to false (Dummy data active)' };
  }

  if (cached!.conn) {
    return { isConnected: true };
  }

  if (!cached!.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 4000,
    };

    cached!.promise = mongoose.connect(MONGODB_URI, opts).then((m) => m);
  }

  try {
    cached!.conn = await cached!.promise;
    return { isConnected: true };
  } catch (e: any) {
    cached!.promise = null;
    return { isConnected: false, error: e.message || 'Failed to connect to MongoDB' };
  }
}
