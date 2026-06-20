# O(Nope) 🔥 - The Ultimate Technical Interview Simulator

## Inspiration
The AI education market is filled with overly polite, highly agreeable AI tutors. While these tools are helpful for learning syntax, they fail to prepare developers for the high-pressure reality of technical screening interviews. Standard AI assistants are verbose and unwilling to point out flawed logic directly. My inspiration was to build a system that utilizes a strict, highly professional persona to force rapid improvement, while offering a brutal "Code Roast" mode for those who need an ego check.

## What it does
O(Nope) is a comprehensive technical interview simulator with five distinct, focused modes wrapped in a sleek, brutalist UI:

1. **Dashboard**: Tracks your persistent "Ego Score," which starts at 100. Let's see how fast you drop to 0. It also includes a "Reset System" trigger if you need to start fresh.
2. **The Code Roast**: Submit buggy Python code and get a sarcastic, harsh review pointing out your exact syntax errors, before showing you how to actually fix it.
3. **Forensic Visualizer**: Step through your Python code execution line-by-line. It runs your code safely in the background and renders variables and stack frames in real-time natively inside the Monaco editor.
4. **Think Out Loud (Algorithmic Speech Grader)**: Practice your communication skills. Talk through how you would solve a coding problem using your microphone. The app transcribes it and grades your explanation based on how clear and correct you were.
5. **Live Interview**: A real-time, voice-to-voice mock interview with a strict AI Senior Engineer. It acts just like a real interviewer and talks back to you with zero lag.

## How I built it
O(Nope) utilizes a highly optimized hybrid architecture:
- **Frontend**: A sleek, reactive UI built with React, Vite, and Framer Motion, delivering a high-end brutalist aesthetic featuring CRT noise overlays, Vantablack, Cyberpunk Red, and Matrix Green accents. It seamlessly integrates `@monaco-editor/react` for a premium coding experience.
- **Backend & AI**: A robust FastAPI Python server orchestrating multiple AI components.
- **Cognitive Engine**: I leveraged Groq's LPU API with the LLaMA-3.3-70B model. This deterministic tensor streaming architecture ensures instantaneous, sub-second responses necessary for a fluid conversational experience.
- **Speech-to-Text**: Real-time browser microphone access routes audio to the Groq Whisper API for ultra-fast, low-latency transcription.
- **Deterministic Static Analysis & Tracing**: I utilized the Python `ast` and `pyflakes` modules to run deterministic static code analysis *before* consulting the LLM. The Forensic Visualizer utilizes a custom `sys.settrace` sandbox executed in isolated `multiprocessing` threads to prevent system compromise while capturing step-by-step memory states.

## Challenges I ran into
Building a multimodal, real-time application in a hackathon timeframe presented massive hurdles:
- **Audio Latency**: Initial attempts to process audio caused severe latency. I overcame this by optimizing the chunking and routing of `.wav` files to the asynchronous Groq Whisper API, ensuring the conversation didn't feel sluggish.
- **State Management & UI Overhaul**: Decoupling the Code Roast from the Code Visualizer while maintaining smooth state and interactive Monaco line-highlighting required meticulous React hooks and ref-forwarding.
- **Forcing JSON Output**: Making an LLM act as a strict mathematical judge and reliably return correctly formatted JSON objects (for the Think Out Loud rubric) required intense prompt engineering and strict temperature controls.

## Accomplishments that I'm proud of
- Achieving **sub-second latency** by integrating the Groq LPU API, making the live interview feel genuinely conversational.
- Successfully integrating a frictionless, full-stack **Whisper speech-to-text pipeline** directly from a React browser application to the high-speed Groq API.
- Developing the **Forensic Visualizer** from scratch, hooking directly into Python's `sys.settrace` and synchronizing the execution state natively with the Monaco editor DOM via delta decorations.
- Delivering a **premium, highly-polished brutalist UI/UX** that completely disrupts the standard "friendly chatbot" paradigm.

## How to Run

### 1. Clone the repository
```bash
git clone https://github.com/RohanMukka/O-Nope-.git
cd O-Nope-
```

### 2. Set Up the Backend (FastAPI)
1. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
2. Start the backend FastAPI server:
   ```bash
   python api/main.py
   ```
   *(Backend runs on `http://localhost:8000`)*

### 3. Set Up the Frontend (Vite / React)
1. Open a new terminal window and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install frontend dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *(Frontend runs on `http://localhost:5173`)*
