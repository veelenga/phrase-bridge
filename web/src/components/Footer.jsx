import React from "react";

const Footer = () => (
  <footer className="footer">
    <div className="footer-content">
      <div className="footer-links">
        <a
          href="https://github.com/veelenga/phrase-bridge"
          target="_blank"
          rel="noopener noreferrer"
          className="footer-link"
        >
          <i className="fab fa-github"></i>
          <span>Source</span>
        </a>
        <a
          href="https://github.com/veelenga/phrase-bridge/blob/main/LICENSE"
          target="_blank"
          rel="noopener noreferrer"
          className="footer-link"
        >
          <i className="fas fa-balance-scale"></i>
          <span>MIT License</span>
        </a>
      </div>
      <div className="footer-copyright">
        © {new Date().getFullYear()} Phrase Bridge. Built with ❤️ by
        <a
          href="https://github.com/veelenga"
          target="_blank"
          rel="noopener noreferrer"
          className="author-link"
        >
          {" "}
          veelenga
        </a>
      </div>
    </div>
  </footer>
);

export default Footer;
