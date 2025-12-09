# 🤖 Smart Customer Support Chatbot (RAG)

A production-grade, full-stack AI chatbot that solves the problem of repetitive customer support queries. It uses **Retrieval-Augmented Generation (RAG)** to provide accurate, hallucination-free answers by grounding the AI in a private MongoDB knowledge base.

🔗 **Live Demo:** [View Live Application]([https://www.google.com/search?q=https://YOUR_GITHUB_USERNAME.github.io/smart-customer-support-chatbot/](https://github.com/bhargavaalapati/simple-RAG-chatbot/))  
*(Note: The backend is hosted on a free Render instance and may take 50 seconds to wake up on the first request.)*

-----

## 🚀 Key Features

  * **🔍 Retrieval-Augmented Generation (RAG):**
      * **Retrieval:** Uses MongoDB Atlas Text Search to find relevant policy documents in milliseconds.
      * **Generation:** Feeds the retrieved context to **Google Gemini 2.0 Flash** to craft polite, human-like answers.
  * **🛡️ Intelligent Fail-Safe:**
      * If the AI API is down or rate-limited, the system gracefully degrades to "Offline Mode," serving the raw database match directly to the user.
  * **💾 Persistent History:**
      * Chat sessions are saved in `localStorage`, preserving conversation context even after a page refresh.
  * **📚 Source Citations:**
      * Every answer includes a "Source" tag, showing exactly which FAQ document was used to generate the response (Explainable AI).
  * **✨ Modern UI:**
      * Built with **React + Vite** and styled with **Emotion (Styled Components)**.
      * Supports Markdown rendering for rich text responses (bold, lists, etc.).

-----

## 🛠️ Tech Stack

| Component | Technology | Reasoning |
| :--- | :--- | :--- |
| **Frontend** | React (Vite) | Fast development, modular component architecture. |
| **Styling** | Emotion / Styled Components | Scoped CSS, preventing class name collisions in large apps. |
| **Backend** | Node.js + Express | Lightweight, non-blocking I/O ideal for handling API requests. |
| **Database** | MongoDB + Mongoose | Flexible schema and powerful native Text Search capabilities. |
| **AI Model** | Google Gemini 2.0 Flash | High speed, low latency, and cost-effective for real-time chat. |

-----

## 🧠 System Architecture (RAG Pipeline)

When a user asks: *"How do I reset my password?"*

1.  **Ingestion:** The User Query is sent to the Node.js Backend.
2.  **Retrieval (Vector/Text Search):**
      * The backend queries MongoDB: `Find documents where text matches "reset" AND "password"`.
      * It retrieves the Top 4 most relevant documents.
3.  **Augmentation (Prompt Engineering):**
      * The backend constructs a strict prompt:
      * *"You are a support agent. Answer the user based ONLY on the following context: [Insert Retrieved Docs]. If the answer is missing, say you don't know."*
4.  **Generation:**
      * This prompt is sent to the **Gemini API**.
      * Gemini generates the response.
5.  **Delivery:** The response is sent to the React frontend along with the source metadata.

-----

## ⚙️ Local Installation & Setup

### Prerequisites

  * Node.js (v18+)
  * MongoDB (Local or Atlas URL)
  * Google Gemini API Key

### 1\. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/smart-customer-support-chatbot.git
cd smart-customer-support-chatbot
```

### 2\. Backend Setup

```bash
cd backend
npm install

# Create Environment Variables
# Create a file named .env in /backend and add:
PORT=5000
MONGO_URI=mongodb://localhost:27017/simple-chatbot-rag  # Or your Atlas URL
GEMINI_API_KEY=your_gemini_api_key_here
USE_MOCK_AI=false
```

### 3\. Frontend Setup

```bash
cd ../frontend
npm install
```

### 4\. Seed the Database

Before the chat works, you need to populate the knowledge base.

1.  Start the backend: `cd backend && npm start`
2.  In a new terminal, run:
    ```bash
    curl -X POST http://localhost:5000/api/seed
    ```
    *(Returns: "Database seeded successfully with 60 entries\!")*

### 5\. Run the Application

```bash
# Terminal 1: Backend
cd backend && npm start

# Terminal 2: Frontend
cd frontend && npm run dev
```

Open `http://localhost:5173` to chat\!

-----

## 📡 API Reference

### `POST /api/chat`

Handles the RAG logic.

**Request:**

```json
{
  "query": "What is your refund policy?"
}
```

**Response:**

```json
{
  "botResponse": "You can request a full refund within 30 days of purchase...",
  "contextUsed": [
    { "question": "Refund policy?", "answer": "...", "score": 2.5 }
  ]
}
```

### `POST /api/seed`

Resets and repopulates the MongoDB database with default FAQs.

-----

## 🚀 Deployment Guide

This project follows a decoupled deployment strategy:

1.  **Frontend:** Hosted on **GitHub Pages** (Static Hosting).
2.  **Backend:** Hosted on **Render** (Node.js Web Service).
3.  **Database:** Hosted on **MongoDB Atlas**.

To deploy your own instance, refer to the `deployment-guide.md` (or simply push to the `gh-pages` branch for frontend).

-----

## 🔮 Future Improvements

  * **Vector Embeddings:** Upgrade from MongoDB Text Search to **Vector Search** using embeddings (e.g., `text-embedding-004`) for better semantic understanding.
  * **Admin Dashboard:** Create a UI for support staff to add/edit FAQ documents dynamically.
  * **Multi-turn Context:** Pass the previous 2-3 messages to the LLM so it "remembers" the conversation context.

-----

**Author:** Bhargava Rama Bharadwaja Alapati  
**License:** MIT
