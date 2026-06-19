import streamlit as st
from streamlit_mic_recorder import mic_recorder
from utils.audio import transcribe_audio_bytes
from utils.llm import generate_json_response
from prompts.system_prompts import THINK_ALOUD_SYSTEM_PROMPT
import json

PROBLEMS = {
    "Two Sum": {
        "brute_force": "Nested loops checking every pair.",
        "optimal_approach": "Use a hash map to store seen values and their indices.",
        "time_complexity": "O(N)",
        "space_complexity": "O(N)"
    },
    "LRU Cache": {
        "brute_force": "Array or list with linear search and shift.",
        "optimal_approach": "Doubly linked list combined with a hash map.",
        "time_complexity": "O(1) for get and put",
        "space_complexity": "O(capacity)"
    }
}

def render_think_aloud_mode():
    st.header("Mode 2: Think Out Loud")
    st.markdown("Explain your algorithmic approach out loud. The Semantic Judge will grade you.")
    
    problem_name = st.selectbox("Select Problem", list(PROBLEMS.keys()))
    problem_data = PROBLEMS[problem_name]
    
    st.markdown("---")
    st.markdown("### Record your explanation")
    audio = mic_recorder(
        start_prompt="Start Recording",
        stop_prompt="Stop Recording",
        key='recorder',
        just_once=True
    )
    
    if audio:
        st.audio(audio['bytes'])
        
        with st.spinner("Transcribing your explanation..."):
            transcript = transcribe_audio_bytes(audio['bytes'])
            
        st.markdown("**Transcript:**")
        st.info(transcript)
        
        system_prompt = THINK_ALOUD_SYSTEM_PROMPT.format(
            problem_name=problem_name,
            **problem_data
        )
        
        with st.spinner("Semantic Judge is evaluating your logic..."):
            result = generate_json_response(system_prompt, transcript)
            
            if "error" in result:
                st.error(result["error"])
            else:
                st.markdown("### Grading Rubric")
                rubric = result.get("rubric", {})
                
                col1, col2 = st.columns(2)
                col1.metric("Identified Brute Force", "Yes" if rubric.get("identified_brute_force") else "No")
                col2.metric("Optimal Path", "Yes" if rubric.get("articulated_optimal_path") else "No")
                col1.metric("Time Complexity", "Yes" if rubric.get("correct_time_complexity") else "No")
                col2.metric("Space Complexity", "Yes" if rubric.get("correct_space_complexity") else "No")
                
                st.markdown("### Brutal Critique")
                st.warning(result.get("critique", "No critique provided."))
