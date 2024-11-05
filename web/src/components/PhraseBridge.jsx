import React, { useState, useEffect } from "react";

const bridges = [
  { id: "ua-pl", name: "UA-PL", source: "🇺🇦", target: "🇵🇱" },
  { id: "ua-en", name: "UA-EN", source: "🇺🇦", target: "🇬🇧" },
  { id: "pl-ua", name: "PL-UA", source: "🇵🇱", target: "🇺🇦" },
];

function getInitialBridge() {
  const params = new URLSearchParams(window.location.search);
  const bridgeFromUrl = params.get("bridge");
  return bridges.some((b) => b.id === bridgeFromUrl) ? bridgeFromUrl : "ua-pl";
}

function PhraseBridge() {
  const [selectedBridge, setSelectedBridge] = useState(getInitialBridge());
  const [content, setContent] = useState("");
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
          `${import.meta.env.VITE_S3_BUCKET_URL}/${selectedBridge}/latest.html`,
        );
        const html = await response.text();
        setContent(html);
      } catch (error) {
        console.error("Error fetching content:", error);
      }
      setLoading(false);
    };

    fetchContent();
  }, [selectedBridge]);

  // Handle theme changes
  useEffect(() => {
    document.body.classList.toggle("dark", isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  // Handle browser back/forward
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
                <option key={bridge.id} value={bridge.id}>
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

        <div className="content-card">
          {loading ? (
            <div className="loading">
              <div className="loading-line"></div>
              <div className="loading-line"></div>
              <div className="loading-line"></div>
            </div>
          ) : (
            <div dangerouslySetInnerHTML={{ __html: content }} />
          )}
        </div>
      </div>
    </div>
  );
}

export default PhraseBridge;
