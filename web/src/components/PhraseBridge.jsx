import React, { useState, useEffect } from "react";
import Footer from "./Footer";

const bridges = [
  { id: "UA-PL", name: "UA-PL", source: "🇺🇦", target: "🇵🇱", disabled: false },
  { id: "UA-EN", name: "UA-EN", source: "🇺🇦", target: "🇬🇧", disabled: true },
  { id: "EN-ES", name: "EN-ES", source: "🇬🇧", target: "🇪🇸", disabled: true },
];

function getInitialBridge() {
  const params = new URLSearchParams(window.location.search);
  const bridgeFromUrl = params.get("bridge");
  return bridges.some((b) => b.id === bridgeFromUrl)
    ? bridgeFromUrl
    : bridges[0].id;
}

function PhraseBridge() {
  const [selectedBridge, setSelectedBridge] = useState(getInitialBridge());
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(
    () => localStorage.getItem("theme") === "dark",
  );

  useEffect(() => {
    // Update URL when bridge changes
    const url = new URL(window.location);
    url.searchParams.set("bridge", selectedBridge);
    window.history.pushState({}, "", url);

    const fetchContent = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${import.meta.env.VITE_S3_BUCKET_URL}/${selectedBridge}/latest-message.json`,
        );
        const data = await response.json();
        setContent(data);
      } catch (error) {
        console.error("Error fetching content:", error);
      }
      setLoading(false);
    };

    fetchContent();
  }, [selectedBridge]);

  useEffect(() => {
    document.body.classList.toggle("dark", isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  useEffect(() => {
    const handlePopState = () => {
      const newBridge = getInitialBridge();
      setSelectedBridge(newBridge);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  return (
    <div className="wrapper-card">
      <div className="container">
        <header className="header">
          <div className="title-section">
            <h1 className="title">Phrase Bridge</h1>
            <p className="subtitle">
              Learn a new language, bridge new cultures every day.
            </p>
          </div>
          <div className="nav-controls">
            <select
              className="select-bridge"
              value={selectedBridge}
              onChange={(e) => setSelectedBridge(e.target.value)}
            >
              {bridges.map((bridge) => (
                <option
                  key={bridge.id}
                  value={bridge.id}
                  disabled={bridge.disabled}
                >
                  {bridge.source} {bridge.target} {bridge.name}
                </option>
              ))}
            </select>
            <a
              href={`https://t.me/your_channel_${selectedBridge}`}
              target="_blank"
              rel="noopener noreferrer"
              className="telegram-link"
            >
              <i className="fab fa-telegram-plane"></i>
            </a>
            <button
              className="theme-toggle"
              onClick={() => setIsDark(!isDark)}
              aria-label="Toggle theme"
            >
              <i className={`fas ${isDark ? "fa-sun" : "fa-moon"}`}></i>
            </button>
          </div>
        </header>

        {content?.audio && (
          <audio controls className="audio-player" preload="metadata">
            <source src={content.audio} type="audio/mpeg" />
          </audio>
        )}

        <div className="content-card">
          {loading ? (
            <div className="loading">
              <div className="loading-line"></div>
              <div className="loading-line"></div>
              <div className="loading-line"></div>
            </div>
          ) : content ? (
            <div className="content">
              {content.sections.map((section, index) => (
                <div key={index} className="section">
                  <div className="section-header">
                    <span>{section.icon}</span>
                    <span>{section.title}</span>
                  </div>
                  {section.content && (
                    <p className="section-content">{section.content}</p>
                  )}
                  {section.items && (
                    <ul className={`${section.type}-list`}>
                      {section.items.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  )}
                  {section.examples && (
                    <ul className="examples-list">
                      {section.examples.map((example, i) => (
                        <li key={i}>
                          {example.source} — {example.translation}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div>No content available</div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default PhraseBridge;
