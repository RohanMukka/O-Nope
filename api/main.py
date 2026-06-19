from fastapi import FastAPI, UploadFile, File, Form, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
import uvicorn
import os
import json
import uuid
import sys
import io
import ast
import re
import asyncio


sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utils.llm import generate_json_response, query_llm, stream_llm_response_async
from utils.audio import generate_tts, transcribe_audio_bytes
from utils.ast_checker import analyze_code
from utils.sandbox import run_visualization_safe
from prompts.system_prompts import INTERVIEW_SYSTEM_PROMPT, CODE_ROAST_SYSTEM_PROMPT, THINK_ALOUD_SYSTEM_PROMPT

app = FastAPI(title="O(Nope) API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
assets_dir = os.path.join(BASE_DIR, "assets")
app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

DSA_PROBLEMS = {
    "two_sum": {
        "problem_name": "Two Sum",
        "brute_force": "Nested loops to check every pair. O(n^2) time.",
        "optimal_approach": "Use a hash map to store complements. O(n) time.",
        "time_complexity": "O(n)",
        "space_complexity": "O(n)"
    },
    "lru_cache": {
        "problem_name": "LRU Cache",
        "brute_force": "Use an array and shift elements on access. O(n) time.",
        "optimal_approach": "Use a doubly linked list combined with a hash map for O(1) operations.",
        "time_complexity": "O(1)",
        "space_complexity": "O(n)"
    },
    "binary_search": {
        "problem_name": "Binary Search",
        "brute_force": "Linear scan through the array. O(n) time.",
        "optimal_approach": "Find middle element, halve the search space at each step.",
        "time_complexity": "O(log n)",
        "space_complexity": "O(1)"
    }
}

@app.get("/")
def read_root():
    """Health check endpoint."""
    return {"status": "ok"}

@app.post("/api/interview")
async def interview(
    role: str = Form(...),
    score: int = Form(...),
    history: str = Form(...),
    user_message: str = Form(...)
):
    """
    Handles the Role-Based Interview Simulator logic.
    Accepts the current context and user's transcribed audio text, scores the response,
    and returns an AI audio response.
    """
    try:
        if len(user_message) > 10000:
            return JSONResponse(status_code=413, content={"error": "Payload too large."})
            
        history_arr = json.loads(history)
        history_arr.append({"role": "user", "content": user_message})
        
        context = "Here is the conversation history:\n"
        for msg in history_arr:
            context += f"{msg['role']}: {msg['content']}\n"
            
        system_prompt = INTERVIEW_SYSTEM_PROMPT.format(role=role, score=score)
        
        response_data = generate_json_response(system_prompt, context)
        if "error" in response_data:
            return JSONResponse(status_code=500, content={"error": "LLM Error"})
            
        score_change = response_data.get("score_change", 0)
        ai_text = response_data.get("response_to_candidate", "")
        tip = response_data.get("improvement_tip", "")
        
        new_score = max(0, min(10, score + score_change))
        
        voice_map = {
            "Senior Engineer": "en-US-AriaNeural",
            "Staff Engineer": "en-US-GuyNeural",
            "Tech Lead": "en-US-ChristopherNeural"
        }
        voice = voice_map.get(role, "en-US-AriaNeural")
        
        audio_file = f"temp_{uuid.uuid4()}.mp3"
        audio_path = await generate_tts(ai_text, voice=voice, output_file=audio_file)
        
        return {
            "score": new_score,
            "ai_text": ai_text,
            "tip": tip,
            "audio_url": f"/api/audio/{audio_file}" if audio_path else None
        }
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

def remove_file(filepath: str):
    try:
        if os.path.exists(filepath):
            os.remove(filepath)
    except Exception as e:
        print(f"Error removing temp file {filepath}: {e}")

@app.get("/api/audio/{filename}")
def get_audio(filename: str, background_tasks: BackgroundTasks):
    """Serves the dynamically generated TTS audio files and deletes them after sending."""
    try:
        # Regex check to block path traversals completely
        if not re.match(r"^temp_[a-f0-9\-]+\.mp3$", filename):
            return JSONResponse(status_code=400, content={"error": "Invalid filename format"})
            
        if os.path.exists(filename):
            background_tasks.add_task(remove_file, filename)
            return FileResponse(filename, media_type="audio/mpeg")
        return JSONResponse(status_code=404, content={"error": "File not found"})
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.post("/api/roast")
async def roast_code(
    code: str = Form(...),
    intensity: str = Form("Constructive")
):
    """
    Handles the Code Roast logic via SSE streaming.
    """
    if len(code) > 50000:
        return JSONResponse(status_code=413, content={"error": "Payload too large. Maximum 50,000 characters."})
        
    errors = analyze_code(code)
    
    async def event_generator():
        try:
            yield f"data: {json.dumps({'type': 'metadata', 'errors': errors})}\n\n"
            
            if not errors:
                error_str = "No syntax errors found. Critique the overall logical flow, edge cases, complexity, and pythonic style instead."
            else:
                error_str = "\n".join(f"- {e}" for e in errors)
                
            context = f"The user submitted this code:\n<user_input>\n{code}\n</user_input>\n\n"
            system_prompt = CODE_ROAST_SYSTEM_PROMPT.format(intensity=intensity, syntax_errors=error_str)
            
            full_roast = ""
            async for chunk in stream_llm_response_async(system_prompt, context):
                full_roast += chunk
                yield f"data: {json.dumps({'type': 'chunk', 'text': chunk})}\n\n"
                
            # Adjust vocal style parameters per intensity to project emotion
            if intensity == "Constructive":
                voice = "en-US-AriaNeural"
                rate = "+0%"
                pitch = "+0Hz"
            elif intensity == "Brutal":
                voice = "en-US-GuyNeural"
                rate = "+12%"
                pitch = "-10%"
            else: # Demeaning
                voice = "en-GB-SoniaNeural"
                rate = "-5%"
                pitch = "+10%"
                
            audio_file = f"temp_{uuid.uuid4()}.mp3"
            # Truncate text for TTS to not exceed limits / keep it snappy
            audio_path = await generate_tts(full_roast[:1000], voice=voice, output_file=audio_file, rate=rate, pitch=pitch)
            
            if audio_path:
                yield f"data: {json.dumps({'type': 'audio', 'url': f'/api/audio/{audio_file}'})}\n\n"
                
            yield "data: [DONE]\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'text': str(e)})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")

@app.post("/api/think_aloud")
async def think_aloud(
    audio: UploadFile = File(...),
    problem_id: str = Form("two_sum")
):
    """
    Handles the Think Out Loud mode. Transcribes audio on a threadpool, maps it to the expected optimal solution
    for a specific DSA problem, and generates a structured grading rubric.
    """
    try:
        audio_bytes = await audio.read()
        transcription = await asyncio.to_thread(transcribe_audio_bytes, audio_bytes)
        
        if not transcription or transcription.startswith("Error"):
            return JSONResponse(status_code=500, content={"error": transcription or "Failed to transcribe audio"})
            
        problem = DSA_PROBLEMS.get(problem_id, DSA_PROBLEMS["two_sum"])
        
        system_prompt = THINK_ALOUD_SYSTEM_PROMPT.format(
            problem_name=problem["problem_name"],
            brute_force=problem["brute_force"],
            optimal_approach=problem["optimal_approach"],
            time_complexity=problem["time_complexity"],
            space_complexity=problem["space_complexity"]
        )
        
        context = f"The user verbalized the following thought process:\n{transcription}"
        response_data = generate_json_response(system_prompt, context)
        
        if "error" in response_data:
            return JSONResponse(status_code=500, content={"error": response_data["error"]})
            
        return {
            "transcription": transcription,
            "rubric": response_data.get("rubric", {}),
            "critique": response_data.get("critique", "No critique provided.")
        }
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.post("/api/visualize")
async def visualize_code(code: str = Form(...)):
    """
    Traces Python code execution step-by-step using a multiprocessing sandbox.
    """
    try:
        if len(code) > 20000:
            return JSONResponse(status_code=413, content={"error": "Payload too large. Maximum 20,000 characters for tracing."})
            
        result = await asyncio.to_thread(run_visualization_safe, code)
        
        if "error" in result:
            return JSONResponse(status_code=400, content={"error": result["error"]})
            
        return {"steps": result.get("steps", [])}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
