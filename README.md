# 📧 PEP Agent: Prompt-Driven Email Productivity

> **"An intelligent, configurable agent that uses AI to detect signals in the deep sea of your inbox."**

## 📋 Project Overview
**PEP Agent** is a full-stack Generative AI application designed to simulate an autonomous email productivity assistant. 

Unlike standard email clients, PEP is **Prompt-Driven**, meaning the user has full control over the "Agent's Brain." By configuring natural language prompts in the UI, users can dynamically dictate how the AI categorizes emails, extracts action items, and analyzes tone—without writing a single line of code.

This project was architected to demonstrate a scalable, modular approach to building **AI Agents** using modern frameworks like **LangChain**, **FastAPI**, and **React**.

---

## 🏗️ Architecture & Tech Stack

This solution follows a **Microservices** architecture with a clear separation of concerns, suitable for enterprise AI deployment.

| Component | Technology | Reasoning |
| :--- | :--- | :--- |
| **AI Orchestration** | **LangChain** | Manages the prompt templates and chains, ensuring structured JSON output from the LLM. |
| **LLM Provider** | **Google Gemini Pro** | High-performance, cost-effective inference via `langchain-google-genai`. |
| **Backend API** | **FastAPI (Python)** | Asynchronous REST API handling the business logic and AI processing pipeline. |
| **Database** | **MongoDB (NoSQL)** | Document store used for its flexible schema, perfect for storing unstructured email bodies and dynamic AI analysis results. |
| **Frontend** | **React + Vite** | Provides a responsive, interactive dashboard. Styled with **Tailwind CSS** for a modern user experience. |

---

## 🛠️ Setup Instructions

### Prerequisites
Before running the application, ensure you have the following installed:
* **Node.js** (v18 or higher)
* **Python** (v3.10 or higher)
* **MongoDB** (Must be installed and running locally on port 27017)
* **Google Gemini API Key** (Available freely via Google AI Studio)

### 1. Clone the Repository
```bash
git clone [https://github.com/your-username/pep-agent.git](https://github.com/your-username/pep-agent.git)
cd pep-agent

2. Backend Setup (FastAPI)

Navigate to the backend folder, create a virtual environment, and install dependencies.
Bash

cd backend

# Create virtual environment
python -m venv env

# Activate environment
# On Windows:
env\Scripts\activate
# On Mac/Linux:
source env/bin/activate

# Install libraries
pip install -r requirements.txt

Environment Configuration: Create a file named .env inside the backend/ folder. This is critical for the AI to function.
Ini, TOML

MONGO_URI=mongodb://localhost:27017
GOOGLE_API_KEY=AIzaSy... (Paste your actual Gemini Key here)

3. Frontend Setup (React + Vite)

Open a new terminal, navigate to the frontend folder, and install dependencies.
Bash

cd frontend
npm install

🚀 How to Run the Application

You need to run the Backend and Frontend in separate terminal windows.

Terminal 1: Start the Backend
Bash

cd backend
# Ensure your virtual environment is active (source env/bin/activate)
uvicorn main:app --reload

The API will start at http://127.0.0.1:8000

Terminal 2: Start the UI
Bash

cd frontend
npm run dev

The Dashboard will launch at http://localhost:5173

📨 How to Load the Mock Inbox

Since this is a simulation, you do not need to connect a real Gmail account. The system comes with a built-in Mock Data generator.

    Open the Dashboard in your browser (http://localhost:5173).

    Click the white button labeled "Reset & Load Mock" in the top right corner.

    Result: This will trigger the /inbox/load_mock endpoint, clearing the database and inserting 5-10 sample emails (Work requests, Spam, Newsletters) into your local MongoDB.

🧠 How to Configure Prompts

The core feature of PEP Agent is the Prompt Brain. You can change the AI's behavior by editing the prompts directly in the UI.

    Click the "Prompt Brain" button in the sidebar.

    You will see the "Categorization & Analysis Prompt" text area.

    Edit the text: You can change the instructions.

        Default: "Categorize into Work, Personal, Spam."

        Modification: "Categorize into Urgent, Non-Urgent. If the sender is 'Boss', mark as Critical."

    Click "Save Configuration".

    Effect: The backend updates the prompt_configs collection in MongoDB. Any future emails processed will use these new rules dynamically.

💡 Usage Examples

Scenario 1: Processing the Inbox

    Load: Click "Reset & Load Mock". You will see emails marked as "Pending" (Grey badge).

    Analyze: Click the purple "Analyze Unread" button.

    Process: The system sends the emails to Gemini Pro alongside your stored prompt.

    Result: The UI updates automatically. You will see:

        Categories: (e.g., "WORK" in Blue, "SPAM" in Red).

        AI Summary: A concise summary of the email content.

        Action Items: Structured tasks (e.g., "Send Q3 Report") with extracted deadlines.

Scenario 2: Testing Robustness

    Modify: Go to "Prompt Brain" and add a rule: "Respond in Pirate Speak for the summary."

    Reset: Go back to Inbox and click "Reset & Load Mock".

    Run: Click "Analyze Unread".

    Result: The summaries will now read like "Ahoy! The captain wants the report by Friday!", proving the Prompt-Driven architecture works.

🔮 Future Roadmap

To align with enterprise RAG requirements, the following features are planned:

    Vector Search (RAG): Implementation of MongoDB Atlas Vector Search to allow users to "Chat with their Inbox."

    Multi-Agent Workflow: Upgrading to LangGraph to have specialized agents for Drafting vs. Analysis.

    Draft Generation: Adding a "Reply" button that uses the "Tone Prompt" to auto-draft responses.

Author: Tarush Saxena Software Developer | Generative AI Enthusiast