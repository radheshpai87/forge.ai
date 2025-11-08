# Forge AI

Forge AI is a personalized AI co-pilot designed to assist startup founders. It acts as a strategic partner, helping founders analyze problems, discover new opportunities, and generate actionable plans tailored to their specific context.

This project leverages the power of the Google Gemini API to provide deep, personalized insights by synthesizing information about the founder's profile, market trends, and real-time data.

## ✨ Features

Forge AI offers three core services:

1.  **🔬 User-Driven Problem Analysis (`analyzeProblem`)**:
    *   Founders submit a problem statement.
    *   The AI refines the problem and conducts a deep analysis based on the founder's profile (team size, runway, tech stack, location).
    *   It generates a structured report covering existing solutions, feasibility, market size, and potential risks.

2.  **🔭 Proactive Opportunity Discovery (`discoverOpportunities`)**:
    *   The AI scans a given sector (e.g., "EdTech", "FinTech") for emerging trends and pain points.
    *   It identifies and presents 5 "hot" problems that are a viable fit for the founder, complete with a personalization note explaining the match.

3.  **🧠 Composed Action Plan (`composeActionPlan`)**:
    *   This is the central brain of the application, acting as an autonomous agent.
    *   It fuses insights from the problem analysis, discovered opportunities, and even simulated live data streams (like user feedback).
    *   It synthesizes this information into a prioritized, executable action plan with clear owners (founder, AI, or tool) and deadlines.

## 🚀 Getting Started

Follow these steps to get the project running on your local machine.

### Prerequisites

*   Node.js and npm (or yarn)
*   A Google AI API Key. You can get one from Google AI Studio.

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd <repository-directory>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```
    or
    ```bash
    yarn install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root of your project and add your Google AI API key:

    ```
    API_KEY=your_google_ai_api_key_here
    ```
    The application will not run without this key.

4.  **Run the application:**
    ```bash
    npm start
    ```
    or
    ```bash
    yarn start
    ```

    This will start the React development server, and you can view the application in your browser.

## 🛠️ How It Works

The core logic resides in `services/geminiService.ts`. This service communicates with the Google Gemini API to power the AI features.

*   **Structured Prompts**: The service uses highly detailed system instructions to guide the AI's behavior, ensuring the output is personalized and follows a strict process.
*   **JSON Schema Enforcement**: For each feature, a `responseSchema` is provided to the Gemini model. This forces the AI to return a valid, structured JSON object, which eliminates the need for fragile string parsing and ensures data consistency.
*   **Model Selection**: The service intelligently uses different models for different tasks:
    *   `gemini-2.5-pro`: For complex, in-depth tasks like `analyzeProblem` and `composeActionPlan`.
    *   `gemini-2.5-flash`: For faster, more focused tasks like `discoverOpportunities`.
*   **Error Handling**: A robust `handleGeminiError` function provides user-friendly messages, especially for common issues like API rate limits (429 errors).

## 📂 Project Structure

```
├── public/
├── src/
│   ├── services/
│   │   └── geminiService.ts  # Core AI logic and API calls
│   ├── types/                # TypeScript type definitions
│   ├── App.tsx               # Main application component
│   └── index.tsx             # React application entry point
└── package.json
```