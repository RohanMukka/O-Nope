import sys
import json

class PythonTracer:
    def __init__(self, code_string):
        self.code_string = code_string
        self.snapshots = []
        self.max_steps = 1000  # safeguard against infinite loops

    def _serialize_value(self, val):
        """Attempts to serialize a value to something JSON compatible or a string representation."""
        if isinstance(val, (int, float, str, bool, type(None))):
            return val
        if isinstance(val, list):
            return [self._serialize_value(item) for item in val]
        if isinstance(val, dict):
            return {str(k): self._serialize_value(v) for k, v in val.items()}
        
        if hasattr(val, '__dict__'):
            obj_dict = {}
            for k, v in val.__dict__.items():
                if not k.startswith('_'):
                    if isinstance(v, (int, float, str, bool, type(None))):
                        obj_dict[k] = v
                    else:
                        obj_dict[k] = f"<{type(v).__name__}>"
            return obj_dict

        return str(val)

    def trace_lines(self, frame, event, arg):
        if event != 'line':
            return self.trace_lines
            
        if len(self.snapshots) >= self.max_steps:
            return None # Stop tracing
            
        variables = {}
        for k, v in frame.f_locals.items():
            if not k.startswith('__') and not str(type(v)).startswith("<class 'module") and not str(type(v)).startswith("<class 'function"):
                try:
                    variables[k] = self._serialize_value(v)
                except Exception:
                    variables[k] = str(v)
                    
        self.snapshots.append({
            "line": frame.f_lineno,
            "variables": variables
        })
        return self.trace_lines

    def trace_calls(self, frame, event, arg):
        if event == 'call':
            if frame.f_code.co_filename == '<string>':
                return self.trace_lines
        return None

    def run(self):
        try:
            compiled = compile(self.code_string, '<string>', 'exec')
        except SyntaxError as e:
            return [{"error": f"SyntaxError: {e}"}]

        namespace = {}
        old_trace = sys.gettrace()
        sys.settrace(self.trace_calls)
        
        try:
            exec(compiled, namespace, namespace)
        except Exception as e:
            self.snapshots.append({"error": f"RuntimeError: {e}"})
        finally:
            sys.settrace(old_trace)
            
        return self.snapshots

def generate_trace(code: str):
    tracer = PythonTracer(code)
    return tracer.run()
