// Sheikah AI Car Control - Mobile JavaScript

document.addEventListener('DOMContentLoaded', () => {
    // Initialize mobile-specific functionality
    initMobileInterface();
});

// Initialize mobile interface elements and interactions
function initMobileInterface() {
    console.log('Initializing mobile interface...');
    
    // Set up map toggle functionality for mobile
    setupMapToggle();
    
    // Add touch-specific optimizations
    addTouchOptimizations();
    
    // Handle orientation changes
    handleOrientationChanges();
    
    // Add iOS-specific optimizations
    addIOSOptimizations();
}

// Set up map toggle button functionality
function setupMapToggle() {
    const mapToggleBtn = document.getElementById('map-toggle');
    const mapPanel = document.getElementById('map-panel');
    
    if (!mapToggleBtn || !mapPanel) return;
    
    // Only show the toggle button on mobile devices
    if (window.innerWidth <= 768) {
        mapToggleBtn.style.display = 'flex';
    } else {
        mapToggleBtn.style.display = 'none';
    }
    
    // Toggle map panel visibility when button is clicked
    mapToggleBtn.addEventListener('click', () => {
        if (mapPanel.style.display === 'none' || getComputedStyle(mapPanel).display === 'none') {
            mapPanel.style.display = 'block';
            mapToggleBtn.classList.add('active');
            
            // Scroll to map panel
            mapPanel.scrollIntoView({ behavior: 'smooth' });
        } else {
            mapPanel.style.display = 'none';
            mapToggleBtn.classList.remove('active');
        }
    });
    
    // Update toggle button visibility on resize
    window.addEventListener('resize', () => {
        if (window.innerWidth <= 768) {
            mapToggleBtn.style.display = 'flex';
        } else {
            mapToggleBtn.style.display = 'none';
            mapPanel.style.display = 'block'; // Always show map on desktop
        }
    });
}

// Add touch-specific optimizations
function addTouchOptimizations() {
    // Prevent double-tap zoom on controls
    const touchElements = document.querySelectorAll('.control-btn, .voice-btn, .map-btn, #name-location, #navigate-btn');
    
    touchElements.forEach(element => {
        element.addEventListener('touchend', (e) => {
            e.preventDefault();
        });
    });
    
    // Make buttons larger on touch devices
    if ('ontouchstart' in window) {
        document.documentElement.classList.add('touch-device');
    }
}

// Handle orientation changes
function handleOrientationChanges() {
    window.addEventListener('orientationchange', () => {
        // Adjust layout based on orientation
        setTimeout(() => {
            // Resize map canvas if visible
            const mapContainer = document.getElementById('slam-map');
            if (mapContainer && mapContainer.firstChild) {
                const canvas = mapContainer.firstChild;
                canvas.width = mapContainer.clientWidth;
                canvas.height = mapContainer.clientHeight;
            }
            
            // Adjust camera feed aspect ratio
            const cameraFeed = document.querySelector('.camera-feed');
            if (cameraFeed) {
                if (window.orientation === 90 || window.orientation === -90) {
                    // Landscape
                    cameraFeed.style.height = '30vh';
                } else {
                    // Portrait
                    cameraFeed.style.height = '40vh';
                }
            }
        }, 300); // Small delay to allow for DOM updates
    });
}

// Add iOS-specific optimizations
function addIOSOptimizations() {
    // Check if device is iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    
    if (isIOS) {
        // Add iOS-specific class
        document.documentElement.classList.add('ios-device');
        
        // Fix for iOS vh units issue
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
        
        window.addEventListener('resize', () => {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
        });
        
        // Ensure video playback works on iOS
        const videoElement = document.getElementById('camera-stream');
        if (videoElement) {
            videoElement.setAttribute('playsinline', '');
            videoElement.setAttribute('webkit-playsinline', '');
        }
    }
}