#!/usr/bin/env python3
# Sheikah AI Car Control - Backend Server
import eventlet
eventlet.monkey_patch()  # Use eventlet as async mode for SocketIO
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import json
import time
import threading
import logging
import os
from datetime import datetime
import eventlet

# Import car control modules
from modules.movement import MovementController
from modules.camera import CameraController
from modules.mapping import MappingController
from modules.voice import VoiceController
from modules.battery import BatteryMonitor

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("server.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__, static_folder='.')
CORS(app)  # Enable CORS for all routes

# Initialize SocketIO with async mode
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='eventlet')

# Initialize controllers
movement_controller = MovementController()
camera_controller = CameraController()
mapping_controller = MappingController()
voice_controller = VoiceController()
battery_monitor = BatteryMonitor()

# Global state
car_state = {
    "is_connected": True,
    "battery_level": 100,
    "is_mapping": False,
    "is_navigating": False,
    "current_position": {"x": 0, "y": 0, "orientation": 0},
    "last_update": time.time()
}

# Serve static files
@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def static_files(path):
    return send_from_directory('.', path)

# API endpoints
@app.route('/api/status', methods=['GET'])
def get_status():
    """Get the current status of the car"""
    # Update car state
    car_state["battery_level"] = battery_monitor.battery_level
    car_state["is_mapping"] = mapping_controller.is_mapping
    car_state["is_navigating"] = mapping_controller.is_navigating
    car_state["current_position"] = mapping_controller.get_car_position()
    car_state["last_update"] = time.time()
    
    return jsonify({
        "success": True,
        "data": car_state
    })

@app.route('/api/movement', methods=['POST'])
def control_movement():
    """Control the car's movement"""
    try:
        data = request.json
        direction = data.get('direction', 'stop')
        speed = data.get('speed', 0)
        
        # Validate inputs
        if direction not in ['forward', 'backward', 'left', 'right', 'stop']:
            return jsonify({"success": False, "error": "Invalid direction"}), 400
        
        if not 0 <= speed <= 100:
            return jsonify({"success": False, "error": "Invalid speed"}), 400
        
        # Execute movement command
        success = movement_controller.move(direction, speed)
        
        return jsonify({
            "success": success,
            "data": {
                "direction": direction,
                "speed": speed
            }
        })
    except Exception as e:
        logger.error(f"Error controlling movement: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/camera', methods=['POST'])
def control_camera():
    """Control the camera gimbal"""
    try:
        data = request.json
        control = data.get('control', '')
        angle = data.get('angle', 0)
        
        # Validate inputs
        if control not in ['pan', 'tilt']:
            return jsonify({"success": False, "error": "Invalid control"}), 400
        
        # Execute camera control command
        success = camera_controller.set_gimbal_angle(control, angle)
        
        return jsonify({
            "success": success,
            "data": {
                "control": control,
                "angle": angle
            }
        })
    except Exception as e:
        logger.error(f"Error controlling camera: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/camera/track', methods=['POST'])
def track_object():
    """Track an object with the camera gimbal"""
    try:
        data = request.json
        x = data.get('x', 0)
        y = data.get('y', 0)
        
        # Validate inputs
        if not isinstance(x, (int, float)) or not isinstance(y, (int, float)):
            return jsonify({"success": False, "error": "Invalid coordinates"}), 400
        
        # Execute object tracking
        success = camera_controller.track_object(x, y)
        
        # Return current pan and tilt angles
        return jsonify({
            "success": success,
            "data": {
                "pan_angle": camera_controller.pan_angle,
                "tilt_angle": camera_controller.tilt_angle
            }
        })
    except Exception as e:
        logger.error(f"Error tracking object: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/map', methods=['GET'])
def get_map():
    """Get the current map data"""
    try:
        map_data = mapping_controller.get_map_data()
        return jsonify({
            "success": True,
            "data": map_data
        })
    
    except Exception as e:
        logger.error(f"Map data error: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/map', methods=['POST'])
def control_map():
    """Control mapping operations"""
    try:
        data = request.json
        action = data.get('action', '')
        
        if action == 'start':
            success = mapping_controller.start_mapping()
            if success:
                return jsonify({"success": True})
            else:
                return jsonify({"success": False, "error": "Failed to start mapping"}), 500
        
        elif action == 'stop':
            success = mapping_controller.stop_mapping()
            if success:
                return jsonify({"success": True})
            else:
                return jsonify({"success": False, "error": "Failed to stop mapping"}), 500
        
        elif action == 'save':
            name = data.get('name', f"Map_{datetime.now().strftime('%Y%m%d_%H%M%S')}")
            success = mapping_controller.save_map(name)
            if success:
                return jsonify({"success": True})
            else:
                return jsonify({"success": False, "error": "Failed to save map"}), 500
        
        elif action == 'load':
            filename = data.get('filename', '')
            if not filename:
                return jsonify({"success": False, "error": "No filename provided"}), 400
            
            success = mapping_controller.load_map(filename)
            if success:
                return jsonify({"success": True})
            else:
                return jsonify({"success": False, "error": "Failed to load map"}), 500
        
        else:
            return jsonify({"success": False, "error": "Invalid action"}), 400
    
    except Exception as e:
        logger.error(f"Map control error: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/map/available', methods=['GET'])
def get_available_maps():
    """Get a list of available maps"""
    try:
        maps = mapping_controller.get_available_maps()
        return jsonify({
            "success": True,
            "data": maps
        })
    
    except Exception as e:
        logger.error(f"Available maps error: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/map/location', methods=['POST'])
def name_location():
    """Name a location on the map"""
    try:
        data = request.json
        name = data.get('name', '')
        position = data.get('position', None)
        
        if not name:
            return jsonify({"success": False, "error": "No name provided"}), 400
        
        success = mapping_controller.name_location(name, position)
        
        if success:
            return jsonify({"success": True})
        else:
            return jsonify({"success": False, "error": "Failed to name location"}), 500
    
    except Exception as e:
        logger.error(f"Name location error: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/navigation', methods=['POST'])
def control_navigation():
    """Control navigation operations"""
    try:
        data = request.json
        action = data.get('action', '')
        
        if action == 'start':
            destination = data.get('destination', '')
            if not destination:
                return jsonify({"success": False, "error": "No destination provided"}), 400
            
            success = mapping_controller.start_navigation(destination)
            if success:
                return jsonify({"success": True})
            else:
                return jsonify({"success": False, "error": "Failed to start navigation"}), 500
        
        elif action == 'stop':
            success = mapping_controller.stop_navigation()
            if success:
                return jsonify({"success": True})
            else:
                return jsonify({"success": False, "error": "Failed to stop navigation"}), 500
        
        else:
            return jsonify({"success": False, "error": "Invalid action"}), 400
    
    except Exception as e:
        logger.error(f"Navigation control error: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/voice', methods=['POST'])
def process_voice():
    """Process a voice command"""
    try:
        data = request.json
        command = data.get('command', '')
        
        if not command:
            return jsonify({"success": False, "error": "No command provided"}), 400
        
        # Process the voice command
        response = voice_controller.process_command(command)
        
        # Execute the command based on the response
        if response["action"] == "move":
            direction = response["parameters"].get("direction", "stop")
            speed = response["parameters"].get("speed", 0)
            movement_controller.move(direction, speed)
        
        elif response["action"] == "map":
            operation = response["parameters"].get("operation", "")
            if operation == "start":
                mapping_controller.start_mapping()
            elif operation == "stop":
                mapping_controller.stop_mapping()
            elif operation == "save":
                mapping_controller.save_map()
        
        elif response["action"] == "navigate":
            location = response["parameters"].get("location", "")
            if location:
                mapping_controller.start_navigation(location)
        
        return jsonify({
            "success": True,
            "data": {
                "response": response["message"],
                "action": response["action"],
                "command_type": response["command_type"]
            }
        })
    
    except Exception as e:
        logger.error(f"Voice processing error: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/battery', methods=['GET'])
def get_battery():
    """Get battery status"""
    try:
        battery_status = battery_monitor.get_battery_status()
        return jsonify({
            "success": True,
            "data": battery_status
        })
    
    except Exception as e:
        logger.error(f"Battery status error: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

# WebSocket events
@socketio.on('connect')
def handle_connect():
    """Handle client connection"""
    logger.info(f"Client connected: {request.sid}")
    emit('status', car_state)

@socketio.on('disconnect')
def handle_disconnect():
    """Handle client disconnection"""
    logger.info(f"Client disconnected: {request.sid}")

@socketio.on('request_video_stream')
def handle_video_request(data):
    """Handle video stream request"""
    logger.info(f"Video stream requested by {request.sid}")
    
    # Start camera streaming if not already streaming
    if not camera_controller.is_streaming:
        camera_controller.start_streaming()
    
    # Start a thread to send video frames
    threading.Thread(target=stream_video, args=(request.sid,), daemon=True).start()

def stream_video(client_id):
    """Stream video frames to a client"""
    logger.info(f"Starting video stream for {client_id}")
    
    try:
        while camera_controller.is_streaming:
            # Get the current frame
            frame_base64 = camera_controller.get_frame_base64()
            
            if frame_base64:
                # Send frame to the client
                socketio.emit('video_frame', {
                    'frame': frame_base64
                }, room=client_id)
            
            # Sleep to maintain framerate
            eventlet.sleep(0.033)  # ~30 FPS
    
    except Exception as e:
        logger.error(f"Video streaming error: {e}")
    
    logger.info(f"Video stream ended for {client_id}")

def update_car_position():
    """Update car position periodically"""
    while True:
        try:
            # Get current position from mapping controller
            car_state["current_position"] = mapping_controller.get_car_position()
            
            # Broadcast position update to all clients
            socketio.emit('position_update', {
                'position': car_state["current_position"]
            })
            
            # Sleep for a short time
            eventlet.sleep(0.1)
        
        except Exception as e:
            logger.error(f"Position update error: {e}")
            eventlet.sleep(1.0)

def update_battery_status():
    """Update battery status periodically"""
    while True:
        try:
            # Get current battery status
            battery_status = battery_monitor.get_battery_status()
            car_state["battery_level"] = battery_status["level"]
            
            # Broadcast battery update to all clients
            socketio.emit('battery_update', battery_status)
            
            # Sleep for a short time
            eventlet.sleep(5.0)
        
        except Exception as e:
            logger.error(f"Battery update error: {e}")
            eventlet.sleep(1.0)

def start_background_tasks():
    """Start background tasks"""
    # Start position update thread
    position_thread = threading.Thread(target=update_car_position, daemon=True)
    position_thread.start()
    
    # Start battery update thread
    battery_thread = threading.Thread(target=update_battery_status, daemon=True)
    battery_thread.start()

# Cleanup function to be called on shutdown
def cleanup():
    """Clean up resources on shutdown"""
    logger.info("Cleaning up resources...")
    movement_controller.cleanup()
    camera_controller.cleanup()
    mapping_controller.cleanup()
    voice_controller.cleanup()
    battery_monitor.cleanup()
    logger.info("Cleanup complete")

# Register cleanup function to be called on exit
import atexit
atexit.register(cleanup)

if __name__ == '__main__':
    try:
        # Start background tasks
        start_background_tasks()
        
        # Start the server
        logger.info("Starting Sheikah AI Car Control server...")
        socketio.run(app, host='0.0.0.0', port=5000, debug=False)
    
    except KeyboardInterrupt:
        logger.info("Server shutdown requested")
        cleanup()
    
    except Exception as e:
        logger.error(f"Server error: {e}")
        cleanup() 