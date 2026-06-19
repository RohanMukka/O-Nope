import os
import warnings

try:
    import whisper
    # Suppress FP16 warnings on CPU
    warnings.filterwarnings("ignore", message="FP16 is not supported on CPU; using FP32 instead")
    try:
        model = whisper.load_model("base")
    except Exception as e:
        print(f"Failed to load whisper model: {e}")
        model = None
except ImportError:
    print("Warning: whisper is not installed. Audio transcription will not work.")
    model = None

import tempfile

def transcribe_audio_bytes(audio_bytes: bytes) -> str:
    """
    Takes raw audio bytes, converts to a format Whisper understands,
    and returns the transcribed text.
    """
    if model is None:
        return "Error: Whisper model not loaded."
        
    # Use unique temp file per request
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_file:
        temp_file.write(audio_bytes)
        temp_filename = temp_file.name
        
    try:
        result = model.transcribe(temp_filename)
        return result["text"].strip()
    except Exception as e:
        return f"Error during transcription: {e}"
    finally:
        if os.path.exists(temp_filename):
            try:
                os.remove(temp_filename)
            except:
                pass

import asyncio
import edge_tts

async def generate_tts(text: str, voice: str = "en-US-AriaNeural", output_file: str = "temp_tts.mp3", rate: str = "+0%", pitch: str = "+0Hz"):
    """
    Generates an MP3 file using edge-tts asynchronously.
    """
    try:
        communicate = edge_tts.Communicate(text, voice, rate=rate, pitch=pitch)
        await communicate.save(output_file)
        return output_file
    except Exception as e:
        print(f"TTS Error: {e}")
        return None

