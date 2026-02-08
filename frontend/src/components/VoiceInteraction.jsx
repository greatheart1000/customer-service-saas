import React, { useState, useRef } from 'react';
import './VoiceInteraction.css';

const VoiceInteraction = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        // In a real implementation, you would send this blob to your backend
        // For now, we'll simulate the process
        simulateVoiceProcessing(audioBlob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setTranscript('');
      setResponse('');
      setAudioUrl(null);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsLoading(true);
      
      // Stop all tracks
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const simulateVoiceProcessing = (audioBlob) => {
    // Simulate transcription
    setTimeout(() => {
      setTranscript("Hello, this is a sample transcription of your voice input.");
      
      // Simulate AI response generation
      setTimeout(() => {
        setResponse("Thank you for your message. This is a simulated response from the AI assistant. In a real implementation, this would be generated based on your actual input.");
        
        // Simulate audio generation
        setTimeout(() => {
          // Create a simulated audio URL
          setAudioUrl('#'); // In reality, this would be a real audio URL
          setIsLoading(false);
        }, 1000);
      }, 1500);
    }, 1000);
  };

  const playResponse = () => {
    if (audioUrl) {
      setIsPlaying(true);
      // In a real implementation, you would play the actual audio
      // For now, we'll just simulate
      setTimeout(() => {
        setIsPlaying(false);
      }, 3000);
    }
  };

  const handleReset = () => {
    setTranscript('');
    setResponse('');
    setAudioUrl(null);
    setIsRecording(false);
    setIsPlaying(false);
    setIsLoading(false);
    
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  return (
    <div className="voice-interaction">
      <h1>🎤 Voice Interaction</h1>
      <p className="subtitle">Speak naturally and get AI-powered responses</p>
      
      <div className="card">
        <div className="voice-controls">
          <div className="recording-section">
            <h3>Voice Input</h3>
            <div className="recording-indicator">
              <div className={`mic-icon ${isRecording ? 'recording' : ''}`}>
                {isRecording ? '🔴' : '⚪'}
              </div>
              <p>{isRecording ? 'Recording... Speak now' : 'Ready to record'}</p>
            </div>
            
            <div className="button-group">
              {!isRecording ? (
                <button 
                  className="btn btn-primary" 
                  onClick={startRecording}
                  disabled={isLoading}
                >
                  Start Recording
                </button>
              ) : (
                <button 
                  className="btn btn-danger" 
                  onClick={stopRecording}
                >
                  Stop Recording
                </button>
              )}
              <button 
                className="btn btn-secondary" 
                onClick={handleReset}
                disabled={isLoading}
              >
                Reset
              </button>
            </div>
          </div>
          
          {transcript && (
            <div className="transcript-section">
              <h3>Transcribed Text</h3>
              <div className="result-container">
                <p>{transcript}</p>
              </div>
            </div>
          )}
          
          {isLoading && (
            <div className="processing-section">
              <div className="spinner"></div>
              <p>Processing your voice input...</p>
            </div>
          )}
          
          {response && (
            <div className="response-section">
              <h3>AI Response</h3>
              <div className="result-container">
                <p>{response}</p>
              </div>
              
              <div className="audio-controls">
                <button 
                  className="btn btn-primary" 
                  onClick={playResponse}
                  disabled={isPlaying}
                >
                  {isPlaying ? 'Playing...' : 'Play Response'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="info-section">
        <h3>How It Works</h3>
        <ul>
          <li>Click "Start Recording" and speak naturally</li>
          <li>Click "Stop Recording" when finished</li>
          <li>The system will transcribe your speech and generate a response</li>
          <li>Listen to the AI response using the "Play Response" button</li>
        </ul>
      </div>
    </div>
  );
};

export default VoiceInteraction;