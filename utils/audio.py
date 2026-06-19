import os
import whisper
import warnings

# Suppress FP16 warnings on CPU
warnings.filterwarnings("ignore", message="FP16 is not supported on CPU; using FP32 instead")

# Load model globally to avoid reloading on every transcription
# Using base to ensure it runs fast on CPU
try:
    model = whisper.load_model("base")
except Exception as e:
    print(f"Failed to load whisper model: {e}")
    model = None

def transcribe_audio_bytes(audio_bytes: bytes) -> str:
    """
    Takes raw audio bytes, converts to a format Whisper understands,
    and returns the transcribed text.
    """
    if model is None:
        return "Error: Whisper model not loaded."
        
    temp_filename = "temp_audio.wav"
    with open(temp_filename, "wb") as f:
        f.write(audio_bytes)
        
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

async def _generate_tts_async(text, voice, output_file):
    communicate = edge_tts.Communicate(text, voice)
    await communicate.save(output_file)

def generate_tts(text: str, voice: str = "en-US-AriaNeural", output_file: str = "temp_tts.mp3"):
    """
    Generates an MP3 file using edge-tts.
    """
    try:
        asyncio.run(_generate_tts_async(text, voice, output_file))
        return output_file
    except Exception as e:
        print(f"TTS Error: {e}")
        return None
