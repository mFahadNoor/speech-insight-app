# Speech Insight App

This is a mobile application built with React Native and Expo that allows users to record their speech, get it transcribed, and analyze the emotional content of the text.

## Features

1.  **Speech Recording**: Record audio directly from the app.
2.  **Speech-to-Text**: Utilizes **Whisper AI** for accurate transcription.
3.  **Emotion Analysis**: A custom-trained model using Google's GoEmotion dataset analyzes the text to determine emotional tone.
4.  **AI-Powered Insights**: Uses **Gemini** to display relevant information and insights based on the analysis.

## Getting Started

### Prerequisites

- Node.js and npm
- Expo CLI
- An account with AssemblyAI and a corresponding API key.
- A Google Cloud Platform account with the Gemini API enabled and a corresponding API key.

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/speech-insight-app.git
    cd speech-insight-app
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the `speech-insight-app` directory and add your API keys:
    ```
    ASSEMBLYAI_API_KEY="YOUR_ASSEMBLYAI_API_KEY"
    GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
    ```

4.  **Run the application:**
    ```bash
    npm start
    ```
    This will start the Metro bundler. You can then run the app on an Android or iOS simulator, or on a physical device using the Expo Go app.
