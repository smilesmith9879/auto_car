# Sheikah AI Car Control

A comprehensive solution for an AI-powered four-wheel drive car based on Raspberry Pi 5, featuring web remote control, visual SLAM, autonomous navigation, and voice interaction.

## Features

- **Web Control**: Control the car's movement using a simulated joystick on the web, adjust the camera gimbal angles, and view the camera feed in real time.
- **Camera Gimbal Control**: The servo supports up, down, left, and right rotation, controlled via a slider on the web interface.
- **Real-time Video Streaming**: Based on WebRTC for low-latency camera feed transmission.
- **Remote API Control**: Use Flask API + WebSocket for remote control of the car and camera.
- **Map Modeling**: Construct a visual SLAM map of the car's environment using ORB-SLAM3.
- **Map Partitioning & Naming**: Users can manually name room areas on the web (e.g., "Living Room", "Bedroom").
- **Path Planning & Autonomous Navigation**: Plan the optimal path based on ORB-SLAM3 trajectories & A* algorithm.
- **Voice Interaction**: Utilize Whisper + Ollama + DeepSeekR1 1.7B for local voice recognition & interaction.

## Hardware Requirements

- **Computing Unit**: Raspberry Pi 5
- **Camera**: Official Raspberry Pi Camera
- **Car Chassis**: LOBOT Four-Wheel Drive Chassis
- **Motor Driver**: PCA9685 + L298N
- **Servo Gimbal**: MG996R + PCA9685
- **Voice Processing**: ReSpeaker 2-Mic / 4-Mic
- **IMU**: MPU6050
- **Power System**: 18650 Lithium Battery + BMS

## Software Architecture

The software is organized into several modules:

- **Movement Controller**: Controls the car's movement using PCA9685 and L298N motor drivers.
- **Camera Controller**: Controls the camera gimbal using PCA9685 servo control.
- **Mapping Controller**: Handles ORB-SLAM3 integration, map management, and path planning.
- **Voice Controller**: Handles voice commands using Whisper + Ollama + DeepSeekR1 1.7B.
- **Battery Monitor**: Monitors the battery level and provides low battery alerts.

## Installation

### Prerequisites

- Python 3.7 or higher
- pip (Python package installer)

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/sheikah-ai-car.git
   cd sheikah-ai-car
   ```

2. Install the required packages:
   ```bash
   pip install -r requirements.txt
   ```

3. For real hardware implementation, uncomment the hardware-specific dependencies in `requirements.txt` and install them:
   ```bash
   # Uncomment hardware dependencies in requirements.txt
   pip install -r requirements.txt
   ```

## Hardware Configuration

### Motor Control with LOBOROBOT

This project uses the LOBOROBOT.py library for motor control. The LOBOROBOT library provides a simple interface for controlling the car's movement, including:

- Forward/backward movement
- Left/right turns
- Lateral movement
- Servo control for camera gimbal

### Camera with libcamera

The project uses the Raspberry Pi Camera Module with libcamera instead of OpenCV. libcamera provides better performance and more direct control over the Raspberry Pi camera hardware.

### Installation Requirements

To use the hardware components, you need to install the following dependencies:

```bash
# Install libcamera and related packages
sudo apt-get update
sudo apt-get install -y python3-libcamera python3-picamera2

# Install other required packages
pip install -r requirements.txt
```

### Hardware Setup

1. Connect the motors to the appropriate pins as defined in the LOBOROBOT.py library
2. Connect the Raspberry Pi Camera Module
3. Make sure the LOBOROBOT.py file is in the modules directory

## Running the Application

### Simulation Mode

To run the application in simulation mode (without real hardware):

```bash
python app.py
```

This will start the Flask server on http://localhost:5000. You can access the web interface by opening this URL in your browser.

### Hardware Mode

To run the application with real hardware on a Raspberry Pi:

1. Connect the hardware components according to the wiring diagram.
2. Uncomment the hardware-specific code in the controller modules.
3. Run the application:
   ```bash
   python app.py --hardware
   ```

## API Documentation

The application provides a RESTful API for controlling the car:

- **GET /api/status**: Get the current status of the car
- **POST /api/movement**: Control the car's movement
  - Parameters: `direction` (forward, backward, left, right, stop), `speed` (0-100)
- **POST /api/camera**: Control the camera gimbal
  - Parameters: `control` (pan, tilt), `value` (angle in degrees)
- **GET /api/map**: Get the current map data
- **POST /api/map**: Control mapping operations
  - Parameters: `action` (start, stop, save, load), additional parameters based on action
- **GET /api/map/available**: Get a list of available maps
- **POST /api/map/location**: Name a location on the map
  - Parameters: `name` (location name), `position` (optional, x/y coordinates)
- **POST /api/navigation**: Control navigation operations
  - Parameters: `action` (start, stop), `destination` (for start action)
- **POST /api/voice**: Process a voice command
  - Parameters: `command` (voice command text)
- **GET /api/battery**: Get battery status

## WebSocket Events

The application also provides WebSocket events for real-time updates:

- **status**: Sent when a client connects, contains the current car state
- **position_update**: Sent when the car's position changes
- **battery_update**: Sent when the battery status changes
- **video_frame**: Sent when a new video frame is available

## Backend Implementation

The backend is implemented using Flask and Flask-SocketIO, with the following components:

### Core Modules

- **Movement Controller**: Controls the four motors for movement using PCA9685 PWM controller and L298N motor drivers.
- **Camera Controller**: Controls the camera gimbal servos and handles video streaming.
- **Mapping Controller**: Manages SLAM mapping, location naming, and autonomous navigation.
- **Voice Controller**: Processes voice commands and generates appropriate responses.
- **Battery Monitor**: Monitors battery level, voltage, and power consumption.

### Communication

- **REST API**: Provides endpoints for controlling the car and retrieving data.
- **WebSockets**: Enables real-time communication for video streaming and status updates.

### Simulation Mode

The backend includes a simulation mode that allows testing without physical hardware:

- Simulated motor control
- Simulated camera feed with visual elements
- Simulated SLAM mapping with room generation
- Simulated battery discharge and monitoring

### Hardware Integration

When running on actual hardware, the backend interfaces with:

- PCA9685 PWM controller for motors and servos
- Raspberry Pi Camera for video streaming
- INA219 current sensor for battery monitoring
- ORB-SLAM3 for visual SLAM mapping
- Whisper and Ollama for voice recognition and processing

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [ORB-SLAM3](https://github.com/UZ-SLAMLab/ORB_SLAM3) for visual SLAM
- [Whisper](https://github.com/openai/whisper) for voice recognition
- [Ollama](https://github.com/ollama/ollama) for local LLM inference
- [DeepSeekR1](https://github.com/deepseek-ai/DeepSeek-Coder) for code generation