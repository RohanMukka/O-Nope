import ast
from io import StringIO
from pyflakes.api import check
from pyflakes.reporter import Reporter

def analyze_code(code_string: str):
    """
    Runs pyflakes and ast.parse on the given python code.
    Returns a list of error strings. If empty, the code is structurally sound.
    """
    errors = []
    
    # 1. Check for basic parse errors
    try:
        ast.parse(code_string)
    except SyntaxError as e:
        errors.append(f"SyntaxError at line {e.lineno}, offset {e.offset}: {e.msg}")
        return errors # If it doesn't parse, pyflakes will crash or complain anyway
        
    # 2. Run pyflakes for undefined names, unused imports, etc.
    warning_stream = StringIO()
    error_stream = StringIO()
    reporter = Reporter(warning_stream, error_stream)
    
    check(code_string, filename="user_code.py", reporter=reporter)
    
    if warning_stream.getvalue():
        errors.extend(warning_stream.getvalue().strip().split('\n'))
    if error_stream.getvalue():
        errors.extend(error_stream.getvalue().strip().split('\n'))
        
    return [err for err in errors if err]
