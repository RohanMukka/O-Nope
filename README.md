# O(Nope) 🔥 - Your Brutally Honest Coding Coach

![O(Nope) Interface](https://raw.githubusercontent.com/placeholder/image.png)

## Inspiration
The artificial intelligence education market is incredibly saturated with overly polite, highly agreeable AI tutors. While these tools are helpful for learning syntax, they fail spectacularly at preparing developers for the high-pressure reality of technical screening interviews. Standard AI assistants are verbose and unwilling to point out flawed logic directly. Our inspiration was to build a system that utilizes a "tough love" persona to force rapid improvement, simulating the absolute worst-case scenario of a harsh technical interviewer.

## What it does
O(Nope) is a brutally honest, highly critical AI coding coach with three primary modes:

1. **Live Video Interview**: A high-pressure, role-based simulator where an AI avatar (Senior Engineer, Staff Engineer, or Tech Lead) grills you dynamically via a live video/audio feed. It maintains context, scores your responses out of 10, and generates immediate voice responses using edge-tts.
2. **Think Out Loud (Algorithmic Speech Grader)**: Users select a classic DSA problem (e.g., Two Sum) and verbalize their algorithmic approach via microphone. O(Nope) transcribes the audio and rigorously grades the explanation against a strict rubric (identifying brute force, articulating optimal paths, stating correct space/time complexity) before delivering a comprehensive critique.
3. **The Code Roast**: Users submit buggy Python code and select an intensity (Constructive, Brutal, or Demeaning). O(Nope) instantly identifies syntax errors and delivers a devastating roast heavily focused on the developer's specific mistakes, before begrudgingly providing the correct, operational code.

## How we built it
O(Nope) utilizes a highly optimized hybrid architecture:
- **Frontend**: A sleek, reactive UI built with React and Vite, delivering a "hacker-centric" dark mode aesthetic.
- **Backend & AI**: A robust FastAPI Python server orchestrating multiple AI components.
- **Cognitive Engine**: We leverage Groq's LPU API with the LLaMA-3.3-70B model. This deterministic tensor streaming architecture ensures instantaneous, sub-second responses necessary for a fluid conversational experience.
- **Speech-to-Text**: Real-time browser microphone access routes audio to a local OpenAI Whisper model for rapid transcription.
- **Deterministic Static Analysis**: In "The Code Roast" mode, we utilize the Python `ast` and `pyflakes` modules to run deterministic static code analysis *before* consulting the LLM. This grounds the AI's probabilistic generation in verified, factual syntax errors, preventing hallucinations.

## Challenges we ran into
Building a multimodal, real-time application in a hackathon timeframe presented massive hurdles:
- **Audio Latency**: Initial attempts to process audio caused severe latency. We overcame this by optimizing the chunking and routing of `.wav` files to the local Whisper model, ensuring the conversation didn't feel sluggish.
- **React/FastAPI Integration**: Ensuring state didn't reset across components and seamlessly passing multipart form data (audio blobs + JSON strings) required extensive debugging and careful state management.
- **Forcing JSON Output**: Making an LLM act as a strict mathematical judge and reliably return correctly formatted JSON objects (for the Think Out Loud rubric) required intense prompt engineering and strict temperature controls.

## Accomplishments that we're proud of
- Achieving **sub-second latency** by integrating the Groq LPU API, making the live interview feel genuinely conversational.
- Successfully integrating a frictionless, full-stack **Whisper speech-to-text pipeline** directly from a React browser application to a local Python backend.
- Designing a highly unique, engaging, and genuinely useful educational tool that disrupts the standard "friendly chatbot" paradigm.
