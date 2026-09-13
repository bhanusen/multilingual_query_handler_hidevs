document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const apiKeyInput = document.getElementById('api-key');
    const saveSettingsBtn = document.getElementById('save-settings');
    const settingsStatus = document.getElementById('settings-status');
    const queryForm = document.getElementById('query-form');
    const queryInput = document.getElementById('query-input');
    const sendBtn = document.getElementById('send-btn');
    const messagesContainer = document.getElementById('messages');
    const statusDot = document.querySelector('.dot');
    const statusText = document.querySelector('.status-indicator').lastChild;

    // Load API Key from local storage
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) {
        apiKeyInput.value = savedKey;
    }

    // Save API Key
    saveSettingsBtn.addEventListener('click', () => {
        const key = apiKeyInput.value.trim();
        if (key) {
            localStorage.setItem('gemini_api_key', key);
            settingsStatus.textContent = 'Saved successfully!';
            settingsStatus.classList.remove('hidden');
            setTimeout(() => {
                settingsStatus.classList.add('hidden');
            }, 3000);
        }
    });

    // Auto-resize textarea
    queryInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
        sendBtn.disabled = this.value.trim() === '';
    });

    // Handle Enter key (Shift+Enter for new line)
    queryInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!sendBtn.disabled) {
                queryForm.requestSubmit();
            }
        }
    });

    // Handle Form Submit
    queryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const text = queryInput.value.trim();
        const apiKey = localStorage.getItem('gemini_api_key') || document.getElementById('api-key').value.trim();

        if (!text) return;

        if (!apiKey) {
            alert('Please enter and save your Gemini API Key first.');
            apiKeyInput.focus();
            return;
        }

        // Remove empty state if present
        const emptyState = document.querySelector('.empty-state');
        if (emptyState) emptyState.remove();

        // UI updates for loading
        queryInput.value = '';
        queryInput.style.height = 'auto';
        sendBtn.disabled = true;
        
        statusDot.classList.add('processing');
        statusText.textContent = ' Translating...';

        try {
            const result = await processQuery(text, apiKey);
            addMessageToUI(text, result);
        } catch (error) {
            console.error(error);
            alert(`Error processing query: ${error.message}`);
        } finally {
            statusDot.classList.remove('processing');
            statusText.textContent = ' Waiting for input';
            
            // Scroll to bottom
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    });

    async function processQuery(queryText, apiKey) {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`;
        
        const prompt = `
            You are a helpful customer support assistant. 
            A user has submitted the following query: "${queryText}"
            
            Please analyze the query and provide the following in strict JSON format:
            {
                "detectedLanguage": "The language of the original query (e.g., Spanish, Hindi, French, English)",
                "englishTranslation": "The accurate translation of the query into English (if it's already English, just repeat it)",
                "suggestedResponse": "A suggested polite and helpful response to the user's query, written in English. Keep it concise."
            }
            
            Return ONLY the JSON object, without any markdown formatting like \`\`\`json.
        `;

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.2,
                }
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'API Request Failed');
        }

        const data = await response.json();
        
        try {
            const resultText = data.candidates[0].content.parts[0].text.trim();
            // In case the model still returns markdown JSON blocks despite instructions
            const cleanJsonStr = resultText.replace(/```json\n?|\n?```/gi, '');
            return JSON.parse(cleanJsonStr);
        } catch (e) {
            console.error("Failed to parse Gemini response:", data);
            throw new Error("Invalid response format from AI");
        }
    }

    function addMessageToUI(originalText, result) {
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        const messageCard = document.createElement('div');
        messageCard.className = 'message-card glass-panel';
        
        messageCard.innerHTML = `
            <div class="message-header">
                <span class="badge lang-badge">${result.detectedLanguage} (Detected)</span>
                <span class="timestamp">${time}</span>
            </div>
            <div class="message-body">
                <p class="original-text">${escapeHTML(originalText)}</p>
                <div class="translation-box">
                    <i class="fa-solid fa-language"></i>
                    <p class="translated-text">${escapeHTML(result.englishTranslation)}</p>
                </div>
            </div>
            <div class="message-footer">
                <h4>Suggested Response:</h4>
                <p class="suggested-response">${escapeHTML(result.suggestedResponse)}</p>
                <button class="btn secondary-btn sm-btn copy-btn"><i class="fa-regular fa-copy"></i> Copy</button>
            </div>
        `;

        // Add copy functionality
        const copyBtn = messageCard.querySelector('.copy-btn');
        copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(result.suggestedResponse);
            const originalHTML = copyBtn.innerHTML;
            copyBtn.innerHTML = '<i class="fa-solid fa-check"></i> Copied';
            setTimeout(() => {
                copyBtn.innerHTML = originalHTML;
            }, 2000);
        });

        messagesContainer.appendChild(messageCard);
    }

    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag)
        );
    }
});
