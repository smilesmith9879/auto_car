// Sheikah AI Car Control - Main JavaScript

document.addEventListener('DOMContentLoaded', () => {
    // Initialize the interface
    initInterface();
    
    // Update battery level every 30 seconds
    setInterval(updateBatteryStatus, 30000);
    
    // Update connection status every 5 seconds
    setInterval(checkConnection, 5000);
});

// Initialize the interface elements
function initInterface() {
    console.log('Initializing Sheikah AI Car Control Interface...');
    
    // Initialize speed slider value display
    const speedSlider = document.getElementById('speed-slider');
    const speedValue = document.getElementById('speed-value');
    
    speedSlider.addEventListener('input', () => {
        speedValue.textContent = `${speedSlider.value}%`;
    });
    
    // Initialize pan/tilt sliders value display
    const panSlider = document.getElementById('pan-slider');
    const panValue = document.getElementById('pan-value');
    
    panSlider.addEventListener('input', () => {
        panValue.textContent = `${panSlider.value}°`;
    });
    
    const tiltSlider = document.getElementById('tilt-slider');
    const tiltValue = document.getElementById('tilt-value');
    
    tiltSlider.addEventListener('input', () => {
        tiltValue.textContent = `${tiltSlider.value}°`;
    });
    
    // Add Sheikah rune animations
    addRuneAnimations();
}

// Update battery status
function updateBatteryStatus() {
    // In a real implementation, this would fetch the battery level from the car
    // For now, we'll simulate a random battery level between 20% and 100%
    const batteryLevel = Math.floor(Math.random() * 80) + 20;
    const batteryIndicator = document.querySelector('.battery-level');
    const batteryText = document.querySelector('.status-value span');
    
    batteryIndicator.style.width = `${batteryLevel}%`;
    batteryText.textContent = `${batteryLevel}%`;
    
    // Change color based on battery level
    if (batteryLevel < 30) {
        batteryIndicator.style.backgroundColor = '#f44336';
    } else {
        batteryIndicator.style.backgroundColor = 'var(--sheikah-blue)';
    }
}

// Check connection status
function checkConnection() {
    // In a real implementation, this would check the connection to the car
    // For now, we'll simulate a connection with 90% reliability
    const isConnected = Math.random() > 0.1;
    const connectionIndicator = document.querySelector('.connection-indicator');
    const connectionText = document.querySelector('.status-item:nth-child(2) .status-value span');
    
    if (isConnected) {
        connectionIndicator.classList.add('connected');
        connectionText.textContent = 'Connected';
    } else {
        connectionIndicator.classList.remove('connected');
        connectionText.textContent = 'Disconnected';
    }
}

// Add Sheikah rune animations
function addRuneAnimations() {
    const panels = document.querySelectorAll('.panel');
    
    panels.forEach(panel => {
        const rune = document.createElement('div');
        rune.classList.add('sheikah-rune');
        panel.appendChild(rune);
        
        // Add random animation delay
        const delay = Math.random() * 2;
        rune.style.animationDelay = `${delay}s`;
    });
}

// API endpoint configuration
const API_CONFIG = {
    baseUrl: 'http://localhost:5000/api',
    endpoints: {
        movement: '/movement',
        camera: '/camera',
        map: '/map',
        voice: '/voice'
    }
};

// Generic API call function
async function callApi(endpoint, method = 'GET', data = null) {
    try {
        const url = `${API_CONFIG.baseUrl}${endpoint}`;
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json'
            }
        };
        
        if (data) {
            options.body = JSON.stringify(data);
        }
        
        const response = await fetch(url, options);
        
        if (!response.ok) {
            throw new Error(`API call failed: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API call error:', error);
        return { success: false, error: error.message };
    }
}