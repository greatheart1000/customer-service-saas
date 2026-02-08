import React, { useState } from 'react';
import './AudioHttpService.css';

const AudioHttpService = () => {
  const [activeTab, setActiveTab] = useState('tts');
  const [textInput, setTextInput] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('');
  const [voices, setVoices] = useState([]);
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);

  const handleListVoices = async () => {
    setIsLoading(true);
    setResult('');

    try {
      // Simulate API call
      setTimeout(() => {
        const simulatedVoices = [
          { id: 'voice_1', name: 'Emma', language: 'English (US)', gender: 'Female' },
          { id: 'voice_2', name: 'Liam', language: 'English (US)', gender: 'Male' },
          { id: 'voice_3', name: 'Sophia', language: 'English (UK)', gender: 'Female' },
          { id: 'voice_4', name: 'Noah', language: 'English (UK)', gender: 'Male' },
          { id: 'voice_5', name: 'Isabella', language: 'Spanish', gender: 'Female' },
          { id: 'voice_6', name: 'Oliver', language: 'French', gender: 'Male' }
        ];
        
        setVoices(simulatedVoices);
        
        let resultText = 'Available Voices:\n\n';
        simulatedVoices.forEach((voice, index) => {
          resultText += `${index + 1}. Name: ${voice.name}
   ID: ${voice.id}
   Language: ${voice.language}
   Gender: ${voice.gender}

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

  const handleTextToSpeech = async () => {
    if (!textInput.trim()) {
      alert('Please enter text to convert');
      return;
    }

    setIsLoading(true);
    setResult('');
    setAudioUrl(null);

    try {
      // Simulate API call
      setTimeout(() => {
        const simulatedResult = `Text-to-Speech Conversion Successful!

Text: "${textInput}"
Voice: ${selectedVoice || 'Default'}
Status: Generated
Audio File: sample_audio_${Date.now()}.mp3`;
        
        setResult(simulatedResult);
        // In a real implementation, this would be a real audio URL
        setAudioUrl('#');
        setIsLoading(false);
      }, 2000);
    } catch (error) {
      setResult(`Error: ${error.message}`);
      setIsLoading(false);
    }
  };

  const handleBatchTTS = async () => {
    if (!textInput.trim()) {
      alert('Please enter text to convert (separate multiple texts with semicolons)');
      return;
    }

    setIsLoading(true);
    setResult('');
    setAudioUrl(null);

    try {
      // Simulate API call
      setTimeout(() => {
        const texts = textInput.split(';').map(t => t.trim()).filter(t => t);
        
        let resultText = `Batch Text-to-Speech Conversion Successful!

Processed ${texts.length} texts:

`;
        
        texts.forEach((text, index) => {
          resultText += `${index + 1}. Text: "${text}"\n   Audio File: batch_audio_${index + 1}_${Date.now()}.mp3\n\n`;
        });
        
        setResult(resultText);
        setIsLoading(false);
      }, 2500);
    } catch (error) {
      setResult(`Error: ${error.message}`);
      setIsLoading(false);
    }
  };

  const handlePlayAudio = () => {
    if (audioUrl) {
      // In a real implementation, you would play the actual audio
      alert('In a real implementation, this would play the generated audio file.');
    }
  };

  const handleReset = () => {
    setTextInput('');
    setSelectedVoice('');
    setVoices([]);
    setResult('');
    setAudioUrl(null);
  };

  return (
    <div className="audio-http-service">
      <h1>🎵 Audio HTTP Service</h1>
      <p className="subtitle">Convert text to speech with various voice options</p>
      
      <div className="tabs">
        <button 
          className={activeTab === 'tts' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('tts')}
        >
          Text to Speech
        </button>
        <button 
          className={activeTab === 'voices' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('voices')}
        >
          Voice Management
        </button>
        <button 
          className={activeTab === 'batch' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('batch')}
        >
          Batch TTS
        </button>
      </div>
      
      <div className="card">
        {activeTab === 'tts' && (
          <div className="tab-content">
            <div className="form-group">
              <label htmlFor="textInput">Text to Convert:</label>
              <textarea
                id="textInput"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Enter text to convert to speech"
                rows="4"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="voiceSelect">Select Voice (optional):</label>
              <select
                id="voiceSelect"
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value)}
              >
                <option value="">Default Voice</option>
                <option value="voice_1">Emma (English US Female)</option>
                <option value="voice_2">Liam (English US Male)</option>
                <option value="voice_3">Sophia (English UK Female)</option>
                <option value="voice_4">Noah (English UK Male)</option>
              </select>
            </div>
            
            <div className="button-group">
              <button 
                className="btn btn-primary" 
                onClick={handleTextToSpeech}
                disabled={isLoading}
              >
                {isLoading ? 'Converting...' : 'Convert to Speech'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={handleReset}>
                Reset
              </button>
            </div>
          </div>
        )}
        
        {activeTab === 'voices' && (
          <div className="tab-content">
            <div className="button-group">
              <button 
                className="btn btn-primary" 
                onClick={handleListVoices}
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : 'List Available Voices'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={handleReset}>
                Reset
              </button>
            </div>
          </div>
        )}
        
        {activeTab === 'batch' && (
          <div className="tab-content">
            <div className="form-group">
              <label htmlFor="batchTextInput">Texts to Convert (separate with semicolons):</label>
              <textarea
                id="batchTextInput"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Enter multiple texts separated by semicolons;Like this;And this;Another text"
                rows="4"
              />
            </div>
            
            <div className="button-group">
              <button 
                className="btn btn-primary" 
                onClick={handleBatchTTS}
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Batch Convert'}
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
            
            {audioUrl && (
              <div className="audio-player">
                <button 
                  className="btn btn-success" 
                  onClick={handlePlayAudio}
                >
                  Play Generated Audio
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioHttpService;