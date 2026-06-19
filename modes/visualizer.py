import streamlit as st
import urllib.parse

def render_visualizer_mode():
    st.header("Mode 4: Python Visualizer")
    st.markdown("Visualize your Python code execution step-by-step using PythonTutor.")
    
    code_input = st.text_area("Your Python Code", height=300, value="def fib(n):\n    if n<=1: return n\n    return fib(n-1) + fib(n-2)\n\nfib(4)")
    
    if st.button("Visualize"):
        if not code_input.strip():
            st.warning("Please enter some code.")
            return
            
        # URL encode the code
        encoded_code = urllib.parse.quote(code_input)
        
        # Build the iframe URL
        url = f"https://pythontutor.com/iframe-embed.html#code={encoded_code}&cumulative=false&py=3&curInstr=0"
        
        # Display the iframe using HTML
        iframe_html = f"""
        <iframe 
            width="100%" 
            height="800" 
            frameborder="0" 
            src="{url}">
        </iframe>
        """
        
        st.markdown("### Execution Trace")
        st.components.v1.html(iframe_html, height=800, scrolling=True)
