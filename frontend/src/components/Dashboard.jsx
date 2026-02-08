import React from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const features = [
    {
      name: 'Image Recognition',
      description: 'Analyze and understand images with AI-powered recognition',
      path: '/image-recognition',
      icon: '🖼️',
      color: '#3498db'
    },
    {
      name: 'Voice Interaction',
      description: 'Real-time voice conversations with speech recognition and synthesis',
      path: '/voice-interaction',
      icon: '🎤',
      color: '#2ecc71'
    },
    {
      name: 'Text Chat',
      description: 'Traditional text-based chat with intelligent responses',
      path: '/text-chat',
      icon: '💬',
      color: '#9b59b6'
    },
    {
      name: 'Workflows',
      description: 'Manage and execute complex workflow processes',
      path: '/workflows',
      icon: '🔄',
      color: '#f39c12'
    },
    {
      name: 'Conversations',
      description: 'View and manage conversation histories',
      path: '/conversations',
      icon: '📂',
      color: '#e74c3c'
    },
    {
      name: 'Bots',
      description: 'Create, manage, and deploy intelligent bots',
      path: '/bots',
      icon: '🤖',
      color: '#1abc9c'
    },
    {
      name: 'Audio HTTP',
      description: 'Convert text to speech with various voice options',
      path: '/audio-http',
      icon: '🎵',
      color: '#34495e'
    },
    {
      name: 'Settings',
      description: 'Configure API keys and system preferences',
      path: '/settings',
      icon: '⚙️',
      color: '#7f8c8d'
    }
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome to Intelligent Customer Service</h1>
        <p>A comprehensive platform for multimodal AI interactions</p>
      </div>
      
      <div className="features-grid">
        {features.map((feature, index) => (
          <Link to={feature.path} key={index} className="feature-card">
            <h3 style={{ color: feature.color }}>
              <span className="icon">{feature.icon}</span>
              {feature.name}
            </h3>
            <p>{feature.description}</p>
          </Link>
        ))}
      </div>
      
      <div className="dashboard-info mt-3">
        <h2>About This System</h2>
        <p>
          This intelligent customer service system leverages the power of Coze AI to provide 
          a comprehensive suite of tools for customer interaction. With support for images, 
          voice, text, and complex workflows, you can create rich, engaging experiences for 
          your customers.
        </p>
        <p>
          Navigate through the features using the sidebar to explore all capabilities.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;