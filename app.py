import streamlit as st

st.set_page_config(
    page_title="O(Nope) - Your Brutally Honest Coding Coach",
    page_icon="🔥",
    layout="wide",
    initial_sidebar_state="expanded",
)

# Inject custom CSS
st.markdown("""
<style>
    /* Hacker-centric dark theme */
    .stApp {
        background-color: #0d1117;
        color: #c9d1d9;
    }
    .stSidebar {
        background-color: #161b22;
    }
    h1, h2, h3 {
        color: #58a6ff !important;
    }
    .stButton>button {
        background-color: #238636;
        color: white;
        border: none;
        border-radius: 6px;
        padding: 0.5rem 1rem;
        font-weight: 600;
    }
    .stButton>button:hover {
        background-color: #2ea043;
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
