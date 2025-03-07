#!/usr/bin/env python3
# Sheikah AI Car Control - Camera Controller Module

import logging
import time
import threading
import numpy as np
from datetime import datetime
import os
import base64
import json
import io
from PIL import Image, ImageDraw, ImageFont

try:
    # Import libcamera for Raspberry Pi camera
    from picamera2 import Picamera2
    from libcamera import Transform
    # Import LOBOROBOT for servo control
    from modules.LOBOROBOT import LOBOROBOT
    HARDWARE_AVAILABLE = True
except ImportError:
    HARDWARE_AVAILABLE = False
    logging.warning("libcamera or LOBOROBOT libraries not available, running in simulation mode")

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ServoControl:
    """
    Controls the servo angles for camera pan and tilt
    """
    def __init__(self):
        self.pan = 90  # Initial pan angle (center position)
        self.tilt = -5  # Initial tilt angle (slightly up)
        
    def calculate_servo_angles(self, object_center_x, object_center_y, frame_width, frame_height):
        """
        Calculate servo angles based on object position in frame
        
        Args:
            object_center_x (int): X coordinate of object center
            object_center_y (int): Y coordinate of object center
            frame_width (int): Width of the camera frame
            frame_height (int): Height of the camera frame
            
        Returns:
            tuple: (pan_angle, tilt_angle)
        """
        # Calculate object deviation
        error_pan = object_center_x - frame_width // 2
        error_tilt = object_center_y - frame_height // 2
        
        # Adjust servo angles based on deviation
        pan_adjustment = error_pan / 75
        tilt_adjustment = error_tilt / 75

        new_pan = self.pan - pan_adjustment
        new_tilt = self.tilt - tilt_adjustment

        # Limit servo angle range
        new_pan = max(0, min(new_pan, 180))
        new_tilt = max(-5, min(new_tilt, 30))
        
        # Update current angles
        self.pan = new_pan
        self.tilt = new_tilt
        
        return (new_pan, new_tilt)

class CameraController:
    """
    Controls the camera gimbal and video streaming using libcamera
    """
    
    def __init__(self):
        """Initialize the camera controller"""
        logger.info("Initializing Camera Controller with libcamera")
        global HARDWARE_AVAILABLE
        # Camera settings
        self.resolution = (640, 480)
        self.framerate = 30
        self.camera = None
        self.is_streaming = False
        self.stream_thread = None
        self.frame_buffer = None
        
        # Initialize servo control
        self.servo_control = ServoControl()
        
        # Gimbal settings - use the values from ServoControl
        self.pan_angle = self.servo_control.pan  # Initial pan angle from ServoControl
        self.tilt_angle = self.servo_control.tilt  # Initial tilt angle from ServoControl
        
        # Initialize hardware if available
        if HARDWARE_AVAILABLE:
            try:
                # Initialize LOBOROBOT for servo control
                self.robot = LOBOROBOT()
                
                # Initialize libcamera
                self.camera = Picamera2()
                config = self.camera.create_still_configuration(
                    main={"size": self.resolution, "format": "RGB888"},
                    transform=Transform(hflip=True, vflip=True)  # Flip if needed
                )
                self.camera.configure(config)
                self.camera.start()
                
                # Center the gimbal using initial values from ServoControl
                self.set_gimbal_angle('pan', self.pan_angle)
                self.set_gimbal_angle('tilt', self.tilt_angle)
                
                logger.info("Camera hardware initialized successfully")
            except Exception as e:
                logger.error(f"Failed to initialize camera hardware: {e}")
                HARDWARE_AVAILABLE = False
        
        # Initialize simulation camera if hardware not available
        if not HARDWARE_AVAILABLE:
            self._init_simulation_camera()
    
    def _init_simulation_camera(self):
        """Initialize a simulated camera for testing"""
        logger.info("Initializing simulation camera")
        
        # Create a blank frame for simulation
        self.frame_buffer = np.zeros((self.resolution[1], self.resolution[0], 3), dtype=np.uint8)
        
        # Start a thread to update the simulated camera frame
        self.sim_thread = threading.Thread(target=self._update_simulation, daemon=True)
        self.sim_thread.start()
    
    def _update_simulation(self):
        """Update the simulated camera frame"""
        while True:
            # Create a simulated frame with a grid pattern
            frame = np.zeros((self.resolution[1], self.resolution[0], 3), dtype=np.uint8)
            
            # Add grid lines
            grid_size = 20
            color = (0, 100, 200)  # Sheikah blue color
            
            # Horizontal grid lines
            for y in range(0, self.resolution[1], grid_size):
                for x in range(self.resolution[0]):
                    if x < self.resolution[0]:
                        frame[y, x] = color
            
            # Vertical grid lines
            for x in range(0, self.resolution[0], grid_size):
                for y in range(self.resolution[1]):
                    if y < self.resolution[1]:
                        frame[y, x] = color
            
            # Convert to PIL Image for text drawing
            pil_img = Image.fromarray(frame)
            draw = ImageDraw.Draw(pil_img)
            
            # Add timestamp
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            draw.text((10, 30), timestamp, fill=(255, 255, 255))
            
            # Add pan/tilt angles
            angle_text = f"Pan: {self.pan_angle}°, Tilt: {self.tilt_angle}°"
            draw.text((10, self.resolution[1] - 30), angle_text, fill=(255, 255, 255))
            
            # Add Sheikah eye in the center
            center_x, center_y = self.resolution[0] // 2, self.resolution[1] // 2
            radius = 40
            draw.ellipse((center_x - radius, center_y - radius, center_x + radius, center_y + radius), outline=color)
            draw.ellipse((center_x - radius//3, center_y - radius//3, center_x + radius//3, center_y + radius//3), outline=color)
            draw.line((center_x, center_y - radius//3, center_x, center_y - radius), fill=color)
            
            # Convert back to numpy array
            self.frame_buffer = np.array(pil_img)
            
            # Sleep to simulate framerate
            time.sleep(1 / self.framerate)
    
    def set_gimbal_angle(self, control, angle):
        """
        Set the gimbal angle for pan or tilt using LOBOROBOT servo control
        
        Args:
            control (str): 'pan' or 'tilt'
            angle (int): Angle in degrees
                - Pan: 0 to 180 degrees (from ServoControl)
                - Tilt: -5 to 30 degrees (from ServoControl)
        
        Returns:
            bool: Success status
        """
        logger.info(f"Setting {control} angle to {angle} degrees")
        
        # Validate control type
        if control not in ['pan', 'tilt']:
            logger.error(f"Invalid control: {control}")
            return False
        
        # Validate angle range based on ServoControl limits
        if control == 'pan' and not 0 <= angle <= 180:
            logger.error(f"Pan angle out of range: {angle}")
            return False
        elif control == 'tilt' and not -5 <= angle <= 30:
            logger.error(f"Tilt angle out of range: {angle}")
            return False
        
        # Update current angle
        if control == 'pan':
            self.pan_angle = angle
            self.servo_control.pan = angle
        else:
            self.tilt_angle = angle
            self.servo_control.tilt = angle
        
        # Set servo position if hardware is available
        if HARDWARE_AVAILABLE:
            try:
                # Map angle to servo channel and position
                # Assuming channel 0 for pan and channel 1 for tilt
                channel = 0 if control == 'pan' else 1
                
                # For pan, use the angle directly (0-180)
                # For tilt, map from -5 to 30 to appropriate servo values
                if control == 'pan':
                    servo_angle = angle  # Direct mapping for pan (0-180)
                else:
                    # Map tilt from -5 to 30 to appropriate servo values (e.g., 85 to 120)
                    # This mapping depends on your specific servo setup
                    servo_angle = ((angle - (-5)) / 35) * 35 + 85
                
                # Set servo angle using LOBOROBOT
                self.robot.set_servo_angle(channel, servo_angle)
                
                logger.debug(f"Set {control} servo to {servo_angle} degrees")
                return True
            except Exception as e:
                logger.error(f"Failed to set {control} angle: {e}")
                return False
        else:
            # In simulation mode, just update the angle
            logger.info(f"Simulation: Set {control} angle to {angle} degrees")
            return True
    
    def track_object(self, object_center_x, object_center_y):
        """
        Track an object by adjusting the camera gimbal
        
        Args:
            object_center_x (int): X coordinate of object center
            object_center_y (int): Y coordinate of object center
            
        Returns:
            bool: Success status
        """
        # Calculate new servo angles
        new_pan, new_tilt = self.servo_control.calculate_servo_angles(
            object_center_x, 
            object_center_y, 
            self.resolution[0], 
            self.resolution[1]
        )
        
        # Set new gimbal angles
        pan_success = self.set_gimbal_angle('pan', new_pan)
        tilt_success = self.set_gimbal_angle('tilt', new_tilt)
        
        return pan_success and tilt_success
    
    def start_streaming(self):
        """Start video streaming"""
        if self.is_streaming:
            logger.warning("Video streaming is already active")
            return False
        
        logger.info("Starting video streaming")
        self.is_streaming = True
        
        # Start streaming thread
        self.stream_thread = threading.Thread(target=self._stream_video, daemon=True)
        self.stream_thread.start()
        
        return True
    
    def stop_streaming(self):
        """Stop video streaming"""
        if not self.is_streaming:
            logger.warning("Video streaming is not active")
            return False
        
        logger.info("Stopping video streaming")
        self.is_streaming = False
        
        # Wait for streaming thread to end
        if self.stream_thread:
            self.stream_thread.join(timeout=1.0)
            self.stream_thread = None
        
        return True
    
    def _stream_video(self):
        """Video streaming thread function"""
        logger.info("Video streaming thread started")
        
        while self.is_streaming:
            try:
                if HARDWARE_AVAILABLE and self.camera:
                    # Capture frame from libcamera
                    frame = self.camera.capture_array()
                else:
                    # Use simulated frame
                    frame = self.frame_buffer.copy()
                
                # Process frame here if needed (e.g., add overlays, apply filters)
                
                # Update the frame buffer
                self.frame_buffer = frame
                
                # Sleep to maintain framerate
                time.sleep(1 / self.framerate)
            except Exception as e:
                logger.error(f"Error in video streaming: {e}")
    
    def get_current_frame(self):
        """Get the current frame as a numpy array"""
        return self.frame_buffer
    
    def get_frame_base64(self):
        """Get the current frame as a base64 encoded JPEG string"""
        if self.frame_buffer is None:
            return None
        
        try:
            # Convert numpy array to PIL Image
            img = Image.fromarray(self.frame_buffer)
            
            # Save image to in-memory file
            img_byte_arr = io.BytesIO()
            img.save(img_byte_arr, format='JPEG')
            img_byte_arr = img_byte_arr.getvalue()
            
            # Encode as base64
            return base64.b64encode(img_byte_arr).decode('utf-8')
        except Exception as e:
            logger.error(f"Error converting frame to base64: {e}")
            return None
    
    def cleanup(self):
        """Clean up resources"""
        logger.info("Cleaning up camera controller resources")
        
        # Stop streaming if active
        if self.is_streaming:
            self.stop_streaming()
        
        # Close camera if open
        if HARDWARE_AVAILABLE and self.camera:
            self.camera.close() 