# Real-Time Multilingual Query Handler

## Overview
The **Real-Time Multilingual Query Handler** is a serverless frontend web application designed to empower customer support teams by instantly translating incoming customer queries from any language into English. By leveraging the advanced capabilities of the Google Gemini API (specifically the `gemini-3.6-flash` model), it securely detects the source language, provides an accurate English translation, and intelligently suggests a polite, helpful response in English.

This tool enables global support operations with minimal infrastructure, allowing teams to assist customers worldwide without language barriers.

## Key Features
- **Real-Time Language Detection:** Automatically identifies the language of the incoming customer query.
- **Accurate English Translation:** Seamlessly translates the query into English using cutting-edge AI.
- **Smart Response Generation:** Suggests a contextually appropriate, polite response in English.
- **Serverless Architecture:** A purely frontend solution (HTML, CSS, Vanilla JS) that requires no backend server.
- **Secure API Key Management:** Your Gemini API key is stored locally in your browser's `localStorage` and never transmitted to external servers (other than Google's secure API).
- **Premium User Interface:** A sleek, dark-mode design with glassmorphism effects, smooth animations, and responsive layout.

## Setup Instructions

Since this is a client-side application, setup is incredibly straightforward:

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/your-username/multilingual_query_handler_hidevs.git
   cd multilingual_query_handler_hidevs
   ```

2. **Serve the Application Locally:**
   Because the application utilizes modern JavaScript modules, you must serve it over a local web server (to avoid browser CORS restrictions). You can use any simple HTTP server.
   
   Using Node.js:
   ```bash
   npx http-server -p 8080
   ```
   
   Or using Python:
   ```bash
   python -m http.server 8080
   ```

3. **Open the App:**
   Open your browser and navigate to `http://localhost:8080`.

4. **Configure your API Key:**
   - Retrieve a free API key from [Google AI Studio](https://aistudio.google.com/).
   - Paste the key into the "Gemini API Key" input on the left sidebar of the application.
   - Click **Save Settings**.

5. **Start Translating:**
   Type a query in any language into the bottom text area and click Send!

## Demo Video
https://youtu.be/wUDXnyfwA5E

## Technical Approach
This project was built focusing on implementation simplicity and robust functionality. We opted for Vanilla JavaScript to minimize dependency overhead and maximize performance. The Gemini API was selected for its exceptional multilingual capabilities and highly structured JSON output generation, enabling us to parse the detected language, translation, and suggested response in a single, efficient API call.
