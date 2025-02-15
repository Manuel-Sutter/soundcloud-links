// src/lib/mongodb.js

import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI; // Your MongoDB connection string
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

let client;
let clientPromise;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable to preserve the MongoDB client
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, create a new MongoDB client
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;