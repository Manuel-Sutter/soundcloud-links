// pages/index.js

import React, { useState, useEffect } from "react";

const Home = () => {
  const [links, setLinks] = useState([]);
  const [url, setUrl] = useState("");
  const [embedData, setEmbedData] = useState({});

  useEffect(() => {
    fetchLinks();
    // checkHealth(); // You can keep this if you still want to check health but not display it
  }, []);

  const fetchOembedData = async (soundcloudUrl) => {
    try {
      const response = await fetch(
        `https://soundcloud.com/oembed?format=json&url=${encodeURIComponent(soundcloudUrl)}`
      );
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();

      // Transform the thumbnail URL to use the 48x48 size
      if (data.thumbnail_url) {
        data.thumbnail_url = data.thumbnail_url.replace('t500x500', 't50x50');
      }

      return data;
    } catch (error) {
      console.error("Error fetching oEmbed data:", error);
      return null;
    }
  };

  const fetchLinks = async () => {
    try {
      const response = await fetch("/api/links");
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

  const handleUrlChange = (event) => {
    setUrl(event.target.value);
  };

  const handleAddLink = async (event) => {
    event.preventDefault();

    if (url) {
      try {
        const response = await fetch("/api/links", {
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
        <div className="header-section">
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
        </div>

        <div className="links-container">
          {links.length > 0 ? (
            links.map((link) => (
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
            ))
          ) : (
            <p>No links available. Add a SoundCloud URL to get started!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;