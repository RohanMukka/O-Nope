import os
from groq import AsyncGroq
import tempfile
import asyncio
import edge_tts

async def transcribe_audio_bytes(audio_bytes: bytes) -> str:
    """
    Takes raw audio bytes, converts to a format Whisper understands,
    and returns the transcribed text.
    """
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_file:
        temp_file.write(audio_bytes)
        temp_filename = temp_file.name
        
    try:
        client = AsyncGroq(api_key=os.getenv("GROQ_API_KEY"))
        with open(temp_filename, "rb") as file:
            transcription = await client.audio.transcriptions.create(
              file=(os.path.basename(temp_filename), file.read()),
              model="whisper-large-v3",
              response_format="json",
            )
        return transcription.text.strip()
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

