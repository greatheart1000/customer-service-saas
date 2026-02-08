import React, { useState } from 'react';
import './BotManagement.css';

const BotManagement = () => {
  const [activeTab, setActiveTab] = useState('list');
  const [botName, setBotName] = useState('');
  const [botId, setBotId] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [testInput, setTestInput] = useState('');

  const handleCreateBot = async () => {
    if (!botName.trim() || !systemPrompt.trim()) {
      alert('Please enter both bot name and system prompt');
      return;
    }

    setIsLoading(true);
    setResult('');

    try {
      // Simulate API call
      setTimeout(() => {
        const simulatedResult = `Bot Created Successfully!

Bot Name: ${botName}
Bot ID: bot_${Date.now()}
System Prompt: ${systemPrompt}
Status: Draft
Created At: ${new Date().toISOString()}`;
        setResult(simulatedResult);
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      setResult(`Error: ${error.message}`);
      setIsLoading(false);
    }
  };

  const handleUpdateBot = async () => {
    if (!botId.trim()) {
      alert('Please enter a bot ID');
      return;
    }

    setIsLoading(true);
    setResult('');

    try {
      // Simulate API call
      setTimeout(() => {
        const simulatedResult = `Bot Updated Successfully!

Bot ID: ${botId}
Updated Fields: ${botName ? 'Name, ' : ''}${systemPrompt ? 'System Prompt' : ''}
Status: Updated
Last Modified: ${new Date().toISOString()}`;
        setResult(simulatedResult);
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      setResult(`Error: ${error.message}`);
      setIsLoading(false);
    }
  };

  const handlePublishBot = async () => {
    if (!botId.trim()) {
      alert('Please enter a bot ID');
      return;
    }

    setIsLoading(true);
    setResult('');

    try {
      // Simulate API call
      setTimeout(() => {
        const simulatedResult = `Bot Published Successfully!

Bot ID: ${botId}
Status: Published
Published At: ${new Date().toISOString()}
Channel: API`;
        setResult(simulatedResult);
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      setResult(`Error: ${error.message}`);
      setIsLoading(false);
    }
  };

  const handleListBots = async () => {
    setIsLoading(true);
    setResult('');

    try {
      // Simulate API call
      setTimeout(() => {
        const bots = [
          { id: 'bot_12345', name: 'Customer Support Bot', status: 'Published', createdAt: '2025-12-01' },
          { id: 'bot_67890', name: 'Technical Assistant', status: 'Draft', createdAt: '2025-12-10' },
          { id: 'bot_54321', name: 'Sales Inquiry Bot', status: 'Published', createdAt: '2025-11-20' }
        ];

        let resultText = 'Bots List:\n\n';
        bots.forEach((bot, index) => {
          resultText += `${index + 1}. Name: ${bot.name}
   ID: ${bot.id}
   Status: ${bot.status}
   Created: ${bot.createdAt}

`;
        });

        setResult(resultText);
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      setResult(`Error: ${error.message}`);
      setIsLoading(false);
    }
  };

  const handleTestBot = async () => {
    if (!botId.trim() || !testInput.trim()) {
      alert('Please enter both bot ID and test input');
      return;
    }

    setIsLoading(true);
    setResult('');

    try {
      // Simulate API call
      setTimeout(() => {
        const simulatedResult = `Bot Test Result:

Bot ID: ${botId}
Input: ${testInput}

Response: Thank you for your message. This is a simulated response from the bot. In a real implementation, this would be generated based on your input and the bot's configuration.`;
        setResult(simulatedResult);
        setIsLoading(false);
      }, 2000);
    } catch (error) {
      setResult(`Error: ${error.message}`);
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setBotName('');
    setBotId('');
    setSystemPrompt('');
    setTestInput('');
    setResult('');
  };

  return (
    <div className="bot-management">
      <h1>🤖 Bot Management</h1>
      <p className="subtitle">Create, manage, and deploy intelligent bots</p>
      
      <div className="tabs">
        <button 
          className={activeTab === 'list' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('list')}
        >
          List Bots
        </button>
        <button 
          className={activeTab === 'create' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('create')}
        >
          Create Bot
        </button>
        <button 
          className={activeTab === 'manage' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('manage')}
        >
          Manage Bot
        </button>
        <button 
          className={activeTab === 'test' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('test')}
        >
          Test Bot
        </button>
      </div>
      
      <div className="card">
        {activeTab === 'list' && (
          <div className="tab-content">
            <div className="button-group">
              <button 
                className="btn btn-primary" 
                onClick={handleListBots}
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : 'List All Bots'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={handleReset}>
                Reset
              </button>
            </div>
          </div>
        )}
        
        {activeTab === 'create' && (
          <div className="tab-content">
            <div className="form-group">
              <label htmlFor="botName">Bot Name:</label>
              <input
                type="text"
                id="botName"
                value={botName}
                onChange={(e) => setBotName(e.target.value)}
                placeholder="Enter bot name"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="systemPrompt">System Prompt:</label>
              <textarea
                id="systemPrompt"
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                placeholder="Enter system prompt for the bot"
                rows="4"
              />
            </div>
            
            <div className="button-group">
              <button 
                className="btn btn-primary" 
                onClick={handleCreateBot}
                disabled={isLoading}
              >
                {isLoading ? 'Creating...' : 'Create Bot'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={handleReset}>
                Reset
              </button>
            </div>
          </div>
        )}
        
        {activeTab === 'manage' && (
          <div className="tab-content">
            <div className="form-group">
              <label htmlFor="botIdManage">Bot ID:</label>
              <input
                type="text"
                id="botIdManage"
                value={botId}
                onChange={(e) => setBotId(e.target.value)}
                placeholder="Enter bot ID"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="botNameUpdate">Bot Name (optional):</label>
              <input
                type="text"
                id="botNameUpdate"
                value={botName}
                onChange={(e) => setBotName(e.target.value)}
                placeholder="Enter new bot name"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="systemPromptUpdate">System Prompt (optional):</label>
              <textarea
                id="systemPromptUpdate"
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                placeholder="Enter new system prompt"
                rows="3"
              />
            </div>
            
            <div className="operation-buttons">
              <button 
                className="btn btn-primary" 
                onClick={handleUpdateBot}
                disabled={isLoading}
              >
                Update Bot
              </button>
              <button 
                className="btn btn-success" 
                onClick={handlePublishBot}
                disabled={isLoading}
              >
                Publish Bot
              </button>
            </div>
            
            <div className="button-group">
              <button type="button" className="btn btn-secondary" onClick={handleReset}>
                Reset
              </button>
            </div>
          </div>
        )}
        
        {activeTab === 'test' && (
          <div className="tab-content">
            <div className="form-group">
              <label htmlFor="botIdTest">Bot ID:</label>
              <input
                type="text"
                id="botIdTest"
                value={botId}
                onChange={(e) => setBotId(e.target.value)}
                placeholder="Enter bot ID"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="testInput">Test Input:</label>
              <textarea
                id="testInput"
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                placeholder="Enter test message for the bot"
                rows="3"
              />
            </div>
            
            <div className="button-group">
              <button 
                className="btn btn-primary" 
                onClick={handleTestBot}
                disabled={isLoading}
              >
                {isLoading ? 'Testing...' : 'Test Bot'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={handleReset}>
                Reset
              </button>
            </div>
          </div>
        )}
        
        {isLoading && <div className="spinner"></div>}
        
        {result && (
          <div className="result-container">
            <h3>Result:</h3>
            <pre>{result}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default BotManagement;