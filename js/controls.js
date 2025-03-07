// Sheikah AI Car Control - Controls JavaScript

document.addEventListener('DOMContentLoaded', () => {
    // Initialize movement controls
    initMovementControls();
});

// Initialize virtual joystick and speed slider
function initMovementControls() {
    console.log('Initializing movement controls...');
    
    const joystickContainer = document.getElementById('joystick-container');
    const speedSlider = document.getElementById('speed-slider');
    
    // Current movement state
    let currentMovement = {
        angle: 0,
        distance: 0,
        speed: 50
    };
    
    // Joystick state
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let currentX = 0;
    let currentY = 0;
    const maxDistance = 50; // Maximum joystick movement radius
    
    // Create joystick elements
    const joystickBase = document.createElement('div');
    joystickBase.className = 'joystick-base';
    const joystickHandle = document.createElement('div');
    joystickHandle.className = 'joystick-handle';
    joystickContainer.appendChild(joystickBase);
    joystickBase.appendChild(joystickHandle);
    
    // Handle mouse/touch events
    function handleStart(e) {
        isDragging = true;
        const rect = joystickBase.getBoundingClientRect();
        startX = rect.left + rect.width / 2;
        startY = rect.top + rect.height / 2;
        handleMove(e);
    }
    
    function handleMove(e) {
        if (!isDragging) return;
        
        e.preventDefault();
        joystickHandle.style.transition = '';  // 立即清除过渡

        const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
        
        // Calculate joystick position
        let deltaX = clientX - startX;
        let deltaY = clientY - startY;
        const distance = Math.min(Math.sqrt(deltaX * deltaX + deltaY * deltaY), maxDistance);
        const angle = Math.atan2(deltaY, deltaX);
        
        // Normalize to maxDistance
        currentX = Math.cos(angle) * distance;
        currentY = Math.sin(angle) * distance;
        
        // Update joystick visual position
        joystickHandle.style.transform = `translate(${currentX}px, ${currentY}px)`;
        
        // Calculate movement parameters
        currentMovement.angle = angle;
        currentMovement.distance = distance / maxDistance; // Normalize to 0-1
        
        // Convert angle and distance to movement command
        updateMovement();
    }
    
    function handleEnd() {
        if (!isDragging) return;
        isDragging = false;
        
        // Reset joystick position with smooth animation
        joystickHandle.style.transition = 'transform 0.2s ease-out';
        joystickHandle.style.transform = 'translate(0px, 0px)';
        currentX = 0;
        currentY = 0;
        
        // Reset movement parameters and ensure they're properly cleared
        currentMovement = {
            angle: 0,
            distance: 0,
            speed: currentMovement.speed // Maintain current speed setting
        };
        
        // Stop movement
        sendMovementCommand('stop', 0);
        updateButtonState('stop');
        
        // Reset transition after animation completes
        setTimeout(() => {
            joystickHandle.style.transition = '';
        }, 200);
    }
    
    // Add event listeners
    joystickBase.addEventListener('mousedown', handleStart);
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleEnd);
    
    joystickBase.addEventListener('touchstart', handleStart);
    document.addEventListener('touchmove', handleMove, { passive: false });
    document.addEventListener('touchend', handleEnd);
    
    // Update speed when slider changes
    speedSlider.addEventListener('input', () => {
        currentMovement.speed = parseInt(speedSlider.value);
        if (currentMovement.distance > 0) {
            updateMovement();
        }
    });
    
    // Add keyboard controls
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    
    function updateMovement() {
        const angle = currentMovement.angle;
        const distance = currentMovement.distance;
        
        // Convert angle to cardinal direction
        // Forward: -45° to 45° (π/4)
        // Right: 45° to 135°
        // Backward: 135° to -135°
        // Left: -135° to -45°
        
        let direction;
        const angleDeg = angle * (180 / Math.PI);
        
        if (angleDeg > -45 && angleDeg <= 45) direction = 'right';
        else if (angleDeg > 45 && angleDeg <= 135) direction = 'backward';
        else if (angleDeg > 135 || angleDeg <= -135) direction = 'left';
        else direction = 'forward';
        
        // Scale speed by distance from center
        const scaledSpeed = Math.round(currentMovement.speed * distance);
        
        sendMovementCommand(direction, scaledSpeed);
    }
}

// Set movement direction and send command
function setMovement(direction) {
    const speedSlider = document.getElementById('speed-slider');
    const speed = parseInt(speedSlider.value);
    
    // Update current movement state
    if (direction === 'stop') {
        // When stopping, ensure we reset all movement parameters
        currentMovement = {
            angle: 0,
            distance: 0,
            direction: direction,
            speed: speed
        };
    } else {
        currentMovement = {
            direction: direction,
            speed: speed
        };
    }
    
    // Send movement command to the car
    sendMovementCommand(direction, speed);
    
    // Update button visual state
    updateButtonState(direction);
}

// Send movement command to the API
async function sendMovementCommand(direction, speed) {
    console.log(`Sending movement command: ${direction} at speed ${speed}%`);
    
    try {
        const response = await callApi(API_CONFIG.endpoints.movement, 'POST', {
            direction: direction,
            speed: speed
        });
        
        if (response.success) {
            console.log('Movement command sent successfully');
        } else {
            console.error('Failed to send movement command:', response.error);
        }
    } catch (error) {
        console.error('Error sending movement command:', error);
    }
}

// Handle keyboard controls
function handleKeyDown(event) {
    // Prevent default behavior for arrow keys to avoid page scrolling
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(event.key)) {
        event.preventDefault();
    }
    
    // Only process if not in an input field
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA' || event.target.tagName === 'SELECT') {
        return;
    }
    
    switch (event.key) {
        case 'ArrowUp':
            setMovement('forward');
            break;
        case 'ArrowDown':
            setMovement('backward');
            break;
        case 'ArrowLeft':
            setMovement('left');
            break;
        case 'ArrowRight':
            setMovement('right');
            break;
        case ' ':
            setMovement('stop');
            break;
    }
}

function handleKeyUp(event) {
    // Only process if not in an input field
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA' || event.target.tagName === 'SELECT') {
        return;
    }
    
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
        setMovement('stop');
    }
}

// Update button visual state
function updateButtonState(activeDirection) {
    const buttons = {
        forward: document.getElementById('forward-btn'),
        left: document.getElementById('left-btn'),
        right: document.getElementById('right-btn'),
        backward: document.getElementById('backward-btn'),
        stop: document.getElementById('stop-btn')
    };
    
    // Reset all buttons
    Object.values(buttons).forEach(btn => {
        btn.style.backgroundColor = '';
        btn.style.boxShadow = '';
    });
    
    // Highlight active button
    if (activeDirection !== 'stop') {
        buttons[activeDirection].style.backgroundColor = 'rgba(79, 195, 247, 0.5)';
        buttons[activeDirection].style.boxShadow = '0 0 15px var(--sheikah-blue-glow)';
    } else {
        buttons.stop.style.backgroundColor = 'rgba(244, 67, 54, 0.5)';
        buttons.stop.style.boxShadow = '0 0 15px rgba(244, 67, 54, 0.5)';
    }
}

// Add visual feedback for button press
function addButtonFeedback() {
    const buttons = document.querySelectorAll('.control-btn');
    
    buttons.forEach(btn => {
        btn.addEventListener('mousedown', () => {
            btn.classList.add('active');
        });
        
        btn.addEventListener('mouseup', () => {
            btn.classList.remove('active');
        });
        
        btn.addEventListener('mouseleave', () => {
            btn.classList.remove('active');
        });
        
        btn.addEventListener('touchstart', () => {
            btn.classList.add('active');
        });
        
        btn.addEventListener('touchend', () => {
            btn.classList.remove('active');
        });
    });
}