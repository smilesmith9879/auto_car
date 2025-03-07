// Sheikah AI Car Control - WebRTC JavaScript

document.addEventListener('DOMContentLoaded', () => {
    // Initialize WebRTC connection
    initWebRTC();
    
    // Initialize camera gimbal controls
    initCameraControls();
});

// Initialize WebRTC connection for camera streaming
function initWebRTC() {
    console.log('Initializing WebRTC connection...');
    
    const videoElement = document.getElementById('camera-stream');
    const cameraPlaceholder = document.querySelector('.camera-placeholder');
    
    // In a real implementation, this would establish a WebRTC connection
    // For demonstration purposes, we'll simulate a connection after a delay
    setTimeout(() => {
        // Hide the placeholder when the stream is ready
        cameraPlaceholder.style.display = 'none';
        
        // For demo purposes, we'll show a static image instead of a real stream
        // In a real implementation, this would be replaced with actual WebRTC code
        simulateCameraFeed(videoElement);
        
        console.log('Camera stream connected');
    }, 2000);
}

// Simulate camera feed with canvas animation for demonstration
function simulateCameraFeed(videoElement) {
    // Create a canvas element to simulate video
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 360;
    const ctx = canvas.getContext('2d');
    
    // Create a stream from the canvas
    const stream = canvas.captureStream(30); // 30 FPS
    videoElement.srcObject = stream;
    
    // Draw simulated camera view
    function drawFrame() {
        // Clear canvas
        ctx.fillStyle = '#111';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw grid lines (simulating SLAM features)
        ctx.strokeStyle = 'rgba(79, 195, 247, 0.3)';
        ctx.lineWidth = 1;
        
        // Horizontal grid lines
        for (let y = 0; y < canvas.height; y += 20) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
        
        // Vertical grid lines
        for (let x = 0; x < canvas.width; x += 20) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        
        // Draw some random feature points
        ctx.fillStyle = 'rgba(79, 195, 247, 0.7)';
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const size = Math.random() * 3 + 1;
            
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Draw Sheikah eye in the center as a HUD element
        drawSheikahHUD(ctx, canvas.width / 2, canvas.height / 2);
        
        // Draw telemetry data
        drawTelemetry(ctx, canvas.width, canvas.height);
        
        // Request next frame
        requestAnimationFrame(drawFrame);
    }
    
    // Start animation
    drawFrame();
}

// Draw Sheikah-style HUD elements
function drawSheikahHUD(ctx, centerX, centerY) {
    // Draw Sheikah eye
    ctx.strokeStyle = 'rgba(79, 195, 247, 0.5)';
    ctx.lineWidth = 2;
    
    // Outer circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 40, 0, Math.PI * 2);
    ctx.stroke();
    
    // Inner eye
    ctx.beginPath();
    ctx.arc(centerX, centerY, 15, 0, Math.PI * 2);
    ctx.stroke();
    
    // Teardrop
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - 15);
    ctx.lineTo(centerX, centerY - 40);
    ctx.stroke();
    
    // Eyelashes
    for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 3) {
        const x1 = centerX + Math.cos(angle) * 40;
        const y1 = centerY + Math.sin(angle) * 40;
        const x2 = centerX + Math.cos(angle) * 55;
        const y2 = centerY + Math.sin(angle) * 55;
        
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }
    
    // Targeting reticle
    ctx.strokeStyle = 'rgba(255, 152, 0, 0.7)';
    ctx.lineWidth = 1;
    
    // Crosshair
    ctx.beginPath();
    ctx.moveTo(centerX - 60, centerY);
    ctx.lineTo(centerX - 45, centerY);
    ctx.moveTo(centerX + 45, centerY);
    ctx.lineTo(centerX + 60, centerY);
    ctx.moveTo(centerX, centerY - 60);
    ctx.lineTo(centerX, centerY - 45);
    ctx.moveTo(centerX, centerY + 45);
    ctx.lineTo(centerX, centerY + 60);
    ctx.stroke();
    
    // Corner brackets
    const bracketSize = 15;
    const bracketOffset = 80;
    
    // Top-left bracket
    ctx.beginPath();
    ctx.moveTo(centerX - bracketOffset, centerY - bracketOffset + bracketSize);
    ctx.lineTo(centerX - bracketOffset, centerY - bracketOffset);
    ctx.lineTo(centerX - bracketOffset + bracketSize, centerY - bracketOffset);
    ctx.stroke();
    
    // Top-right bracket
    ctx.beginPath();
    ctx.moveTo(centerX + bracketOffset - bracketSize, centerY - bracketOffset);
    ctx.lineTo(centerX + bracketOffset, centerY - bracketOffset);
    ctx.lineTo(centerX + bracketOffset, centerY - bracketOffset + bracketSize);
    ctx.stroke();
    
    // Bottom-left bracket
    ctx.beginPath();
    ctx.moveTo(centerX - bracketOffset, centerY + bracketOffset - bracketSize);
    ctx.lineTo(centerX - bracketOffset, centerY + bracketOffset);
    ctx.lineTo(centerX - bracketOffset + bracketSize, centerY + bracketOffset);
    ctx.stroke();
    
    // Bottom-right bracket
    ctx.beginPath();
    ctx.moveTo(centerX + bracketOffset - bracketSize, centerY + bracketOffset);
    ctx.lineTo(centerX + bracketOffset, centerY + bracketOffset);
    ctx.lineTo(centerX + bracketOffset, centerY + bracketOffset - bracketSize);
    ctx.stroke();
}

// Draw telemetry data on the HUD
function drawTelemetry(ctx, width, height) {
    ctx.font = '12px Roboto';
    ctx.fillStyle = 'rgba(79, 195, 247, 0.8)';
    
    // Current time
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    ctx.fillText(`TIME: ${timeString}`, 20, 30);
    
    // Simulated speed
    const speed = Math.floor(Math.random() * 10);
    ctx.fillText(`SPEED: ${speed} m/s`, 20, 50);
    
    // Simulated battery
    const battery = Math.floor(Math.random() * 30) + 70;
    ctx.fillText(`BATTERY: ${battery}%`, 20, 70);
    
    // Simulated coordinates
    const x = (Math.random() * 100).toFixed(2);
    const y = (Math.random() * 100).toFixed(2);
    ctx.fillText(`POSITION: X:${x} Y:${y}`, width - 150, 30);
    
    // Simulated orientation
    const heading = Math.floor(Math.random() * 360);
    ctx.fillText(`HEADING: ${heading}°`, width - 150, 50);
    
    // Simulated connection strength
    const signal = Math.floor(Math.random() * 5) + 1;
    ctx.fillText(`SIGNAL: ${signal}/5`, width - 150, 70);
}

// Initialize camera gimbal controls
function initCameraControls() {
    console.log('Initializing camera gimbal controls...');
    
    const panSlider = document.getElementById('pan-slider');
    const tiltSlider = document.getElementById('tilt-slider');
    
    // Send camera control commands when sliders change
    panSlider.addEventListener('input', () => {
        sendCameraCommand('pan', parseInt(panSlider.value));
    });
    
    tiltSlider.addEventListener('input', () => {
        sendCameraCommand('tilt', parseInt(tiltSlider.value));
    });
}

// Send camera control command to the API
async function sendCameraCommand(control, value) {
    console.log(`Sending camera ${control} command: ${value}°`);
    
    try {
        const response = await callApi(API_CONFIG.endpoints.camera, 'POST', {
            control: control,
            value: value
        });
        
        if (response.success) {
            console.log('Camera command sent successfully');
        } else {
            console.error('Failed to send camera command:', response.error);
        }
    } catch (error) {
        console.error('Error sending camera command:', error);
    }
}