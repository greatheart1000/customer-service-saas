import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: '🏠' },
    { name: 'Image Recognition', path: '/image-recognition', icon: '🖼️' },
    { name: 'Voice Interaction', path: '/voice-interaction', icon: '🎤' },
    { name: 'Text Chat', path: '/text-chat', icon: '💬' },
    { name: 'Workflows', path: '/workflows', icon: '🔄' },
    { name: 'Conversations', path: '/conversations', icon: '📂' },
    { name: 'Bots', path: '/bots', icon: '🤖' },
    { name: 'Audio HTTP', path: '/audio-http', icon: '🎵' },
    { name: 'Settings', path: '/settings', icon: '⚙️' },
  ];

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        <ul>
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link 
                to={item.path} 
                className={location.pathname === item.path ? 'active' : ''}
              >
                <span className="icon">{item.icon}</span>
                <span className="text">{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;