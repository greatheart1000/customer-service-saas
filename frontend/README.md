# Intelligent Customer Service Frontend

A modern web interface for the Intelligent Customer Service System with multimodal AI capabilities.

## Features

- **Image Recognition**: Upload and analyze images with AI-powered recognition
- **Voice Interaction**: Real-time voice conversations with speech recognition and synthesis
- **Text Chat**: Traditional text-based chat with intelligent responses
- **Workflow Management**: Execute and manage complex workflow processes
- **Conversation Management**: View and manage conversation histories
- **Bot Management**: Create, manage, and deploy intelligent bots
- **Audio HTTP Service**: Convert text to speech with various voice options
- **Settings**: Configure API keys and system preferences

## Tech Stack

- **React** - JavaScript library for building user interfaces
- **Vite** - Next generation frontend tooling
- **React Router** - Declarative routing for React
- **CSS Modules** - Scoped CSS for components

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```

2. Navigate to the frontend directory:
   ```bash
   cd customer_service/frontend
   ```

3. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

### Development

Start the development server:
```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:3000`.

### Building for Production

Create a production build:
```bash
npm run build
# or
yarn build
```

Preview the production build:
```bash
npm run preview
# or
yarn preview
```

## Project Structure

```
frontend/
├── public/                 # Static assets
├── src/
│   ├── components/         # React components
│   ├── assets/             # Images, icons, etc.
│   ├── App.jsx             # Main application component
│   ├── main.jsx            # Application entry point
│   └── index.css           # Global styles
├── index.html              # HTML template
├── vite.config.js          # Vite configuration
└── package.json            # Project dependencies and scripts
```

## Components

Each feature is implemented as a separate React component:

- `Dashboard.jsx` - Main dashboard with feature overview
- `ImageRecognition.jsx` - Image analysis interface
- `VoiceInteraction.jsx` - Voice chat interface
- `TextChat.jsx` - Text-based chat interface
- `WorkflowManagement.jsx` - Workflow execution and management
- `ConversationManagement.jsx` - Conversation history management
- `BotManagement.jsx` - Bot creation and deployment
- `AudioHttpService.jsx` - Text-to-speech functionality
- `Settings.jsx` - Configuration management

## Styling

The application uses CSS modules for component-scoped styling. Each component has its own CSS file with styles specific to that component.

## Routing

The application uses React Router for navigation between different features. Routes are defined in `App.jsx`.

## Local Storage

User settings are persisted in the browser's local storage for convenience.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## License

This project is licensed under the MIT License.