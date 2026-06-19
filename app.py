import streamlit as st

st.set_page_config(
    page_title="O(Nope) - Your Brutally Honest Coding Coach",
    page_icon="🔥",
    layout="wide",
    initial_sidebar_state="expanded",
)

# Inject advanced custom CSS for Glassmorphism
st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
    
    html, body, [class*="css"] {
        font-family: 'Inter', sans-serif;
    }
    
    .stApp {
        background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
        color: #e2e8f0;
    }
    
    .stSidebar {
        background: rgba(15, 23, 42, 0.6) !important;
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border-right: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    h1, h2, h3 {
        color: #38bdf8 !important;
        font-weight: 800;
        letter-spacing: -0.02em;
    }
    
    /* Glassmorphism containers */
    div[data-testid="stChatMessage"] {
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 12px;
        padding: 1rem;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        backdrop-filter: blur(8px);
    }
    
    .stButton>button {
        background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        color: white;
        border: none;
        border-radius: 8px;
        padding: 0.6rem 1.2rem;
        font-weight: 600;
        transition: all 0.2s ease;
        box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.3);
    }
    
    .stButton>button:hover {
        transform: translateY(-1px);
        box-shadow: 0 6px 8px -1px rgba(59, 130, 246, 0.4);
    }
    
    .stSelectbox > div > div {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 8px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: white;
    }
    
    .stTextInput > div > div > input {
        background: rgba(255, 255, 255, 0.05);
        color: white;
        border-radius: 8px;
        border: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .stTextArea > div > div > textarea {
        background: rgba(0, 0, 0, 0.2) !important;
        color: #e2e8f0 !important;
        border: 1px solid rgba(255, 255, 255, 0.1) !important;
        border-radius: 8px;
        font-family: 'Courier New', Courier, monospace;
    }
</style>
""", unsafe_allow_html=True)

st.sidebar.title("O(Nope) 🔥")
st.sidebar.markdown("Your brutally honest coding coach.")

mode = st.sidebar.radio(
    "Select Mode",
    ["Interview Simulator", "Think Out Loud", "The Code Roast", "Python Visualizer"]
)

if mode == "Interview Simulator":
    from modes.interview import render_interview_mode
    render_interview_mode()
elif mode == "Think Out Loud":
    from modes.think_aloud import render_think_aloud_mode
    render_think_aloud_mode()
elif mode == "The Code Roast":
    from modes.code_roast import render_code_roast_mode
    render_code_roast_mode()
elif mode == "Python Visualizer":
    from modes.visualizer import render_visualizer_mode
    render_visualizer_mode()
