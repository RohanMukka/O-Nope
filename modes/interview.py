import streamlit as st
import json
import base64
import os
from utils.llm import generate_json_response
from utils.audio import generate_tts
from prompts.system_prompts import INTERVIEW_SYSTEM_PROMPT

CHARACTERS = {
    "Sarah": {
        "role": "Senior Engineer",
        "voice": "en-US-AriaNeural",
        "image": "assets/sarah.png"
    },
    "David": {
        "role": "Staff Engineer",
        "voice": "en-US-GuyNeural",
        "image": "assets/david.png"
    },
    "Marcus": {
        "role": "Tech Lead",
        "voice": "en-US-ChristopherNeural",
        "image": "assets/marcus.png"
    }
}

def render_interview_mode():
    st.header("Mode 1: Live Video Interview")
    st.markdown("Face a real tech interviewer. They will speak to you.")
    
    if "interview_history" not in st.session_state:
        st.session_state.interview_history = []
    if "interview_score" not in st.session_state:
        st.session_state.interview_score = 5
        
    char_name = st.selectbox("Select Your Interviewer", list(CHARACTERS.keys()))
    char_data = CHARACTERS[char_name]
    
    st.markdown(f"**Current Score:** {st.session_state.interview_score}/10")
    
    # Video Call Layout
    col1, col2 = st.columns([1, 2])
    
    with col1:
        # Display the avatar
        if os.path.exists(char_data["image"]):
            st.image(char_data["image"], use_container_width=True, caption=f"{char_name} - {char_data['role']}")
        else:
            st.warning(f"Avatar missing: {char_data['image']}")
            
        # Audio placeholder for autoplay
        audio_placeholder = st.empty()

    with col2:
        chat_container = st.container(height=400)
        with chat_container:
            for msg in st.session_state.interview_history:
                with st.chat_message(msg["role"]):
                    st.markdown(msg["content"])
                
        if prompt := st.chat_input("Your answer..."):
            with chat_container:
                with st.chat_message("user"):
                    st.markdown(prompt)
            st.session_state.interview_history.append({"role": "user", "content": prompt})
            
            context = "Here is the conversation history:\n"
            for msg in st.session_state.interview_history:
                context += f"{msg['role']}: {msg['content']}\n"
                
            system_prompt = INTERVIEW_SYSTEM_PROMPT.format(role=char_data["role"], score=st.session_state.interview_score)
            
            with st.spinner(f"{char_name} is thinking..."):
                response_data = generate_json_response(system_prompt, context)
                
                if "error" in response_data:
                    st.error("Error communicating with AI.")
                else:
                    score_change = response_data.get("score_change", 0)
                    ai_text = response_data.get("response_to_candidate", "")
                    tip = response_data.get("improvement_tip", "")
                    
                    st.session_state.interview_score = max(0, min(10, st.session_state.interview_score + score_change))
                    combined_response = f"{ai_text}\n\n**Tip:** {tip}"
                    
                    # Generate TTS
                    audio_file = generate_tts(ai_text, voice=char_data["voice"])
                    if audio_file and os.path.exists(audio_file):
                        # Play audio
                        with open(audio_file, "rb") as f:
                            audio_bytes = f.read()
                        audio_b64 = base64.b64encode(audio_bytes).decode()
                        # Use HTML audio tag for reliable autoplay
                        audio_html = f'<audio autoplay="true" src="data:audio/mp3;base64,{audio_b64}"></audio>'
                        audio_placeholder.markdown(audio_html, unsafe_allow_html=True)
                    
                    st.session_state.interview_history.append({"role": "assistant", "content": combined_response})
                    st.rerun()
