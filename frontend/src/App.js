import React, { useState, useEffect } from 'react';

const App = () => {
  const [links, setLinks] = useState([]);
  const [url, setUrl] = useState('');

  useEffect(() => {
    fetchLinks();
  }, []);

  // Fetch links from the backend
  const fetchLinks = async () => {
    const response = await fetch('http://localhost:5000/links');
    const data = await response.json();
    setLinks(data);
  };

  // Handle the URL input
  const handleUrlChange = (event) => {
    setUrl(event.target.value);
  };

  // Handle form submission (add link)
  const handleAddLink = async (event) => {
    event.preventDefault();
    if (url) {
      const response = await fetch('http://localhost:5000/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const newLink = await response.json();
      setLinks([...links, newLink]);
      setUrl(''); // Reset input field
    }
  };

  return (
    <div className="app-container">
      <h1>🎶 Disco Disco 🎶</h1>

      <form onSubmit={handleAddLink} className="link-form">
        <input
          type="text"
          value={url}
          onChange={handleUrlChange}
          placeholder="Enter SoundCloud URL"
          className="url-input"
        />
        <button type="submit" className="add-button">Add Link</button>
      </form>

      <div className="links-list">
        {links.map((link) => (
          <div key={link._id} className="link-card">
            <a href={link.url} className="link-url" target="_blank" rel="noopener noreferrer">
              {link.url}
            </a>
            <p className="timestamp">
              {new Date(link.timestamp).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
