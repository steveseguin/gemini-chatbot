# Gemini live chat with Vision👁️ + Audio👂🔊 + Text💬 support

A real-time video chat interface powered by Google's Gemini Vision AI, enabling live video analysis and natural language processing capabilities.

![License](https://img.shields.io/badge/license-MIT-blue.svg)

<img src="https://github.com/user-attachments/assets/948d5cb5-2c35-430c-b799-dfe23dc07bcb" height="200">

## Live Demo

Try it now: [Gemini Vision Chat Demo](https://steveseguin.github.io/gemini-chatbot)

> **Note:** You'll need your own Gemini API key to use the demo. Get one for free at [Google AI Studio](https://aistudio.google.com/app/apikey).

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

## Technical Implementation

### Audio Pipeline
1. **Input Capture**
   - Uses `getUserMedia()` to access microphone input
   - Creates `AudioContext` with 16kHz sample rate
   - Processes audio through `AudioWorkletNode`

2. **Audio Processing**
   - Audio chunks processed in 2048-sample buffers
   - Input samples converted to 16-bit PCM integers (range: -32768 to 32767)
   - AudioWorklet runs in separate thread for efficient processing
   - Continuous stream maintained through buffer management

3. **Audio Transmission**
   - Audio data encoded as base64 strings
   - Sent via WebSocket with MIME type: "audio/pcm;rate=16000"
   - Chunks sent at ~86ms intervals (2048 samples at 16kHz)

### Video Pipeline
1. **Video Capture**
   - Camera input accessed via `getUserMedia()`
   - Frames captured at 640x360 resolution
   - Processing rate: 1 frame every 200ms (5 FPS)

2. **Frame Processing**
   - Each frame drawn to offscreen canvas
   - Converted to JPEG format with 0.8 quality
   - Base64 encoded for transmission
   - MIME type: "image/jpeg"

### Receiving Audio Response
1. **Audio Reception**
   - Received as base64-encoded PCM data
   - 24kHz sample rate for playback
   - Processed in chunks with 8192*4 buffer size

2. **Playback Management**
   - Adaptive buffer target (default: 3 buffers)
   - 15ms silence padding between chunks
   - 50ms initial start delay
   - Underrun recovery with 200ms threshold
   - Gain ramping for smooth transitions

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
