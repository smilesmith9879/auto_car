// Sheikah AI Car Control - Voice JavaScript

document.addEventListener('DOMContentLoaded', () => {
    // Initialize voice interaction
    initVoiceInterface();
});

// Initialize voice interaction interface
function initVoiceInterface() {
    console.log('Initializing voice interaction...');
    
    // Get voice button and output element
    const voiceBtn = document.getElementById('voice-btn');
    const voiceOutput = document.getElementById('voice-output');
    const voiceWave = document.querySelector('.voice-wave');
    
    // Voice recognition state
    let isListening = false;
    let recognitionTimeout;
    
    // Add event listener for voice button
    voiceBtn.addEventListener('click', toggleVoiceRecognition);
    
    // Toggle voice recognition
    function toggleVoiceRecognition() {
        if (isListening) {
            stopVoiceRecognition();
        } else {
            startVoiceRecognition();
        }
    }
    
    // Start voice recognition
    function startVoiceRecognition() {
        console.log('Starting voice recognition...');
        isListening = true;
        
        // Update UI to show listening state
        voiceBtn.style.backgroundColor = 'rgba(79, 195, 247, 0.5)';
        voiceBtn.style.boxShadow = '0 0 15px var(--sheikah-blue-glow)';
        voiceOutput.textContent = 'Listening...';
        
        // Animate voice wave
        animateVoiceWave(voiceWave);
        
        // In a real implementation, this would start the WebSpeech API
        // For demonstration, we'll simulate voice recognition after a delay
        recognitionTimeout = setTimeout(() => {
            // Simulate receiving a voice command
            const commands = [
                'go forward',
                'turn left',
                'turn right',
                'stop',
                'go to the living room',
                'go to the kitchen',
                'go to the bedroom',
                'start mapping',
                'save the map',
                'what is your battery level'
            ];
            
            // Pick a random command for demonstration
            const randomCommand = commands[Math.floor(Math.random() * commands.length)];
            processVoiceCommand(randomCommand);
            
            // Stop listening after processing the command
            stopVoiceRecognition();
        }, 3000);
    }
    
    // Stop voice recognition
    function stopVoiceRecognition() {
        console.log('Stopping voice recognition...');
        isListening = false;
        
        // Update UI to show idle state
        voiceBtn.style.backgroundColor = '';
        voiceBtn.style.boxShadow = '';
        
        // Stop voice wave animation
        stopVoiceWaveAnimation(voiceWave);
        
        // Clear any pending recognition timeout
        clearTimeout(recognitionTimeout);
    }
    
    // Process voice command
    async function processVoiceCommand(command) {
        console.log(`Processing voice command: ${command}`);
        voiceOutput.textContent = `"${command}"`;
        
        // Send command to the API for processing
        try {
            const response = await callApi(API_CONFIG.endpoints.voice, 'POST', {
                command: command
            });
            
            if (response.success) {
                // Display the response from the AI
                setTimeout(() => {
                    displayAIResponse(response.data.response);
                }, 1000);
                
                // Execute the command if applicable
                executeVoiceCommand(command);
            } else {
                console.error('Failed to process voice command:', response.error);
                displayAIResponse('Sorry, I could not process that command.');
            }
        } catch (error) {
            console.error('Error processing voice command:', error);
            displayAIResponse('Sorry, there was an error processing your command.');
        }
    }
    
    // Display AI response
    function displayAIResponse(response) {
        console.log(`AI response: ${response}`);
        
        // Create a new paragraph for the AI response
        const aiResponse = document.createElement('p');
        aiResponse.textContent = response;
        aiResponse.classList.add('ai-response');
        
        // Add the AI response to the voice output
        voiceOutput.innerHTML = '';
        voiceOutput.appendChild(aiResponse);
        
        // Speak the response (in a real implementation)
        // For now, we'll just log it
        console.log('Speaking response:', response);
    }
    
    // Execute voice command by triggering the appropriate UI action
    function executeVoiceCommand(command) {
        // Convert command to lowercase for easier matching
        const cmd = command.toLowerCase();
        
        // Movement commands
        if (cmd.includes('forward') || cmd.includes('ahead')) {
            document.getElementById('forward-btn').click();
            setTimeout(() => document.getElementById('stop-btn').click(), 2000);
        } else if (cmd.includes('left')) {
            document.getElementById('left-btn').click();
            setTimeout(() => document.getElementById('stop-btn').click(), 2000);
        } else if (cmd.includes('right')) {
            document.getElementById('right-btn').click();
            setTimeout(() => document.getElementById('stop-btn').click(), 2000);
        } else if (cmd.includes('back')) {
            document.getElementById('backward-btn').click();
            setTimeout(() => document.getElementById('stop-btn').click(), 2000);
        } else if (cmd.includes('stop')) {
            document.getElementById('stop-btn').click();
        }
        
        // Navigation commands
        else if (cmd.includes('go to')) {
            const destinationSelect = document.getElementById('destination-select');
            
            // Try to find the mentioned location
            if (cmd.includes('living room')) {
                destinationSelect.value = 'living-room';
            } else if (cmd.includes('kitchen')) {
                destinationSelect.value = 'kitchen';
            } else if (cmd.includes('bedroom')) {
                destinationSelect.value = 'bedroom';
            }
            
            // Start navigation if a destination was selected
            if (destinationSelect.value) {
                document.getElementById('navigate-btn').click();
            }
        }
        
        // Mapping commands
        else if (cmd.includes('start mapping')) {
            document.getElementById('start-mapping').click();
        } else if (cmd.includes('save map') || cmd.includes('save the map')) {
            document.getElementById('save-map').click();
        } else if (cmd.includes('load map') || cmd.includes('load the map')) {
            document.getElementById('load-map').click();
        }
    }
}

// Animate voice wave visualization
function animateVoiceWave(waveElement) {
    // Clear any existing wave bars
    waveElement.innerHTML = '';
    
    // Create wave bars
    const barCount = 20;
    for (let i = 0; i < barCount; i++) {
        const bar = document.createElement('div');
        bar.classList.add('wave-bar');
        bar.style.width = '3px';
        bar.style.backgroundColor = 'var(--sheikah-blue)';
        bar.style.marginRight = '3px';
        bar.style.boxShadow = '0 0 5px var(--sheikah-blue-glow)';
        waveElement.appendChild(bar);
    }
    
    // Animate the bars
    const bars = waveElement.querySelectorAll('.wave-bar');
    animateBars(bars);
    
    function animateBars(bars) {
        bars.forEach(bar => {
            // Random height between 5px and 50px
            const height = Math.floor(Math.random() * 45) + 5;
            bar.style.height = `${height}px`;
            
            // Random transition duration between 100ms and 300ms
            const duration = Math.floor(Math.random() * 200) + 100;
            bar.style.transition = `height ${duration}ms ease`;
        });
        
        // Continue animation if still listening
        waveElement.animationId = setTimeout(() => animateBars(bars), 150);
    }
}

// Stop voice wave animation
function stopVoiceWaveAnimation(waveElement) {
    // Clear the animation timeout
    clearTimeout(waveElement.animationId);
    
    // Reset all bars to minimal height
    const bars = waveElement.querySelectorAll('.wave-bar');
    bars.forEach(bar => {
        bar.style.height = '2px';
    });
}