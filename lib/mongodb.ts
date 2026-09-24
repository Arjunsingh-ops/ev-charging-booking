import mongoose from "mongoose"
import dns from "dns"

// Use public DNS servers for MongoDB Atlas SRV resolution
// Some local/ISP DNS servers fail to resolve _mongodb._tcp SRV records
try {
  const currentServers = dns.getServers()
  // Put public DNS first so SRV lookups succeed, keep local DNS as fallback
  dns.setServers(["8.8.8.8", "1.1.1.1", ...currentServers])
} catch {
  // Silently ignore if DNS configuration fails
}

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/chargeconnect"
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || "chargeconnect"

interface CachedConnection {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: CachedConnection | undefined
}

let cached: CachedConnection = global.mongooseCache || { conn: null, promise: null }

if (!global.mongooseCache) {
  global.mongooseCache = cached
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      dbName: MONGODB_DB_NAME,
    }

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((m) => {
      return m
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }

  return cached.conn
}

export default connectToDatabase
