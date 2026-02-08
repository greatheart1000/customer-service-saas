import React from 'react';
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="logo">
            <h1>🤖 Intelligent Customer Service</h1>
          </div>
          <nav className="nav">
            <ul>
              <li><a href="/">Home</a></li>
              <li><a href="/settings">Settings</a></li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;