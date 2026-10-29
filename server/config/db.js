import mongoose from 'mongoose';

/**
 * Serverless-safe MongoDB connection.
 *
 * On Vercel every request may run in a fresh (cold) function instance, and warm
 * instances are reused between requests. We therefore:
 *  - cache the connection promise on `globalThis` so warm invocations reuse it,
 *  - reset the cache on failure so the next request retries instead of being stuck,
 *  - fail fast (serverSelectionTimeoutMS) instead of letting queries buffer until
 *    they time out and surface as a generic "Internal server error".
 */
const cached = globalThis.__mongoose ?? (globalThis.__mongoose = { conn: null, promise: null });

/**
 * Normalizes MONGO_URI copied into a hosting dashboard (strips stray whitespace / quotes).
 */
function getMongoUri() {
    const raw = process.env.MONGO_URI;
    if (!raw) return null;
    return raw.trim().replace(/^["']|["']$/g, "");
}

export const connectDB = async () => {
    if (cached.conn && mongoose.connection.readyState === 1) {
        return cached.conn;
    }

    const uri = getMongoUri();
    if (!uri) {
        throw new Error("MONGO_URI is not defined. Set it in your hosting provider's environment variables.");
    }

    if (!cached.promise) {
        cached.promise = mongoose
            .connect(uri, {
                serverSelectionTimeoutMS: 8000,
                maxPoolSize: 10,
            })
            .then((m) => {
                console.log("CONNECTED TO MONGODB");
                return m;
            });
    }

    try {
        cached.conn = await cached.promise;
        return cached.conn;
    }
    catch (error) {
        // Reset so the next request can retry with a fresh attempt
        cached.promise = null;
        cached.conn = null;
        console.error(`Failed to connect to MongoDB: ${error.name}: ${error.message}`);
        throw error;
    }
};
