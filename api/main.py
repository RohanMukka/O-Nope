from fastapi import FastAPI, UploadFile, File, Form, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
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

from utils.llm import generate_json_response, query_llm
from utils.audio import generate_tts, transcribe_audio_bytes
from utils.ast_checker import analyze_code
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
    Handles the Code Roast logic. Runs deterministic static analysis via pyflakes and ast,
    then feeds the errors/logic constraints into the LLM with the specified intensity.
    """
    try:
        errors = analyze_code(code)
        
        # If there are syntax errors, specify them. Otherwise, ask LLM for logical roast.
        if not errors:
            error_str = "No syntax errors found. Critique the overall logical flow, edge cases, complexity, and pythonic style instead."
        else:
            error_str = ""
            for e in errors:
                error_str += f"- {e}\n"
            
        context = f"The user submitted this code:\n```python\n{code}\n```\n\n"
        system_prompt = CODE_ROAST_SYSTEM_PROMPT.format(intensity=intensity, syntax_errors=error_str)
        response_data = generate_json_response(system_prompt, context)
        
        if "error" in response_data:
            return JSONResponse(status_code=500, content={"error": response_data["error"]})
            
        roast_text = response_data.get("roast", "No roast generated.")
        
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
        audio_path = await generate_tts(roast_text, voice=voice, output_file=audio_file, rate=rate, pitch=pitch)
        
        return {
            "roast": roast_text, 
            "corrected_code": response_data.get("corrected_code", code),
            "errors": errors,
            "audio_url": f"/api/audio/{audio_file}" if audio_path else None
        }
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

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

def check_safety(code: str) -> bool:
    """
    Parses Python code and walks the AST. Blocks imports, dunder attributes (__),
    and dangerous built-ins to secure the tracing visualizer.
    """
    try:
        tree = ast.parse(code)
        for node in ast.walk(tree):
            if isinstance(node, (ast.Import, ast.ImportFrom)):
                return False
            if isinstance(node, ast.Attribute):
                if node.attr.startswith('__'):
                    return False
            if isinstance(node, ast.Name):
                if node.id in ['eval', 'exec', 'open', 'compile', 'input', 'globals', 'locals', 'vars', 'getattr', 'setattr', 'delattr', 'hasattr']:
                    return False
        return True
    except Exception:
        return False

@app.post("/api/visualize")
async def visualize_code(code: str = Form(...)):
    """
    Traces Python code execution step-by-step and returns the call stack,
    variables, and stdout at each step after passing AST safety checks.
    """
    try:
        if not check_safety(code):
            return JSONResponse(
                status_code=400,
                content={"error": "Security Block: Arbitrary imports, dangerous builtins (eval, exec, open), and double underscore attributes (__) are disabled."}
            )
            
        steps = []
        stdout_buffer = io.StringIO()
        
        def trace_lines(frame, event, arg):
            if event != 'line':
                return trace_lines
                
            co = frame.f_code
            filename = co.co_filename
            if filename != '<string>':
                return trace_lines
                
            if len(steps) >= 300:
                raise RuntimeError("Execution limit exceeded (maximum 300 steps)")
                
            line_no = frame.f_lineno
            
            # Capture stack frames
            stack = []
            curr_frame = frame
            while curr_frame:
                if curr_frame.f_code.co_filename == '<string>':
                    frame_locals = {}
                    for k, v in curr_frame.f_locals.items():
                        if k.startswith('__') or k == 'trace_lines':
                            continue
                        try:
                            # Verify JSON serializability
                            json.dumps(v)
                            frame_locals[k] = v
                        except:
                            frame_locals[k] = repr(v)
                    stack.append({
                        "name": curr_frame.f_code.co_name,
                        "line": curr_frame.f_lineno,
                        "variables": frame_locals
                    })
                curr_frame = curr_frame.f_back
                
            steps.append({
                "line": line_no,
                "stack": list(reversed(stack)),
                "output": stdout_buffer.getvalue()
            })
            return trace_lines

        original_stdout = sys.stdout
        sys.stdout = stdout_buffer
        
        loc = {}
        glob = {"__builtins__": __builtins__}
        
        try:
            sys.settrace(trace_lines)
            exec(code, glob, loc)
        except Exception as e:
            tb = sys.exc_info()[2]
            err_line = 1
            while tb:
                if tb.tb_frame.f_code.co_filename == '<string>':
                    err_line = tb.tb_lineno
                tb = tb.tb_next
                
            steps.append({
                "line": err_line,
                "stack": [{"name": "<error>", "line": err_line, "variables": {}}],
                "output": stdout_buffer.getvalue(),
                "error": f"{type(e).__name__}: {str(e)}"
            })
        finally:
            sys.settrace(None)
            sys.stdout = original_stdout
            
        return {"steps": steps}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
