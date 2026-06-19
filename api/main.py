from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
import uvicorn
import os
import json
import uuid
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utils.llm import generate_json_response, query_llm
from utils.audio import generate_tts
from utils.ast_checker import analyze_code
from prompts.system_prompts import INTERVIEW_SYSTEM_PROMPT, CODE_ROAST_SYSTEM_PROMPT

app = FastAPI(title="O(Nope) API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/assets", StaticFiles(directory="assets"), name="assets")

@app.get("/")
def read_root():
    return {"status": "ok"}

@app.post("/api/interview")
async def interview(
    role: str = Form(...),
    score: int = Form(...),
    history: str = Form(...),
    user_message: str = Form(...)
):
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
    audio_path = generate_tts(ai_text, voice=voice, output_file=audio_file)
    
    return {
        "score": new_score,
        "ai_text": ai_text,
        "tip": tip,
        "audio_url": f"/api/audio/{audio_file}" if audio_path else None
    }

@app.get("/api/audio/{filename}")
def get_audio(filename: str):
    if os.path.exists(filename):
        return FileResponse(filename, media_type="audio/mpeg")
    return JSONResponse(status_code=404, content={"error": "File not found"})

@app.post("/api/roast")
async def roast_code(code: str = Form(...)):
    errors = analyze_code(code)
    
    if not errors:
        return {"roast": "Wait... this actually passed the static analysis. I have nothing to roast. Good job, I guess.", "errors": []}
        
    context = f"The user submitted this code:\n```python\n{code}\n```\n\nThe static analyzer found these exact syntax errors:\n"
    for e in errors:
        context += f"- {e}\n"
        
    roast_text = query_llm(CODE_ROAST_SYSTEM_PROMPT, context)
    return {"roast": roast_text, "errors": errors}

from utils.audio import transcribe_audio_bytes
from prompts.system_prompts import THINK_ALOUD_SYSTEM_PROMPT

@app.post("/api/think_aloud")
async def think_aloud(audio: UploadFile = File(...)):
    audio_bytes = await audio.read()
    transcription = transcribe_audio_bytes(audio_bytes)
    
    if not transcription or transcription.startswith("Error"):
        return JSONResponse(status_code=500, content={"error": transcription or "Failed to transcribe audio"})
        
    return {"transcription": transcription}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
