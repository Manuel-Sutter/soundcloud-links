const mongoose = require('mongoose');
const { connectDB } = require('./db');

// Define the Link schema
const linkSchema = new mongoose.Schema({
  url: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

// Create the model
let Link;
try {
  Link = mongoose.model('Link');
} catch {
  Link = mongoose.model('Link', linkSchema);
}

// GET endpoint
export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    await connectDB();

    if (req.method === 'GET') {
      const links = await Link.find().sort({ timestamp: -1 });
      res.status(200).json(links);
    } 
    else if (req.method === 'POST') {
      const { url } = req.body;
      const newLink = new Link({ url });
      await newLink.save();
      res.status(201).json(newLink);
    } 
    else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}
