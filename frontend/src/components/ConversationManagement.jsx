import React, { useState } from 'react';
import './ConversationManagement.css';

const ConversationManagement = () => {
  const [activeTab, setActiveTab] = useState('list');
  const [conversationId, setConversationId] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [messageRole, setMessageRole] = useState('user');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pageSize, setPageSize] = useState(10);

  const handleCreateConversation = async () => {
    setIsLoading(true);
    setResult('');

    try {
      // Simulate API call
      setTimeout(() => {
        const simulatedResult = `Conversation Created Successfully!

Conversation ID: conv_${Date.now()}
Created At: ${new Date().toISOString()}
Status: Active`;
        setResult(simulatedResult);
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      setResult(`Error: ${error.message}`);
      setIsLoading(false);
    }
  };

  const handleRetrieveConversation = async () => {
    if (!conversationId.trim()) {
      alert('Please enter a conversation ID');
      return;
    }

    setIsLoading(true);
    setResult('');

    try {
      // Simulate API call
      setTimeout(() => {
        const simulatedResult = `Conversation Details:

ID: ${conversationId}
Created At: 2025-12-15T10:30:00Z
Last Activity: 2025-12-17T14:45:00Z
Status: Active
Messages: 12`;
        setResult(simulatedResult);
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      setResult(`Error: ${error.message}`);
      setIsLoading(false);
    }
  };

  const handleAddMessage = async () => {
    if (!conversationId.trim() || !messageContent.trim()) {
      alert('Please enter both conversation ID and message content');
      return;
    }

    setIsLoading(true);
    setResult('');

    try {
      // Simulate API call
      setTimeout(() => {
        const simulatedResult = `Message Added Successfully!

Conversation ID: ${conversationId}
Message ID: msg_${Date.now()}
Role: ${messageRole}
Content: ${messageContent}
Timestamp: ${new Date().toISOString()}`;
        setResult(simulatedResult);
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      setResult(`Error: ${error.message}`);
      setIsLoading(false);
    }
  };

  const handleListConversations = async () => {
    setIsLoading(true);
    setResult('');

    try {
      // Simulate API call
      setTimeout(() => {
        const conversations = [];
        for (let i = 1; i <= pageSize; i++) {
          conversations.push({
            id: `conv_${Date.now() - i * 1000}`,
            createdAt: new Date(Date.now() - i * 3600000).toISOString(),
            lastSectionId: `sec_${i}`
          });
        }

        let resultText = `Conversations List (${pageSize} items):\n\n`;
        conversations.forEach((conv, index) => {
          resultText += `${index + 1}. ID: ${conv.id}
   Created: ${conv.createdAt}
   Last Section: ${conv.lastSectionId}

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

  const handleClearConversation = async () => {
    if (!conversationId.trim()) {
      alert('Please enter a conversation ID');
      return;
    }

    setIsLoading(true);
    setResult('');

    try {
      // Simulate API call
      setTimeout(() => {
        const simulatedResult = `Conversation Cleared Successfully!

Conversation ID: ${conversationId}
Status: Cleared
Messages Removed: All`;
        setResult(simulatedResult);
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      setResult(`Error: ${error.message}`);
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setConversationId('');
    setMessageContent('');
    setMessageRole('user');
    setResult('');
    setPageSize(10);
  };

  return (
    <div className="conversation-management">
      <h1>📂 Conversation Management</h1>
      <p className="subtitle">Manage conversation histories and messages</p>
      
      <div className="tabs">
        <button 
          className={activeTab === 'list' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('list')}
        >
          List Conversations
        </button>
        <button 
          className={activeTab === 'create' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('create')}
        >
          Create Conversation
        </button>
        <button 
          className={activeTab === 'manage' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('manage')}
        >
          Manage Conversation
        </button>
      </div>
      
      <div className="card">
        {activeTab === 'list' && (
          <div className="tab-content">
            <div className="form-group">
              <label htmlFor="pageSize">Page Size:</label>
              <input
                type="number"
                id="pageSize"
                value={pageSize}
                onChange={(e) => setPageSize(parseInt(e.target.value) || 10)}
                min="1"
                max="100"
              />
            </div>
            
            <div className="button-group">
              <button 
                className="btn btn-primary" 
                onClick={handleListConversations}
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : 'List Conversations'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={handleReset}>
                Reset
              </button>
            </div>
          </div>
        )}
        
        {activeTab === 'create' && (
          <div className="tab-content">
            <div className="button-group">
              <button 
                className="btn btn-primary" 
                onClick={handleCreateConversation}
                disabled={isLoading}
              >
                {isLoading ? 'Creating...' : 'Create New Conversation'}
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
              <label htmlFor="conversationId">Conversation ID:</label>
              <input
                type="text"
                id="conversationId"
                value={conversationId}
                onChange={(e) => setConversationId(e.target.value)}
                placeholder="Enter conversation ID"
              />
            </div>
            
            <div className="operation-buttons">
              <button 
                className="btn btn-primary" 
                onClick={handleRetrieveConversation}
                disabled={isLoading}
              >
                Retrieve Details
              </button>
              <button 
                className="btn btn-warning" 
                onClick={handleClearConversation}
                disabled={isLoading}
              >
                Clear Conversation
              </button>
            </div>
            
            <div className="form-group">
              <label htmlFor="messageContent">Add Message:</label>
              <textarea
                id="messageContent"
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                placeholder="Enter message content"
                rows="3"
              />
            </div>
            
            <div className="form-group">
              <label>Message Role:</label>
              <div className="radio-group">
                <label>
                  <input
                    type="radio"
                    value="user"
                    checked={messageRole === 'user'}
                    onChange={(e) => setMessageRole(e.target.value)}
                  />
                  User
                </label>
                <label>
                  <input
                    type="radio"
                    value="assistant"
                    checked={messageRole === 'assistant'}
                    onChange={(e) => setMessageRole(e.target.value)}
                  />
                  Assistant
                </label>
              </div>
            </div>
            
            <div className="button-group">
              <button 
                className="btn btn-primary" 
                onClick={handleAddMessage}
                disabled={isLoading}
              >
                {isLoading ? 'Adding...' : 'Add Message'}
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

export default ConversationManagement;