# Gemini Vision Chat

A real-time video chat interface powered by Google's Gemini Vision AI, enabling live video analysis and natural language processing capabilities.

![License](https://img.shields.io/badge/license-MIT-blue.svg)

## Features

- Real-time video and audio streaming with Gemini Vision AI
- Live video analysis and natural language processing
- Text and audio response options with multiple voice choices
- Adaptive audio buffering for smooth playback
- Markdown message formatting support
- Device selection for multiple cameras and microphones
- Secure API key management
- Dark mode interface
- Mobile-responsive design

## Prerequisites

- Google Gemini API key (obtain from [Google AI Studio](https://aistudio.google.com/app/apikey))
- Modern web browser with WebRTC support
- Webcam and microphone access

## Technical Stack

- Vanilla JavaScript
- WebRTC for media streaming
- WebSocket for real-time communication
- Web Audio API for sound processing
- AudioWorklet for audio processing
- Canvas API for video frame capture

## Setup and Usage

1. Clone the repository
2. Open `index.html` in a web browser
3. Enter your Gemini API key in the designated field
4. Select your preferred video and audio input devices
5. Choose between text or audio responses
6. Click "Start Stream" to begin the session

## API Integration

The application integrates with Google's Gemini API using WebSocket connections for real-time communication:

```javascript
wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent
```

## Components

### GoogleLivePublisher
Handles the main communication with Gemini API, including:
- Stream management
- WebSocket communication
- Audio/video processing
- Message handling

### AudioPlayer
Manages audio playback with features like:
- Adaptive buffering
- Silence padding
- Underrun recovery
- Gain control

### MessageFormatter
Handles chat message formatting with:
- Markdown support
- Message buffering
- Auto-scrolling
- Message timing

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Security

- API keys are stored locally
- Secure WebSocket connections
- No external data storage
- Client-side processing only

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Author

Steve Seguin  
GitHub: [@steveseguin](https://github.com/steveseguin)

## Acknowledgments

- Google Gemini AI team for the API
- Web Audio API contributors
- WebRTC standard contributors
