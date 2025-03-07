#!/usr/bin/env python3
# Test script for LOBOROBOT with libcamera

import time
import logging
import sys
import signal
import threading
from PIL import Image

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("test_loborobot.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Try to import hardware libraries
try:
    from modules.LOBOROBOT import LOBOROBOT
    from picamera2 import Picamera2
    from libcamera import Transform
    from modules.camera import ServoControl, CameraController
    HARDWARE_AVAILABLE = True
    logger.info("Hardware libraries loaded successfully")
except ImportError as e:
    HARDWARE_AVAILABLE = False
    logger.warning(f"Hardware libraries not available, running in simulation mode: {e}")

# Global flag for graceful shutdown
running = True

def signal_handler(sig, frame):
    """Handle Ctrl+C to gracefully shutdown"""
    global running
    logger.info("Shutdown signal received")
    running = False
    sys.exit(0)

# Register signal handler
signal.signal(signal.SIGINT, signal_handler)

def test_movement():
    """Test basic movement functions of LOBOROBOT"""
    if not HARDWARE_AVAILABLE:
        logger.warning("Skipping movement test - hardware not available")
        return
    
    try:
        logger.info("Initializing LOBOROBOT for movement test")
        robot = LOBOROBOT()
        
        # Test forward movement
        logger.info("Testing forward movement")
        robot.t_up(50, 1)  # 50% speed for 1 second
        
        # Test backward movement
        logger.info("Testing backward movement")
        robot.t_down(50, 1)  # 50% speed for 1 second
        
        # Test left turn
        logger.info("Testing left turn")
        robot.turnLeft(50, 1)  # 50% speed for 1 second
        
        # Test right turn
        logger.info("Testing right turn")
        robot.turnRight(50, 1)  # 50% speed for 1 second
        
        # Stop all motors
        logger.info("Stopping all motors")
        robot.t_stop(0.1)
        
        logger.info("Movement test completed successfully")
    except Exception as e:
        logger.error(f"Movement test failed: {e}")

def test_camera():
    """Test camera functions with libcamera"""
    if not HARDWARE_AVAILABLE:
        logger.warning("Skipping camera test - hardware not available")
        return
    
    try:
        logger.info("Initializing libcamera for camera test")
        camera = Picamera2()
        config = camera.create_still_configuration(
            main={"size": (640, 480), "format": "RGB888"},
            transform=Transform(hflip=True, vflip=True)
        )
        camera.configure(config)
        camera.start()
        
        # Capture a test image
        logger.info("Capturing test image")
        frame = camera.capture_array()
        
        # Save the image
        logger.info("Saving test image")
        img = Image.fromarray(frame)
        img.save("test_camera.jpg")
        
        # Clean up
        camera.close()
        
        logger.info("Camera test completed successfully")
    except Exception as e:
        logger.error(f"Camera test failed: {e}")

def test_servo_control():
    """Test the ServoControl class with the new angle ranges"""
    logger.info("Testing ServoControl class")
    
    try:
        # Initialize ServoControl
        servo_control = ServoControl()
        
        # Check initial values
        logger.info(f"Initial pan angle: {servo_control.pan}")
        logger.info(f"Initial tilt angle: {servo_control.tilt}")
        
        # Test angle calculation with object at center
        pan, tilt = servo_control.calculate_servo_angles(320, 240, 640, 480)
        logger.info(f"Object at center - Pan: {pan}, Tilt: {tilt}")
        
        # Test angle calculation with object at top-left
        pan, tilt = servo_control.calculate_servo_angles(160, 120, 640, 480)
        logger.info(f"Object at top-left - Pan: {pan}, Tilt: {tilt}")
        
        # Test angle calculation with object at bottom-right
        pan, tilt = servo_control.calculate_servo_angles(480, 360, 640, 480)
        logger.info(f"Object at bottom-right - Pan: {pan}, Tilt: {tilt}")
        
        # Test angle limits
        # Set extreme values and check if they're properly limited
        servo_control.pan = 0
        servo_control.tilt = -5
        pan, tilt = servo_control.calculate_servo_angles(0, 0, 640, 480)
        logger.info(f"Testing lower limits - Pan: {pan}, Tilt: {tilt}")
        
        servo_control.pan = 180
        servo_control.tilt = 30
        pan, tilt = servo_control.calculate_servo_angles(640, 480, 640, 480)
        logger.info(f"Testing upper limits - Pan: {pan}, Tilt: {tilt}")
        
        logger.info("ServoControl test completed successfully")
    except Exception as e:
        logger.error(f"ServoControl test failed: {e}")

def test_camera_controller():
    """Test the CameraController with the new ServoControl integration"""
    if not HARDWARE_AVAILABLE:
        logger.warning("Skipping CameraController test - hardware not available")
        return
    
    try:
        logger.info("Initializing CameraController")
        camera_controller = CameraController()
        
        # Start streaming
        camera_controller.start_streaming()
        
        # Test initial servo positions
        logger.info(f"Initial pan angle: {camera_controller.pan_angle}")
        logger.info(f"Initial tilt angle: {camera_controller.tilt_angle}")
        
        # Test setting pan angle
        logger.info("Testing pan angle settings")
        positions = [0, 45, 90, 135, 180]
        for pos in positions:
            logger.info(f"Setting pan to {pos}")
            camera_controller.set_gimbal_angle('pan', pos)
            time.sleep(1)
        
        # Reset to center
        camera_controller.set_gimbal_angle('pan', 90)
        time.sleep(1)
        
        # Test setting tilt angle
        logger.info("Testing tilt angle settings")
        positions = [-5, 0, 10, 20, 30]
        for pos in positions:
            logger.info(f"Setting tilt to {pos}")
            camera_controller.set_gimbal_angle('tilt', pos)
            time.sleep(1)
        
        # Reset to initial position
        camera_controller.set_gimbal_angle('tilt', -5)
        time.sleep(1)
        
        # Test object tracking
        logger.info("Testing object tracking")
        test_positions = [
            (320, 240),  # Center
            (160, 120),  # Top-left
            (480, 360),  # Bottom-right
            (320, 120),  # Top-center
            (320, 360)   # Bottom-center
        ]
        
        for x, y in test_positions:
            logger.info(f"Tracking object at ({x}, {y})")
            camera_controller.track_object(x, y)
            time.sleep(1)
        
        # Stop streaming
        camera_controller.stop_streaming()
        
        # Clean up
        camera_controller.cleanup()
        
        logger.info("CameraController test completed successfully")
    except Exception as e:
        logger.error(f"CameraController test failed: {e}")

def test_combined():
    """Test combined movement and camera functions"""
    if not HARDWARE_AVAILABLE:
        logger.warning("Skipping combined test - hardware not available")
        return
    
    try:
        logger.info("Initializing LOBOROBOT and CameraController for combined test")
        robot = LOBOROBOT()
        camera_controller = CameraController()
        
        # Start camera streaming
        camera_controller.start_streaming()
        
        # Move forward while tracking an object
        logger.info("Moving forward and tracking object")
        robot.t_up(30, 0.1)  # Start moving forward at 30% speed
        
        # Simulate tracking an object that moves across the frame
        for i in range(5):
            if not running:
                break
            
            # Calculate object position (simulating movement)
            x = 320 + (i - 2) * 100
            y = 240 + (i - 2) * 50
            
            # Track the object
            logger.info(f"Tracking object at ({x}, {y})")
            camera_controller.track_object(x, y)
            
            # Capture frame
            frame = camera_controller.get_current_frame()
            if frame is not None:
                img = Image.fromarray(frame)
                img.save(f"combined_tracking_{i}.jpg")
            
            time.sleep(0.5)
        
        # Stop movement
        robot.t_stop(0.1)
        
        # Stop streaming
        camera_controller.stop_streaming()
        
        # Clean up
        camera_controller.cleanup()
        
        logger.info("Combined test completed successfully")
    except Exception as e:
        logger.error(f"Combined test failed: {e}")

def main():
    """Main test function"""
    logger.info("Starting LOBOROBOT and libcamera test with ServoControl")
    
    # Run tests
    test_movement()
    time.sleep(1)
    
    test_camera()
    time.sleep(1)
    
    test_servo_control()
    time.sleep(1)
    
    test_camera_controller()
    time.sleep(1)
    
    test_combined()
    
    logger.info("All tests completed")

if __name__ == "__main__":
    main() 