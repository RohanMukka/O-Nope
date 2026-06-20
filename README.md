# O(Nope) 🔥 - The Ultimate Technical Interview Simulator

## Inspiration
The artificial intelligence education market is incredibly saturated with overly polite, highly agreeable AI tutors. While these tools are helpful for learning syntax, they fail spectacularly at preparing developers for the high-pressure reality of technical screening interviews. Standard AI assistants are verbose and unwilling to point out flawed logic directly. Our inspiration was to build a system that utilizes a strict, highly professional persona to force rapid improvement, while offering a brutal "Code Roast" mode for those who need an ego check.

## What it does
O(Nope) is a comprehensive technical interview simulator with four distinct, focused modes wrapped in a sleek, brutalist UI:

1. **Dashboard**: Tracks your persistent "Ego Score," which starts at 100. Let's see how fast you drop to 0.
2. **Live Video Interview**: A high-pressure, role-based simulator where an AI avatar (Senior Engineer, Staff Engineer, or Tech Lead) grills you dynamically via a live video/audio feed. The AI is strict and highly professional, maintaining context, scoring your responses, and delivering immediate voice feedback via edge-tts.
3. **Think Out Loud (Algorithmic Speech Grader)**: Practice your communication skills. Select a classic DSA problem (e.g., Two Sum) and verbalize your algorithmic approach via microphone. O(Nope) transcribes the audio and rigorously grades your explanation against a strict rubric (identifying brute force, articulating optimal paths, stating correct space/time complexity) before delivering a professional, line-by-line critique.
4. **The Code Roast**: For when you need a reality check. Submit buggy Python code and select an intensity (Startup, Big Tech, or Hedge Fund). O(Nope) instantly identifies syntax errors and delivers a devastating, sarcastic roast heavily focused on your specific mistakes before begrudgingly providing the corrected code.
5. **Forensic Visualizer**: Step through your code execution line-by-line. Uses a secure multiprocessing sandbox to trace your execution, rendering stack frames and variables in real-time, synchronized with live-highlighting directly within a premium Monaco editor.

## How we built it
O(Nope) utilizes a highly optimized hybrid architecture:
- **Frontend**: A sleek, reactive UI built with React, Vite, and Framer Motion, delivering a high-end brutalist aesthetic featuring CRT noise overlays, Vantablack, Cyberpunk Red, and Matrix Green accents. It seamlessly integrates `@monaco-editor/react` for a premium coding experience.
- **Backend & AI**: A robust FastAPI Python server orchestrating multiple AI components.
- **Cognitive Engine**: We leverage Groq's LPU API with the LLaMA-3.3-70B model. This deterministic tensor streaming architecture ensures instantaneous, sub-second responses necessary for a fluid conversational experience.
- **Speech-to-Text**: Real-time browser microphone access routes audio to the Groq Whisper API for ultra-fast, low-latency transcription.
- **Deterministic Static Analysis & Tracing**: We utilize the Python `ast` and `pyflakes` modules to run deterministic static code analysis *before* consulting the LLM. The Forensic Visualizer utilizes a custom `sys.settrace` sandbox executed in isolated `multiprocessing` threads to prevent system compromise while capturing step-by-step memory states.

## Challenges we ran into
Building a multimodal, real-time application in a hackathon timeframe presented massive hurdles:
- **Audio Latency**: Initial attempts to process audio caused severe latency. We overcame this by optimizing the chunking and routing of `.wav` files to the asynchronous Groq Whisper API, ensuring the conversation didn't feel sluggish.
- **State Management & UI Overhaul**: Decoupling the Code Roast from the Code Visualizer while maintaining smooth state and interactive Monaco line-highlighting required meticulous React hooks and ref-forwarding.
- **Forcing JSON Output**: Making an LLM act as a strict mathematical judge and reliably return correctly formatted JSON objects (for the Think Out Loud rubric) required intense prompt engineering and strict temperature controls.

## Accomplishments that we're proud of
- Achieving **sub-second latency** by integrating the Groq LPU API, making the live interview feel genuinely conversational.
- Successfully integrating a frictionless, full-stack **Whisper speech-to-text pipeline** directly from a React browser application to the high-speed Groq API.
- Developing the **Forensic Visualizer** from scratch, hooking directly into Python's `sys.settrace` and synchronizing the execution state natively with the Monaco editor DOM via delta decorations.
- Delivering a **premium, highly-polished brutalist UI/UX** that completely disrupts the standard "friendly chatbot" paradigm.

## How to Run

To run the application, open **two separate terminal windows** on Windows:

### Terminal 1: Start the Backend Server (FastAPI)
1. Navigate to the project root:
   ```powershell
   cd "c:\Users\rohan\Documents\projects\O(Nope)"
   ```
2. Activate the virtual environment and start the server:
   ```powershell
   .\venv\bin\python api/main.py
   ```
   *(Backend runs on `http://localhost:8000`)*

### Terminal 2: Start the Frontend Server (Vite / React)
1. Navigate to the frontend directory:
   ```powershell
   cd "c:\Users\rohan\Documents\projects\O(Nope)\frontend"
   ```
2. Start the development server:
   ```powershell
   npm run dev
   ```
   *(Frontend runs on `http://localhost:5173`)*
