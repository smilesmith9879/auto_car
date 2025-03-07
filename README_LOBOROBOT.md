# LOBOROBOT and libcamera Implementation

This document describes the implementation of the Sheikah AI Car Control system using LOBOROBOT.py for motor control and libcamera for the Raspberry Pi camera.

## Overview

The system uses the following components:
- LOBOROBOT.py library for motor and servo control
- libcamera for Raspberry Pi camera access
- Flask and SocketIO for the web interface
- ServoControl for camera gimbal tracking

## Hardware Requirements

- Raspberry Pi (3 or 4 recommended)
- LOBO Robot car kit with motors and servos
- Raspberry Pi Camera Module
- Power supply for the Raspberry Pi and motors

## Software Dependencies

The following Python packages are required:
- flask
- flask-cors
- flask-socketio
- eventlet
- numpy
- Pillow
- RPi.GPIO
- picamera2
- libcamera

These dependencies are listed in the `requirements.txt` file.

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd auto_car
   ```

2. Install the required dependencies:
   ```
   pip install -r requirements.txt
   ```

3. Make sure the Raspberry Pi camera is enabled:
   ```
   sudo raspi-config
   ```
   Navigate to "Interface Options" > "Camera" and enable it.

4. Reboot the Raspberry Pi:
   ```
   sudo reboot
   ```

## Testing

You can test the LOBOROBOT and libcamera implementation using the provided test script:

```
python test_loborobot.py
```

This script will test:
- Basic movement functions (forward, backward, left, right)
- Camera functionality with libcamera
- ServoControl for camera pan/tilt with the new angle ranges
- Object tracking functionality
- Combined movement and camera tracking

## Usage

1. Start the server:
   ```
   python app.py
   ```

2. Open a web browser and navigate to:
   ```
   http://<raspberry-pi-ip>:5000
   ```

3. Use the web interface to control the car and camera.

## API Endpoints

The following API endpoints are available:

- `GET /api/status`: Get the current status of the car
- `POST /api/movement`: Control the car's movement
  - Parameters: `direction` (forward, backward, left, right, stop), `speed` (0-100)
- `POST /api/camera`: Control the camera gimbal
  - Parameters: `control` (pan, tilt), `angle` (degrees)
- `POST /api/camera/track`: Track an object with the camera
  - Parameters: `x` (object x-coordinate), `y` (object y-coordinate)
- `GET /api/map`: Get the current map
- `POST /api/map`: Control mapping functions
- `GET /api/map/available`: Get available maps
- `POST /api/map/location`: Name a location on the map
- `POST /api/navigation`: Control navigation functions
- `POST /api/voice`: Process voice commands
- `GET /api/battery`: Get battery status

## Implementation Details

### LOBOROBOT Integration

The LOBOROBOT.py library is used for controlling the motors and servos. It provides the following functions:

- `t_up(speed, t_time)`: Move forward
- `t_down(speed, t_time)`: Move backward
- `turnLeft(speed, t_time)`: Turn left
- `turnRight(speed, t_time)`: Turn right
- `t_stop(t_time)`: Stop all motors
- `set_servo_angle(channel, angle)`: Set servo angle

### ServoControl Integration

The ServoControl class is used for camera gimbal control with the following features:

- Initial pan angle: 90 degrees (center position)
- Initial tilt angle: -5 degrees (slightly up)
- Pan angle range: 0 to 180 degrees
- Tilt angle range: -5 to 30 degrees
- Object tracking functionality that adjusts servo angles based on object position

### libcamera Integration

The libcamera library is used for accessing the Raspberry Pi camera. It provides the following features:

- High-performance camera access
- Support for various camera modules
- Low-level control of camera parameters
- Image capture and streaming

## Object Tracking

The system includes object tracking functionality that allows the camera to follow objects:

1. The ServoControl class calculates appropriate servo angles based on the object's position in the frame
2. The pan and tilt servos are adjusted to keep the object centered
3. The tracking can be initiated via the `/api/camera/track` endpoint

The tracking algorithm:
- Calculates the error between the object's position and the center of the frame
- Adjusts the pan and tilt angles proportionally to the error
- Limits the angles to the specified ranges (pan: 0-180, tilt: -5 to 30)

## Troubleshooting

### Camera Issues

If you encounter issues with the camera:

1. Make sure the camera is properly connected to the Raspberry Pi
2. Verify that the camera is enabled in raspi-config
3. Check that the libcamera package is installed
4. Try running a simple test script to verify camera functionality

### Servo Control Issues

If you encounter issues with servo control:

1. Check the servo connections to the LOBOROBOT controller
2. Verify that the servo angles are within the specified ranges
3. Check if the servos are properly powered
4. Try the test_servo_control function in the test script

### Motor Control Issues

If you encounter issues with motor control:

1. Check the wiring between the Raspberry Pi and the motor controller
2. Verify that the LOBOROBOT.py library is properly installed
3. Check the power supply for the motors
4. Try running the test_loborobot.py script to verify motor functionality

## License

This project is licensed under the MIT License - see the LICENSE file for details. 