#!/usr/bin/env python3
# Sheikah AI Car Control - Movement Controller Module

import logging
import time
import threading
import math
try:
    from modules.LOBOROBOT import LOBOROBOT
    HARDWARE_AVAILABLE = True
except ImportError:
    HARDWARE_AVAILABLE = False
    logging.warning("LOBOROBOT library not available, running in simulation mode")

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MovementController:
    """
    Controls the movement of the four-wheel drive car using LOBOROBOT library
    """
    
    def __init__(self):
        """Initialize the movement controller"""
        logger.info("Initializing Movement Controller with LOBOROBOT")
        global HARDWARE_AVAILABLE
        
        # Movement state
        self.current_direction = 'stop'
        self.current_speed = 0
        
        # Initialize LOBOROBOT if available
        if HARDWARE_AVAILABLE:
            try:
                self.robot = LOBOROBOT()
                logger.info("LOBOROBOT hardware initialized successfully")
            except Exception as e:
                logger.error(f"Failed to initialize LOBOROBOT hardware: {e}")
                HARDWARE_AVAILABLE = False
        
        # Start watchdog timer to automatically stop motors if no commands received
        self.last_command_time = time.time()
        self.watchdog_thread = threading.Thread(target=self._watchdog, daemon=True)
        self.watchdog_thread.start()
    
    def move(self, direction, speed_percent):
        """
        Move the car in the specified direction at the specified speed
        
        Args:
            direction (str): 'forward', 'backward', 'left', 'right', or 'stop'
            speed_percent (int): Speed percentage (0-100)
        
        Returns:
            bool: Success status
        """
        logger.info(f"Moving {direction} at {speed_percent}% speed")
        
        # Update last command time for watchdog
        self.last_command_time = time.time()
        
        # Update current state
        self.current_direction = direction
        self.current_speed = speed_percent
        
        # Set motor directions and speeds based on movement direction
        if direction == 'forward':
            self._set_motors_forward(speed_percent)
        elif direction == 'backward':
            self._set_motors_backward(speed_percent)
        elif direction == 'left':
            self._set_motors_left(speed_percent)
        elif direction == 'right':
            self._set_motors_right(speed_percent)
        elif direction == 'stop':
            self._set_motors_stop()
        else:
            logger.error(f"Invalid direction: {direction}")
            return False
        
        return True
    
    def _set_motors_forward(self, speed_percent):
        """Set all motors to move forward"""
        if HARDWARE_AVAILABLE:
            # Using LOBOROBOT t_up method for forward movement
            # The t_time parameter is set to 0.1 to allow continuous movement
            # The watchdog will stop the motors if no new commands are received
            self.robot.t_up(speed_percent, 0.1)
        else:
            logger.info("Simulation: All motors moving forward")
    
    def _set_motors_backward(self, speed_percent):
        """Set all motors to move backward"""
        if HARDWARE_AVAILABLE:
            # Using LOBOROBOT t_down method for backward movement
            self.robot.t_down(speed_percent, 0.1)
        else:
            logger.info("Simulation: All motors moving backward")
    
    def _set_motors_left(self, speed_percent):
        """Set motors to turn left"""
        if HARDWARE_AVAILABLE:
            # Using LOBOROBOT turnLeft method for left turn
            self.robot.turnLeft(speed_percent, 0.1)
        else:
            logger.info("Simulation: Motors turning left")
    
    def _set_motors_right(self, speed_percent):
        """Set motors to turn right"""
        if HARDWARE_AVAILABLE:
            # Using LOBOROBOT turnRight method for right turn
            self.robot.turnRight(speed_percent, 0.1)
        else:
            logger.info("Simulation: Motors turning right")
    
    def _set_motors_stop(self):
        """Stop all motors"""
        if HARDWARE_AVAILABLE:
            # Using LOBOROBOT t_stop method to stop all motors
            self.robot.t_stop(0.1)
        else:
            logger.info("Simulation: All motors stopped")
    
    def _watchdog(self):
        """Watchdog timer to stop motors if no commands received for 5 seconds"""
        while True:
            if time.time() - self.last_command_time > 5:
                logger.warning("Watchdog triggered: No movement commands for 5 seconds")
                self._set_motors_stop()
            time.sleep(1)
    
    def cleanup(self):
        """Clean up resources"""
        logger.info("Cleaning up movement controller resources")
        self._set_motors_stop() 