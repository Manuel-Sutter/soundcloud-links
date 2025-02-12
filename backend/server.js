const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path'); // Import path module

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB connection
mongoose.connect('mongodb+srv://manuelsutter1988:FMonXvLhpUM0BocQ@cluster0.72pqz.mongodb.net/soundcloud-links?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Updated Link schema with a timestamp field
const LinkSchema = new mongoose.Schema({
    url: String,
    timestamp: {
        type: Date,
        default: Date.now  // Automatically set timestamp to current date/time
    }
});
const Link = mongoose.model('Link', LinkSchema);

// API route to get links from the database
app.get('/links', async (req, res) => {
    const links = await Link.find();
    res.json(links);
});

// API route to add a new link to the database
app.post('/links', async (req, res) => {
    const newLink = new Link({
        url: req.body.url,
        timestamp: Date.now()  // Explicitly set timestamp to current date/time
    });
    await newLink.save();
    res.json(newLink);
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'frontend/build')));

// Default route that serves a welcome message at the root URL
app.get('/', (req, res) => {
    res.send('Welcome to the SoundCloud Links API');
});

// Catch-all route to serve React's index.html for any other URL
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/build', 'index.html'));
});

// Start the server
app.listen(5000, () => console.log('Server running on port 5000'));
