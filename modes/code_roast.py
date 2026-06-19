import streamlit as st
from utils.ast_checker import analyze_code
from utils.llm import generate_json_response
from prompts.system_prompts import CODE_ROAST_SYSTEM_PROMPT

def render_code_roast_mode():
    st.header("Mode 3: The Code Roast")
    st.markdown("Paste your broken Python code. We'll catch the syntax errors and roast you for them.")
    
    intensity = st.select_slider("Select Roast Intensity", ["Constructive", "Brutal", "Demeaning"], value="Brutal")
    
    code_input = st.text_area("Your Python Code", height=300, placeholder="def buggy_code():\nprint('missing indent')")
    
    if st.button("Roast Me"):
        if not code_input.strip():
            st.error("Please enter some code.")
            return
            
        with st.spinner("Running deterministic static analysis..."):
            errors = analyze_code(code_input)
            
        if not errors:
            st.success("Wow, no syntax errors. You might actually be a decent programmer.")
            errors_text = "None. The code is syntactically sound. Roast their logic instead."
        else:
            st.error("Static Analysis found errors:")
            for err in errors:
                st.write(f"- {err}")
            errors_text = "\n".join(errors)
            
        system_prompt = CODE_ROAST_SYSTEM_PROMPT.format(syntax_errors=errors_text, intensity=intensity)
        
        with st.spinner("Generating your roast..."):
            result = generate_json_response(system_prompt, code_input)
            
            if "error" in result:
                st.error("Failed to generate roast.")
            else:
                st.markdown("### The Roast")
                st.error(result.get("roast", ""))
                
                st.markdown("### The Fix")
                st.code(result.get("corrected_code", ""), language="python")
