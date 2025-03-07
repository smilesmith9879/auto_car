// Sheikah AI Car Control - Map JavaScript

document.addEventListener('DOMContentLoaded', () => {
    // Initialize map functionality
    initMap();
});

// Initialize map controls and visualization
function initMap() {
    console.log('Initializing SLAM map...');
    
    // Get map control buttons
    const startMappingBtn = document.getElementById('start-mapping');
    const saveMapBtn = document.getElementById('save-map');
    const loadMapBtn = document.getElementById('load-map');
    const nameLocationBtn = document.getElementById('name-location');
    const navigateBtn = document.getElementById('navigate-btn');
    
    // Map state
    let isMapping = false;
    let currentMap = null;
    
    // Add event listeners for map controls
    startMappingBtn.addEventListener('click', toggleMapping);
    saveMapBtn.addEventListener('click', saveMap);
    loadMapBtn.addEventListener('click', loadMap);
    nameLocationBtn.addEventListener('click', nameLocation);
    navigateBtn.addEventListener('click', startNavigation);
    
    // Initialize map canvas
    initMapCanvas();
}

// Initialize the map canvas with Sheikah-style visualization
function initMapCanvas() {
    const mapContainer = document.getElementById('slam-map');
    const canvas = document.createElement('canvas');
    canvas.width = mapContainer.clientWidth;
    canvas.height = mapContainer.clientHeight;
    mapContainer.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    
    // Start the map visualization animation
    animateMap(ctx, canvas.width, canvas.height);
}

// Animate the map visualization
function animateMap(ctx, width, height) {
    // Clear canvas
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, width, height);
    
    // Draw grid
    ctx.strokeStyle = 'rgba(79, 195, 247, 0.2)';
    ctx.lineWidth = 1;
    
    const gridSize = 30;
    for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }
    
    for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }
    
    // Draw simulated walls and obstacles
    drawObstacles(ctx, width, height);
    
    // Draw named locations
    drawLocations(ctx);
    
    // Draw car position
    drawCarPosition(ctx, width, height);
    
    // Request next frame
    requestAnimationFrame(() => animateMap(ctx, width, height));
}

// Draw simulated obstacles on the map
function drawObstacles(ctx, width, height) {
    ctx.strokeStyle = 'rgba(79, 195, 247, 0.8)';
    ctx.lineWidth = 2;
    
    // Draw some random walls
    const walls = [
        { x1: 50, y1: 50, x2: width - 50, y2: 50 },
        { x1: 50, y1: 50, x2: 50, y2: height - 50 },
        { x1: width - 50, y1: 50, x2: width - 50, y2: height - 50 },
        { x1: 50, y1: height - 50, x2: width - 50, y2: height - 50 }
    ];
    
    walls.forEach(wall => {
        ctx.beginPath();
        ctx.moveTo(wall.x1, wall.y1);
        ctx.lineTo(wall.x2, wall.y2);
        ctx.stroke();
        
        // Add Sheikah runes along the walls
        const runeCount = 5;
        for (let i = 0; i < runeCount; i++) {
            const x = wall.x1 + (wall.x2 - wall.x1) * (i / (runeCount - 1));
            const y = wall.y1 + (wall.y2 - wall.y1) * (i / (runeCount - 1));
            drawSheikahRune(ctx, x, y);
        }
    });
}

// Draw named locations on the map
function drawLocations(ctx) {
    const locations = [
        { name: 'Living Room', x: 100, y: 100 },
        { name: 'Kitchen', x: 300, y: 100 },
        { name: 'Bedroom', x: 200, y: 300 }
    ];
    
    ctx.font = '12px Roboto';
    ctx.fillStyle = 'rgba(79, 195, 247, 0.8)';
    
    locations.forEach(location => {
        // Draw location marker
        ctx.beginPath();
        ctx.arc(location.x, location.y, 5, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw location name
        ctx.fillText(location.name, location.x + 10, location.y + 5);
        
        // Draw Sheikah circle around the marker
        ctx.strokeStyle = 'rgba(79, 195, 247, 0.5)';
        ctx.beginPath();
        ctx.arc(location.x, location.y, 15, 0, Math.PI * 2);
        ctx.stroke();
    });
}

// Draw car position on the map
function drawCarPosition(ctx, width, height) {
    // Simulate car movement
    const time = Date.now() / 1000;
    const x = width/2 + Math.cos(time) * 50;
    const y = height/2 + Math.sin(time) * 50;
    
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(time);
    
    // Draw car icon
    ctx.strokeStyle = 'rgba(255, 152, 0, 0.8)';
    ctx.lineWidth = 2;
    
    // Car body
    ctx.beginPath();
    ctx.moveTo(-10, -5);
    ctx.lineTo(10, -5);
    ctx.lineTo(10, 5);
    ctx.lineTo(-10, 5);
    ctx.closePath();
    ctx.stroke();
    
    // Direction indicator
    ctx.beginPath();
    ctx.moveTo(10, 0);
    ctx.lineTo(15, 0);
    ctx.stroke();
    
    ctx.restore();
}

// Draw a Sheikah rune symbol
function drawSheikahRune(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);
    
    ctx.strokeStyle = 'rgba(79, 195, 247, 0.5)';
    ctx.lineWidth = 1;
    
    // Draw rune circle
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.stroke();
    
    // Draw rune lines
    for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI) / 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(angle) * 8, Math.sin(angle) * 8);
        ctx.stroke();
    }
    
    ctx.restore();
}

// Toggle mapping state
function toggleMapping() {
    const startMappingBtn = document.getElementById('start-mapping');
    isMapping = !isMapping;
    
    if (isMapping) {
        startMappingBtn.textContent = 'Stop Mapping';
        startMapping();
    } else {
        startMappingBtn.textContent = 'Start Mapping';
        stopMapping();
    }
}

// Start SLAM mapping
async function startMapping() {
    console.log('Starting SLAM mapping...');
    
    try {
        const response = await callApi(API_CONFIG.endpoints.map, 'POST', {
            action: 'start'
        });
        
        if (response.success) {
            console.log('Mapping started successfully');
        } else {
            console.error('Failed to start mapping:', response.error);
        }
    } catch (error) {
        console.error('Error starting mapping:', error);
    }
}

// Stop SLAM mapping
async function stopMapping() {
    console.log('Stopping SLAM mapping...');
    
    try {
        const response = await callApi(API_CONFIG.endpoints.map, 'POST', {
            action: 'stop'
        });
        
        if (response.success) {
            console.log('Mapping stopped successfully');
        } else {
            console.error('Failed to stop mapping:', response.error);
        }
    } catch (error) {
        console.error('Error stopping mapping:', error);
    }
}

// Save current map
async function saveMap() {
    console.log('Saving map...');
    
    try {
        const response = await callApi(API_CONFIG.endpoints.map, 'POST', {
            action: 'save'
        });
        
        if (response.success) {
            console.log('Map saved successfully');
        } else {
            console.error('Failed to save map:', response.error);
        }
    } catch (error) {
        console.error('Error saving map:', error);
    }
}

// Load saved map
async function loadMap() {
    console.log('Loading map...');
    
    try {
        const response = await callApi(API_CONFIG.endpoints.map, 'GET');
        
        if (response.success) {
            currentMap = response.data;
            console.log('Map loaded successfully');
        } else {
            console.error('Failed to load map:', response.error);
        }
    } catch (error) {
        console.error('Error loading map:', error);
    }
}

// Name current location
async function nameLocation() {
    const locationName = document.getElementById('location-name').value.trim();
    
    if (!locationName) {
        console.error('Please enter a location name');
        return;
    }
    
    console.log(`Naming current location as: ${locationName}`);
    
    try {
        const response = await callApi(API_CONFIG.endpoints.map, 'POST', {
            action: 'name_location',
            name: locationName
        });
        
        if (response.success) {
            console.log('Location named successfully');
            document.getElementById('location-name').value = '';
            
            // Add location to destination select
            const select = document.getElementById('destination-select');
            const option = document.createElement('option');
            option.value = locationName.toLowerCase().replace(' ', '-');
            option.textContent = locationName;
            select.appendChild(option);
        } else {
            console.error('Failed to name location:', response.error);
        }
    } catch (error) {
        console.error('Error naming location:', error);
    }
}

// Start navigation to selected destination
async function startNavigation() {
    const destinationSelect = document.getElementById('destination-select');
    const destination = destinationSelect.value;
    
    if (!destination) {
        console.error('Please select a destination');
        return;
    }
    
    console.log(`Starting navigation to: ${destination}`);
    
    try {
        const response = await callApi(API_CONFIG.endpoints.map, 'POST', {
            action: 'navigate',
            destination: destination
        });
        
        if (response.success) {
            console.log('Navigation started successfully');
        } else {
            console.error('Failed to start navigation:', response.error);
        }
    } catch (error) {
        console.error('Error starting navigation:', error);
    }
}