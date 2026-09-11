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
  if (!MONGODB_URI) {
    return { isConnected: false, error: 'MONGODB_URI is not defined' };
  }

  if (cached!.conn && mongoose.connection.readyState === 1) {
    return { isConnected: true };
  }

  if (!cached!.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 3000,
      connectTimeoutMS: 3000,
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
