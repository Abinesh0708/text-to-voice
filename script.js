document.addEventListener('DOMContentLoaded', function () {
    const textInput = document.getElementById('text-input');
    const speakBtn = document.getElementById('speak-btn');
    const stopBtn = document.getElementById('stop-btn');
    const chatContainer = document.getElementById('chat-container');

    let currentUtterance = null;

    // Add message to chat
    function addMessage(text, isUser = false, isSpoken = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = isUser ? 'message user-message' : 'message ai-message';

        const messageHeader = document.createElement('div');
        messageHeader.className = 'message-header';

        const avatar = document.createElement('div');
        avatar.className = `avatar ${isUser ? 'user-avatar' : 'ai-avatar'}`;
        avatar.innerHTML = isUser ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';

        const name = document.createElement('span');
        name.textContent = isUser ? 'You' : 'Podcast Assistant';

        messageHeader.appendChild(avatar);
        messageHeader.appendChild(name);

        const textElement = document.createElement('p');
        textElement.innerHTML = text;

        messageDiv.appendChild(messageHeader);
        messageDiv.appendChild(textElement);

        chatContainer.appendChild(messageDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
        return textElement;
    }

    // Show typing indicator
    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'typing-indicator';
        typingDiv.id = 'typing-indicator';

        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('div');
            dot.className = 'typing-dot';
            typingDiv.appendChild(dot);
        }

        chatContainer.appendChild(typingDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    // Remove typing indicator
    function removeTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    // Speak function
    function speak() {
        const text = textInput.value.trim();
        if (!text) return;

        addMessage(text, true);
        textInput.value = '';
        showTypingIndicator();

        setTimeout(() => {
            removeTypingIndicator();

            const spokenTextContainer = addMessage("", false, true);

            currentUtterance = new SpeechSynthesisUtterance(text);

            // Set voice profile based on selection
            const voiceSelect = document.getElementById('voice-select');
            const selectedProfile = voiceSelect ? voiceSelect.value : 'default';

            // Default settings
            let pitch = 1.0;
            let rate = 1.0;

            // Apply profile settings
            switch (selectedProfile) {
                case 'male':
                    pitch = 0.9;
                    rate = 1.0;
                    break;
                case 'female':
                    pitch = 1.2;
                    rate = 1.0;
                    break;
                default:
                    // Fallback to male if something goes wrong, or just standard
                    pitch = 0.9;
                    rate = 1.0;
            }

            currentUtterance.pitch = pitch;
            currentUtterance.rate = rate;

            // Optional: Try to find a gender-matching voice if available (enhancement)
            // functionality mainly relies on pitch/rate as requested but this adds realism if matching voices exist
            const voices = speechSynthesis.getVoices();
            if (voices.length > 0) {
                // Try to find a preferred voice for the profile (heuristic)
                let preferredVoice = null;
                if (selectedProfile === 'female') {
                    preferredVoice = voices.find(v => v.name.includes('Female') || v.name.includes('Zira') || v.name.includes('Google US English'));
                } else if (selectedProfile === 'male') {
                    preferredVoice = voices.find(v => v.name.includes('Male') || v.name.includes('David') || v.name.includes('Mark'));
                }

                if (preferredVoice) {
                    currentUtterance.voice = preferredVoice;
                }
            }

            currentUtterance.onboundary = function (event) {
                const charIndex = event.charIndex;
                const spokenText = text.substring(0, charIndex);
                const remainingText = text.substring(charIndex);
                spokenTextContainer.innerHTML = `<span class="highlight">${spokenText}</span>${remainingText}`;
            };

            currentUtterance.onend = function () {
                spokenTextContainer.innerHTML = text;
            };

            speechSynthesis.speak(currentUtterance);
        }, 1500);
    }

    // Stop speaking
    function stopSpeaking() {
        speechSynthesis.cancel();
    }

    // Event listeners
    speakBtn.addEventListener('click', speak);
    stopBtn.addEventListener('click', stopSpeaking);

    textInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            speak();
        }
    });

    setTimeout(() => {
        addMessage("Try entering text like: 'Welcome to our podcast series on artificial intelligence. Today we'll explore how AI is transforming the way we work and live.'");
    }, 2000);
});