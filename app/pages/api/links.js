// pages/api/links.js

import clientPromise from '../../src/lib/mongodb';

export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db('your_database_name'); // Replace with your actual database name

  if (req.method === 'GET') {
    // Retrieve all links
    const links = await db.collection('links').find({}).toArray();
    res.status(200).json(links);
  } else if (req.method === 'POST') {
    // Add a new link
    const { url } = req.body;
    const newLink = { url, timestamp: new Date() };
    const result = await db.collection('links').insertOne(newLink);
    res.status(201).json({ _id: result.insertedId, ...newLink });
  } else {
    // Handle any other HTTP method
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}