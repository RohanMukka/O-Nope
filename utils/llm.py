import os
from groq import Groq
import json
from dotenv import load_dotenv

load_dotenv()

def get_groq_client():
    """
    Initializes and returns the Groq API client.
    
    Raises:
        ValueError: If GROQ_API_KEY is not found in the environment variables.
    """
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY is not set in the environment.")
    return Groq(api_key=api_key)

def generate_json_response(system_prompt: str, user_prompt: str, model: str = "llama-3.3-70b-versatile"):
    """
    Queries the Groq API and forces the output to be a valid JSON object.
    
    Args:
        system_prompt (str): The system prompt defining the AI's persona and JSON schema.
        user_prompt (str): The user input.
        model (str): The Groq model to use. Defaults to LLaMA-3.3-70B.
        
    Returns:
        dict: The parsed JSON response, or a dictionary containing an 'error' key if it fails.
    """
    client = get_groq_client()
    try:
        completion = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.3,
            max_tokens=2048,
            response_format={"type": "json_object"}
        )
        response_text = completion.choices[0].message.content
        return json.loads(response_text)
    except Exception as e:
        print(f"Error calling Groq API: {e}")
        return {"error": str(e)}

def query_llm(system_prompt: str, user_prompt: str, model: str = "llama-3.3-70b-versatile"):
    """
    Queries the Groq API for a standard text response.
    
    Args:
        system_prompt (str): The system prompt defining the AI's persona.
        user_prompt (str): The user input.
        model (str): The Groq model to use. Defaults to LLaMA-3.3-70B.
        
    Returns:
        str: The generated text response, or an error string if it fails.
    """
    client = get_groq_client()
    try:
        completion = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.7,
            max_tokens=2048
        )
        return completion.choices[0].message.content
    except Exception as e:
        print(f"Error calling Groq API: {e}")
        return str(e)
