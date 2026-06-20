import ast
import json
import sys
import io
import multiprocessing
from typing import Dict, Any

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
                if node.id in ['eval', 'exec', 'open', 'compile', 'input', 'globals', 'locals', 'vars', 'getattr', 'setattr', 'delattr', 'hasattr', 'os', 'sys', 'subprocess']:
                    return False
        return True
    except Exception:
        return False

def _run_visualization_worker(code: str, result_queue: multiprocessing.Queue):
    """
    Worker function to trace Python code execution step-by-step.
    """
    try:
        if not check_safety(code):
            result_queue.put({"error": "Security Block: Arbitrary imports, dangerous builtins (eval, exec, open), and double underscore attributes (__) are disabled."})
            return

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
        
        glob = {"__builtins__": __builtins__}
        
        try:
            sys.settrace(trace_lines)
            exec(code, glob)
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
            
        result_queue.put({"steps": steps})
    except Exception as e:
        result_queue.put({"error": str(e)})

def run_visualization_safe(code: str, timeout: float = 1.5) -> Dict[str, Any]:
    """
    Runs visualization in a separate process with a strict timeout to prevent
    infinite loops and memory exhaustion attacks from blocking the main event loop.
    """
    queue = multiprocessing.Queue()
    process = multiprocessing.Process(target=_run_visualization_worker, args=(code, queue))
    
    process.start()
    
    try:
        import queue as q
        result = queue.get(timeout=timeout)
        process.join(1)
        return result
    except q.Empty:
        if process.is_alive():
            process.terminate()
            process.join()
        return {"error": "Execution timed out (infinite loop or memory exhaustion detected)."}
