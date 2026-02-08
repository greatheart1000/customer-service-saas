import React, { useState, useEffect } from 'react';
import './Settings.css';

const Settings = () => {
  const [apiToken, setApiToken] = useState('');
  const [botId, setBotId] = useState('');
  const [workspaceId, setWorkspaceId] = useState('');
  const [apiBase, setApiBase] = useState('https://api.coze.cn');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Load settings from localStorage on component mount
    const savedSettings = JSON.parse(localStorage.getItem('customerServiceSettings')) || {};
    setApiToken(savedSettings.apiToken || '');
    setBotId(savedSettings.botId || '');
    setWorkspaceId(savedSettings.workspaceId || '');
    setApiBase(savedSettings.apiBase || 'https://api.coze.cn');
  }, []);

  const handleSave = () => {
    // Save settings to localStorage
    const settings = {
      apiToken,
      botId,
      workspaceId,
      apiBase
    };
    
    localStorage.setItem('customerServiceSettings', JSON.stringify(settings));
    setSaved(true);
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      setSaved(false);
    }, 3000);
  };

  const handleReset = () => {
    setApiToken('');
    setBotId('');
    setWorkspaceId('');
    setApiBase('https://api.coze.cn');
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all settings?')) {
      localStorage.removeItem('customerServiceSettings');
      handleReset();
    }
  };

  return (
    <div className="settings">
      <h1>⚙️ Settings</h1>
      <p className="subtitle">Configure your API credentials and preferences</p>
      
      <div className="card">
        {saved && (
          <div className="success-message">
            Settings saved successfully!
          </div>
        )}
        
        <div className="form-group">
          <label htmlFor="apiToken">API Token *</label>
          <input
            type="password"
            id="apiToken"
            value={apiToken}
            onChange={(e) => setApiToken(e.target.value)}
            placeholder="Enter your Coze API token"
          />
          <p className="help-text">Required for authenticating with the Coze API</p>
        </div>
        
        <div className="form-group">
          <label htmlFor="botId">Bot ID *</label>
          <input
            type="text"
            id="botId"
            value={botId}
            onChange={(e) => setBotId(e.target.value)}
            placeholder="Enter your bot ID"
          />
          <p className="help-text">The ID of your customer service bot</p>
        </div>
        
        <div className="form-group">
          <label htmlFor="workspaceId">Workspace ID *</label>
          <input
            type="text"
            id="workspaceId"
            value={workspaceId}
            onChange={(e) => setWorkspaceId(e.target.value)}
            placeholder="Enter your workspace ID"
          />
          <p className="help-text">Required for dataset and bot management features</p>
        </div>
        
        <div className="form-group">
          <label htmlFor="apiBase">API Base URL</label>
          <input
            type="text"
            id="apiBase"
            value={apiBase}
            onChange={(e) => setApiBase(e.target.value)}
            placeholder="https://api.coze.cn"
          />
          <p className="help-text">API endpoint (use https://api.coze.com for international)</p>
        </div>
        
        <div className="button-group">
          <button 
            className="btn btn-primary" 
            onClick={handleSave}
            disabled={!apiToken.trim() || !botId.trim() || !workspaceId.trim()}
          >
            Save Settings
          </button>
          <button 
            className="btn btn-secondary" 
            onClick={handleReset}
          >
            Reset
          </button>
          <button 
            className="btn btn-danger" 
            onClick={handleClearAll}
          >
            Clear All
          </button>
        </div>
      </div>
      
      <div className="info-section">
        <h3>Configuration Guide</h3>
        <ul>
          <li><strong>API Token</strong>: Obtain from Coze developer dashboard</li>
          <li><strong>Bot ID</strong>: Copy from your bot's URL in Coze platform</li>
          <li><strong>Workspace ID</strong>: Found in your workspace settings</li>
          <li><strong>API Base URL</strong>: 
            <ul>
              <li>China: https://api.coze.cn</li>
              <li>International: https://api.coze.com</li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Settings;