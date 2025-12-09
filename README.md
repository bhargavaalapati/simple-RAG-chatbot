# Smart Customer Support Chatbot (RAG-Enabled)

A full-stack AI chatbot built to handle customer support queries using **Retrieval-Augmented Generation (RAG)**. The system retrieves relevant company policies from a MongoDB database and generates natural language responses using Google's Gemini AI.

## 🚀 Key Features

- **RAG Architecture:** Combines database retrieval with LLM generation for grounded, accurate answers.
- **Intelligent Fallback:** Automatically switches to "Offline Mode" (Database-only response) if the AI API is unreachable or rate-limited.
- **Persistent History:** Chat sessions are saved in `localStorage`, so users don't lose context on refresh.
- **Search Engine:** Uses MongoDB Text Indexes to perform keyword similarity searches on FAQs.
- **Modern UI:** Built with React, Styled Components, and Markdown rendering for rich text support.

## 🛠️ Tech Stack

- **Frontend:** React (Vite), Emotion (Styled Components), Lucide React (Icons), React Markdown.
- **Backend:** Node.js, Express.js.
- **Database:** MongoDB (Mongoose ODM).
- **AI Model:** Google Gemini 2.0 Flash (via `@google/generative-ai`).

## ⚙️ Installation & Setup

1.  **Clone the Repository**

    ```bash
    git clone <your-repo-url>
    cd smart-chatbot
    ```

2.  **Backend Setup**

    ```bash
    cd backend
    npm install

    # Create a .env file
    echo "PORT=5000" > .env
    echo "MONGO_URI=mongodb://localhost:27017/simple-chatbot-rag" >> .env
    echo "GEMINI_API_KEY=your_google_api_key_here" >> .env
    echo "USE_MOCK_AI=false" >> .env
    ```

3.  **Frontend Setup**

    ```bash
    cd ../frontend
    npm install
    ```

4.  **Seed the Database**
    Run the backend and trigger the seed endpoint to populate FAQs.

    ```bash
    # Terminal 1
    cd backend
    npm start

    # In a new terminal
    curl -X POST http://localhost:5000/api/seed
    ```

5.  **Run the Application**

    ```bash
    # Terminal 1 (Backend)
    cd backend && npm start

    # Terminal 2 (Frontend)
    cd frontend && npm run dev
    ```

    Open `http://localhost:5173` in your browser.

## 🧠 How It Works (RAG Pipeline)

1.  **User Query:** User types "How do I reset my password?".
2.  **Retrieval:** Backend searches MongoDB for documents matching keywords like "reset" and "password".
3.  **Augmentation:** The top matching answers are combined into a single text block ("Context").
4.  **Generation:** A prompt is sent to Gemini: _"Answer the user question based ONLY on this context..."_
5.  **Response:** The AI generates a polite, human-like answer which is sent to the frontend.

## 📂 Project Structure

smart-chatbot/
├── backend/ │
├── server.js # Main API logic (Search + AI)
├── .env # API Keys
│ └── package.json
── frontend/
├── src/ │
├── App.jsx # Chat UI & State Logic
│ └── main.jsx
└── package.json
