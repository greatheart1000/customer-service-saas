import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Footer from './components/Footer';
import ImageRecognition from './components/ImageRecognition';
import VoiceInteraction from './components/VoiceInteraction';
import TextChat from './components/TextChat';
import WorkflowManagement from './components/WorkflowManagement';
import ConversationManagement from './components/ConversationManagement';
import BotManagement from './components/BotManagement';
import AudioHttpService from './components/AudioHttpService';
import Settings from './components/Settings';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Header />
        <div className="main-container">
          <Sidebar />
          <div className="content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/image-recognition" element={<ImageRecognition />} />
              <Route path="/voice-interaction" element={<VoiceInteraction />} />
              <Route path="/text-chat" element={<TextChat />} />
              <Route path="/workflows" element={<WorkflowManagement />} />
              <Route path="/conversations" element={<ConversationManagement />} />
              <Route path="/bots" element={<BotManagement />} />
              <Route path="/audio-http" element={<AudioHttpService />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </div>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;