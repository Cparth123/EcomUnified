import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecom_unified';
export const IS_LIVE_DATA = process.env.LIVE_DATA === 'true' || process.env.LIVE_DETA === 'true';

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  hasLoggedListeners?: boolean;
}

declare global {
  var mongooseCache: MongooseCache | undefined;
}

let cached = global.mongooseCache;

if (!cached) {
  cached = global.mongooseCache = { conn: null, promise: null, hasLoggedListeners: false };
}

/**
 * Mask password in MongoDB URI for safe console logging
 */
function getMaskedUri(uri: string): string {
  try {
    return uri.replace(/(mongodb(?:\+srv)?:\/\/[^:]+:)([^@]+)(@.+)/i, '$1****$3');
  } catch {
    return 'mongodb://[masked_uri]';
  }
}

/**
 * Register global connection lifecycle event listeners
 */
function setupConnectionEventListeners() {
  if (cached?.hasLoggedListeners) return;
  if (cached) cached.hasLoggedListeners = true;

  mongoose.connection.on('connected', () => {
    const host = mongoose.connection.host || 'cluster';
    const dbName = mongoose.connection.name || 'ecom_unified';
    console.log(`\n======================================================`);
    console.log(`🟢 [MongoDB Atlas] Connection Established Successfully!`);
    console.log(`   📁 Database Name: ${dbName}`);
    console.log(`   🌐 Cluster Host:  ${host}`);
    console.log(`   ⚡ Status:        ReadyState 1 (CONNECTED)`);
    console.log(`======================================================\n`);
  });

  mongoose.connection.on('error', (err) => {
    console.error(`\n🔴 [MongoDB Error] Connection Failed:`, err.message || err);
    if (String(err.message).includes('bad auth') || String(err.message).includes('Authentication failed')) {
      console.error(`   👉 TIP: Please verify your database user password in .env.local.`);
    } else if (String(err.message).includes('queryTxt ETIMEOUT') || String(err.message).includes('whitelist')) {
      console.error(`   👉 TIP: Please whitelist your current IP address (0.0.0.0/0) in MongoDB Atlas Network Access.`);
    }
  });

  mongoose.connection.on('disconnected', () => {
    console.warn(`\n🟡 [MongoDB] Disconnected from database cluster.`);
  });
}

export async function connectToDatabase(): Promise<{
  isConnected: boolean;
  error?: string;
  databaseName?: string;
  host?: string;
  maskedUri?: string;
}> {
  setupConnectionEventListeners();

  if (!MONGODB_URI) {
    console.warn(`⚠️ [MongoDB] MONGODB_URI is not defined in environment variables (.env.local)`);
    return { isConnected: false, error: 'MONGODB_URI is not defined in environment variables' };
  }

  const maskedUri = getMaskedUri(MONGODB_URI);

  // Check if placeholder password is still present
  if (
    MONGODB_URI.includes('<db_password>') ||
    MONGODB_URI.includes('<password>') ||
    MONGODB_URI.includes('<') ||
    MONGODB_URI.includes('>')
  ) {
    const notice = '⚠️ [MongoDB] Placeholder <db_password> detected in .env.local. Please replace it with your real Atlas user password.';
    // Log once per connection attempt
    console.warn(`\n${notice}`);
    console.warn(`   Target URI: ${maskedUri}`);
    console.warn(`   Running in Local/Excel fallback mode until password is set.\n`);

    return {
      isConnected: false,
      error: 'Please replace <db_password> in your .env.local file with your actual MongoDB Atlas password.',
      maskedUri,
    };
  }

  // If already connected
  if (cached!.conn && mongoose.connection.readyState === 1) {
    return {
      isConnected: true,
      databaseName: mongoose.connection.name,
      host: mongoose.connection.host,
      maskedUri,
    };
  }

  try {
    if (!cached!.promise) {
      console.log(`\n🔄 [MongoDB] Initiating connection to: ${maskedUri} ...`);

      const opts = {
        bufferCommands: false,
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
      };

      cached!.promise = mongoose.connect(MONGODB_URI, opts);
    }

    cached!.conn = await cached!.promise;
    const dbName = mongoose.connection.name || 'ecom_unified';
    const host = mongoose.connection.host;

    console.log(`✅ [MongoDB] Ready! Active connection to database "${dbName}" on ${host}`);

    return {
      isConnected: true,
      databaseName: dbName,
      host,
      maskedUri,
    };
  } catch (e: any) {
    cached!.promise = null;
    cached!.conn = null;
    console.error(`\n❌ [MongoDB Connection Error]:`, e.message || e);
    console.error(`   Masked URI: ${maskedUri}`);
    return {
      isConnected: false,
      error: e.message || 'Failed to connect to MongoDB',
      maskedUri,
    };
  }
}
