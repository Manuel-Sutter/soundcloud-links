import React, { useState, useEffect } from "react";

const App = () => {
  const [links, setLinks] = useState([]);
  const [url, setUrl] = useState("");

  // Add new state for storing embed data
  const [embedData, setEmbedData] = useState({});

  useEffect(() => {
    fetchLinks();
  }, []);

  // Add function to fetch oEmbed data
  const fetchOembedData = async (soundcloudUrl) => {
    try {
      const response = await fetch(
        `https://soundcloud.com/oembed?format=json&url=${encodeURIComponent(soundcloudUrl)}`
      );
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching oEmbed data:", error);
      return null;
    }
  };

  // Modify fetchLinks to include oEmbed data
  const fetchLinks = async () => {
    try {
      const response = await fetch("http://localhost:5000/links");
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

      const data = await response.json();
      const embedPromises = data.map(link => fetchOembedData(link.url));
      const embedResults = await Promise.all(embedPromises);
      
      const embedDataMap = {};
      data.forEach((link, index) => {
        embedDataMap[link._id] = embedResults[index];
      });
      
      setEmbedData(embedDataMap);
      setLinks(data);
    } catch (error) {
      console.error("Error fetching links:", error);
    }
  };

  // Handle the URL input
  const handleUrlChange = (event) => {
    setUrl(event.target.value);
  };

  // Modify handleAddLink to fetch oEmbed data for new links
  const handleAddLink = async (event) => {
    event.preventDefault();

    if (url) {
      try {
        const response = await fetch("http://localhost:5000/links", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        });

        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const newLink = await response.json();
        const newEmbedData = await fetchOembedData(url);
        
        setLinks([...links, newLink]);
        setEmbedData(prev => ({
          ...prev,
          [newLink._id]: newEmbedData
        }));
        setUrl("");
      } catch (error) {
        console.error("Error adding link:", error);
      }
    }
  };

  return (
    <div className="app-container">
      <div className="content-wrapper">
        <h1 className="title">🎶 Disco Disco 🎶</h1>

        <form onSubmit={handleAddLink} className="link-form">
          <input
            type="text"
            value={url}
            onChange={handleUrlChange}
            placeholder="Enter SoundCloud URL"
            className="url-input rounded"
          />
          <button type="submit" className="add-button rounded">
            Add Link
          </button>
        </form>

        <div className="links-list">
          {links.map((link) => (
            <div key={link._id} className="link-card">
              <div className="link-content">
                {embedData[link._id] && (
                  <div className="track-info">
                    <img 
                      src={embedData[link._id].thumbnail_url} 
                      alt={embedData[link._id].title}
                      className="track-thumbnail"
                    />
                    <a 
                      href={link.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="track-title"
                    >
                      {embedData[link._id].title}
                    </a>
                    <span className="timestamp">
                      {new Date(link.timestamp).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;
