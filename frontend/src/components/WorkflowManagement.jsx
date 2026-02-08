import React, { useState } from 'react';
import './WorkflowManagement.css';

const WorkflowManagement = () => {
  const [activeTab, setActiveTab] = useState('execute');
  const [workflowId, setWorkflowId] = useState('');
  const [parameters, setParameters] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [executionType, setExecutionType] = useState('stream');

  const handleExecute = async (e) => {
    e.preventDefault();
    if (!workflowId.trim()) {
      alert('Please enter a workflow ID');
      return;
    }

    setIsLoading(true);
    setResult('');

    try {
      // Simulate API call
      setTimeout(() => {
        let simulatedResult = '';
        
        switch (executionType) {
          case 'stream':
            simulatedResult = `Stream Workflow Execution Result:

Workflow ID: ${workflowId}
Status: Running

Event 1: Message - "Processing your request"
Event 2: Message - "Analyzing parameters"
Event 3: Message - "Generating response"
Event 4: Completed - "Task finished successfully"

Token usage: 1245 tokens`;
            break;
          case 'no-stream':
            simulatedResult = `Non-Stream Workflow Execution Result:

Workflow ID: ${workflowId}
Status: Completed
Result: {"response": "This is a sample workflow response", "data": {"field1": "value1", "field2": "value2"}}

Processing time: 2.45 seconds`;
            break;
          case 'async':
            simulatedResult = `Async Workflow Execution Result:

Workflow ID: ${workflowId}
Execution ID: exec_123456789
Status: Started

The workflow is now running in the background. You can check its status using the execution ID.`;
            break;
          default:
            simulatedResult = 'Workflow executed successfully.';
        }
        
        setResult(simulatedResult);
        setIsLoading(false);
      }, 2000);
    } catch (error) {
      setResult(`Error: ${error.message}`);
      setIsLoading(false);
    }
  };

  const handleListVersions = async () => {
    setIsLoading(true);
    setResult('');

    try {
      // Simulate API call
      setTimeout(() => {
        const simulatedResult = `Workflow Versions:

Version 1.0.0 - Status: Active - Created: 2025-12-01
Version 0.9.5 - Status: Deprecated - Created: 2025-11-15
Version 0.9.0 - Status: Inactive - Created: 2025-10-20
Version 0.8.2 - Status: Inactive - Created: 2025-09-30`;
        setResult(simulatedResult);
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      setResult(`Error: ${error.message}`);
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setWorkflowId('');
    setParameters('');
    setResult('');
    setExecutionType('stream');
  };

  return (
    <div className="workflow-management">
      <h1>🔄 Workflow Management</h1>
      <p className="subtitle">Execute and manage your AI workflows</p>
      
      <div className="tabs">
        <button 
          className={activeTab === 'execute' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('execute')}
        >
          Execute Workflow
        </button>
        <button 
          className={activeTab === 'versions' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('versions')}
        >
          Workflow Versions
        </button>
      </div>
      
      <div className="card">
        {activeTab === 'execute' && (
          <div className="tab-content">
            <form onSubmit={handleExecute}>
              <div className="form-group">
                <label htmlFor="workflowId">Workflow ID:</label>
                <input
                  type="text"
                  id="workflowId"
                  value={workflowId}
                  onChange={(e) => setWorkflowId(e.target.value)}
                  placeholder="Enter workflow ID"
                />
              </div>
              
              <div className="form-group">
                <label>Execution Type:</label>
                <div className="radio-group">
                  <label>
                    <input
                      type="radio"
                      value="stream"
                      checked={executionType === 'stream'}
                      onChange={(e) => setExecutionType(e.target.value)}
                    />
                    Stream
                  </label>
                  <label>
                    <input
                      type="radio"
                      value="no-stream"
                      checked={executionType === 'no-stream'}
                      onChange={(e) => setExecutionType(e.target.value)}
                    />
                    Non-Stream
                  </label>
                  <label>
                    <input
                      type="radio"
                      value="async"
                      checked={executionType === 'async'}
                      onChange={(e) => setExecutionType(e.target.value)}
                    />
                    Async
                  </label>
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="parameters">Parameters (JSON):</label>
                <textarea
                  id="parameters"
                  value={parameters}
                  onChange={(e) => setParameters(e.target.value)}
                  placeholder='{"key": "value", "input": "sample input"}'
                  rows="4"
                />
              </div>
              
              <div className="button-group">
                <button type="submit" className="btn btn-primary" disabled={isLoading}>
                  {isLoading ? 'Executing...' : 'Execute Workflow'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={handleReset}>
                  Reset
                </button>
              </div>
            </form>
          </div>
        )}
        
        {activeTab === 'versions' && (
          <div className="tab-content">
            <div className="form-group">
              <label htmlFor="workflowIdVersions">Workflow ID:</label>
              <input
                type="text"
                id="workflowIdVersions"
                value={workflowId}
                onChange={(e) => setWorkflowId(e.target.value)}
                placeholder="Enter workflow ID"
              />
            </div>
            
            <div className="button-group">
              <button 
                className="btn btn-primary" 
                onClick={handleListVersions}
                disabled={isLoading || !workflowId.trim()}
              >
                {isLoading ? 'Loading...' : 'List Versions'}
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

export default WorkflowManagement;