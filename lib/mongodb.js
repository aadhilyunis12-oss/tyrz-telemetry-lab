import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/tyrz_telemetry';
const options = {};

let client;
let clientPromise;

if (!process.env.MONGODB_URI) {
  // In development mode, use a global variable so the MongoClient is not recreated on hot reloads
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect().catch(err => {
      console.warn('MongoDB local connection warning (mock mode fallback active):', err.message);
      return null;
    });
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;
