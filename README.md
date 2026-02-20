# 🚀 Jesús Mora — Adaptive Talent AI
### *Interactive Portfolio and Application Analyzer with RAG Architecture*

> [!NOTE]
> **¿Buscas la versión en español?** [Haz clic aquí](./README_es.md).

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-05998b?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o-412991?style=for-the-badge&logo=openai)](https://openai.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

---

## 🌟 a. Project Overview

**Adaptive Talent AI** is not a conventional portfolio; it is an **AI-driven technical and cultural fit evaluation tool**, developed as the capstone project for the Master's Degree in AI Development.

It utilizes a **RAG (Retrieval-Augmented Generation)** architecture to act as a digital technical consultant that "lives" within my professional profile. Its goal is to move beyond the static CV concept, allowing recruiters to interact with a "digital twin" capable of reasoning how my background aligns with their specific needs.

### 🧠 The Heart of AI: RAG & Professional Context
Unlike generic chatbots, this system anchors its responses to an **Exclusive Knowledge Base** regarding my actual career:
- **Critical & Legacy Systems:** Experience in maintenance and modernization (e.g., Java 6 architectures).
- **Large-Scale Systems:** Unification of complex corporate ecosystems (+60 applications).
- **Modern Development & AI:** Creation of advanced interfaces (Next.js 15) and AI agent integration.

### 🛡️ Commitment to Responsible AI & Privacy
- **Total Privacy:** Data from job offers submitted by users is processed ephemerally. It is **never** used to train public models or stored for tracking purposes.
- **Technical Honesty:** The AI is programmed to be a strict evaluator. When it detects a technological gap, it does not fabricate experience; instead, it pivots on core architectural principles to argue my adaptability and learning capacity.

---

## 🛠️ b. Tech Stack

The project uses a decoupled architecture aimed at scalability and efficient processing of large language models:

| Layer | Key Technologies |
| :--- | :--- |
| **Frontend** | Next.js 15 (App Router), TypeScript, Tailwind CSS, Framer Motion |
| **Backend** | Python 3.10+, FastAPI, Uvicorn |
| **AI & RAG** | OpenAI SDK (GPT-4o), LangChain, Vector Database |
| **UI/UX** | Glassmorphism Design, Terminal UI, Lucide React (Dynamic iconography) |

---

## ⚙️ c. Installation and Execution

To replicate the development environment and test the interactive system, follow these steps:

### 1. Data Ingestion (Generating the AI Brain)
Before launching the application, the base knowledge must be processed.
```bash
cd backend
pip install -r requirements.txt
# Generates vector embeddings from the documents located in /data
python ingest.py 
```

### 2. Local Environment Execution
Two separate terminals are required for the server and the frontend interface:

**Terminal 1: Backend (FastAPI)**
```bash
cd backend
# Ensure your .env file is configured with the OPENAI_API_KEY
uvicorn main:app --reload
```
*(The server will run on `http://localhost:8000`)*

**Terminal 2: Frontend (Next.js)**
```bash
cd frontend
npm install
# Ensure NEXT_PUBLIC_BACKEND_URL is pointing to port 8000
npm run dev
```
*(The application will be available at `http://localhost:3000`)*

### 🚀 Production Deployment (Render / Vercel)
For the backend deployment, the **Build Command** must ensure the creation of the vector database before starting the server. Make sure to configure this command on your platform (e.g., Render):
```bash
pip install -r requirements.txt && python ingest.py
```

---

## 📂 d. Project Structure

The repository organization clearly separates the business logic (AI) from the user interface:

```text
├── backend/
│   ├── data/               # Source documentation and CV (Source of truth)
│   ├── vector_db/          # Persistent vector database (Auto-generated)
│   ├── ingest.py           # RAG processing and chunking script
│   ├── main.py             # API and prompt orchestration logic
│   └── .env                # Environment variables (API Keys)
├── frontend/
│   ├── src/app/            # Views: Analyzer, Experience, Home (Chat)
│   ├── src/components/     # Reusable UI: ChatWidget, Navbar, BentoGrid
│   ├── src/services/       # API call layer (chatService.ts)
│   └── src/context/        # Global state and preventive logic management
└── README.md               # Main documentation
```

---

## 📊 e. Main Features

### 1. AI Offer Analyzer (Senior Recruiter Persona)
Upload a job description and receive a rigorous technical diagnosis.
* **Pre-processing Filters:** Detects non-IT related texts or insufficient length before sending the request (saving API tokens).
* **Realistic Fit Calculation:** A scoring system that actively penalizes the absence of core skills.
* **Strategic Defense:** Identifies architectural equivalencies to suggest selling points against non-mastered tools.

### 2. Conversational Agent (Smart Chat)
A command-terminal-inspired interface that allows users to ask technical or soft-skills questions directly against my profile. It implements *Guardrails* that block sensitive information requests, redirecting the user to official contact channels (LinkedIn).

### 3. Visual Showcase (Bento Grid)
An experience section designed with a modern UI that allows for quick exploration of my most notable milestones in demanding sectors such as **Banking, Telecommunications, and Public Administration**.

---

## 🧭 f. Roadmap and Future Evolution

The current state of the project represents a fully functional and deployable **Minimum Viable Product (MVP)**, designed to meet the Master's objectives. However, the architecture has been built to scale, with the following improvements planned for Phase 2:

### Technical Evolution (AI and Backend)
* **Multi-format Support (PDF Analyzer):** Integration of text extraction capabilities to allow users to upload job descriptions directly in `.pdf` or `.docx` formats.
* **Observability System (Logs):** Implementation of an analytics dashboard on the server to monitor prompt performance, measure token consumption, and analyze the most frequently queried topics.
* **Response Streaming:** Upgrading FastAPI endpoints to return data via *Server-Sent Events* (SSE), improving the perceived speed in the visual interface.

### Accessibility and User Experience (UX)
* **Internationalization (i18n):** Implementation of multi-language support (English/Spanish) on the frontend to dynamically adapt both the UI and the AI agent's response language, expanding reach to international recruiters.
* **Theme Management (Light/Dark Mode):** Refactoring the current design using dynamic Tailwind CSS variables to allow users to toggle between a light theme and the current dark terminal design, prioritizing visual accessibility.