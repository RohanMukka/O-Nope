import { useState, useRef, useEffect } from 'react'
import { Mic, Send } from 'lucide-react'

const CHARACTERS = [
  { name: 'Sarah', role: 'Senior Engineer', image: '/assets/sarah.png' },
  { name: 'David', role: 'Staff Engineer', image: '/assets/david.png' },
  { name: 'Marcus', role: 'Tech Lead', image: '/assets/marcus.png' }
]

export default function InterviewMode() {
  const [character, setCharacter] = useState(CHARACTERS[0])
  const [score, setScore] = useState(5)
  const [history, setHistory] = useState<any[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [scaleY, setScaleY] = useState(1)
  const [inputText, setInputText] = useState('')
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyzerRef = useRef<AnalyserNode | null>(null)
  const animationRef = useRef<number | null>(null)
  const activeAudioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    return () => {
      // Clean up active playing audio
      if (activeAudioRef.current) {
        activeAudioRef.current.pause()
        activeAudioRef.current.src = ""
      }
      // Cancel lip sync animation frames
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      // Stop all active microphone tracks
      if (mediaRecorderRef.current && mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [])


  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      mediaRecorderRef.current = recorder
      audioChunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data)
      }

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        await processAudio(audioBlob)
      }

      recorder.start()
      setIsRecording(true)
    } catch (err) {
      console.error("Microphone access denied", err)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
    }
  }

  const sendChatMessage = async (userText: string) => {
    setLoading(true)
    try {
      // Send to Interview LLM
      const chatFormData = new FormData()
      chatFormData.append('role', character.role)
      chatFormData.append('score', score.toString())
      chatFormData.append('history', JSON.stringify(history))
      chatFormData.append('user_message', userText)
      
      const chatRes = await fetch('http://localhost:8000/api/interview', {
        method: 'POST',
        body: chatFormData
      })
      const chatData = await chatRes.json()
      
      setScore(chatData.score)
      const newHistory = [
        ...history, 
        { role: 'user', content: userText },
        { role: 'assistant', content: chatData.ai_text + "\n\nTip: " + chatData.tip }
      ]
      setHistory(newHistory)
      
      // Play TTS Audio and animate avatar
      if (chatData.audio_url) {
        playAudioWithLipSync('http://localhost:8000' + chatData.audio_url)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const processAudio = async (blob: Blob) => {
    setLoading(true)
    
    // 1. Transcribe audio using backend
    const formData = new FormData()
    formData.append('audio', blob, 'recording.wav')
    
    try {
      const transcribeRes = await fetch('http://localhost:8000/api/think_aloud', {
        method: 'POST',
        body: formData
      })
      const transcribeData = await transcribeRes.json()
      const userText = transcribeData.transcription
      
      if (!userText) throw new Error("Transcription failed")
      
      await sendChatMessage(userText)
    } catch (err) {
      console.error(err)
      setLoading(false)
    }
  }

  const handleSendText = async () => {
    if (!inputText.trim() || loading || isRecording) return
    const text = inputText.trim()
    setInputText('')
    await sendChatMessage(text)
  }

  const playAudioWithLipSync = async (url: string) => {
    const audio = new Audio(url)
    audio.crossOrigin = "anonymous"
    activeAudioRef.current = audio

    
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    const ctx = audioContextRef.current
    
    const source = ctx.createMediaElementSource(audio)
    const analyzer = ctx.createAnalyser()
    analyzer.fftSize = 256
    source.connect(analyzer)
    analyzer.connect(ctx.destination)
    analyzerRef.current = analyzer
    
    audio.onplay = () => {
      setIsSpeaking(true)
      animateLipSync()
    }
    
    audio.onended = () => {
      setIsSpeaking(false)
      setScaleY(1)
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
    
    await audio.play()
  }

  const animateLipSync = () => {
    if (!analyzerRef.current) return
    const dataArray = new Uint8Array(analyzerRef.current.frequencyBinCount)
    analyzerRef.current.getByteFrequencyData(dataArray)
    
    let sum = 0
    for(let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i]
    }
    const average = sum / dataArray.length
    
    // Scale slightly based on volume to simulate talking/breathing
    const newScale = 1 + (average / 255) * 0.05
    setScaleY(newScale)
    
    if (isSpeaking) {
      animationRef.current = requestAnimationFrame(animateLipSync)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h2 style={{ marginBottom: '0.2rem' }}>Live Video Interview</h2>
          <p style={{ color: '#94a3b8' }}>Speak to your interviewer.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <select 
            value={character.name} 
            onChange={(e) => setCharacter(CHARACTERS.find(c => c.name === e.target.value)!)}
            style={{ width: '200px' }}
          >
            {CHARACTERS.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
          </select>
          <div className="glass-panel" style={{ padding: '0.5rem 1rem', color: '#eab308', fontWeight: 'bold' }}>
            Score: {score}/10
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '2rem', flex: 1, overflow: 'hidden' }}>
        {/* Left: Avatar Video Frame */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="glass-panel" style={{ 
            flex: 1, 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            overflow: 'hidden',
            position: 'relative'
          }}>
            <img 
              src={`http://localhost:8000${character.image}`} 
              alt={character.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transform: `scaleY(${scaleY})`,
                transformOrigin: 'bottom',
                transition: 'transform 0.05s ease-out',
                filter: isSpeaking ? 'brightness(1.1)' : 'none'
              }}
            />
            {loading && (
              <div style={{ position: 'absolute', background: 'rgba(0,0,0,0.5)', padding: '1rem', borderRadius: '8px' }}>
                {character.name} is thinking...
              </div>
            )}
          </div>
          
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'stretch' }}>
            <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
              <input
                type="text"
                placeholder={isRecording ? "Recording audio..." : "Type your answer and press Enter..."}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={isRecording || loading}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSendText()
                  }
                }}
                style={{
                  flex: 1,
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '8px',
                  color: 'white',
                  padding: '0.8rem',
                  paddingRight: isRecording ? '3.5rem' : '0.8rem',
                  fontSize: '14px',
                  outline: 'none',
                  width: '100%'
                }}
              />
              {isRecording && (
                <div style={{ position: 'absolute', right: '1rem', pointerEvents: 'none' }}>
                  <div className="sound-wave">
                    <div className="sound-wave-bar"></div>
                    <div className="sound-wave-bar"></div>
                    <div className="sound-wave-bar"></div>
                    <div className="sound-wave-bar"></div>
                    <div className="sound-wave-bar"></div>
                  </div>
                </div>
              )}
            </div>
            
            <button
              onClick={handleSendText}
              disabled={!inputText.trim() || loading || isRecording}
              className="btn-primary"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.8rem 1.2rem',
                opacity: !inputText.trim() || loading || isRecording ? 0.5 : 1,
                cursor: !inputText.trim() || loading || isRecording ? 'not-allowed' : 'pointer'
              }}
            >
              <Send size={18} />
            </button>

            <button 
              onClick={isRecording ? stopRecording : startRecording}
              className="btn-primary"
              disabled={loading}
              style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                padding: '0.8rem 1.2rem',
                background: isRecording ? '#ef4444' : undefined,
                boxShadow: isRecording ? '0 0 15px rgba(239, 68, 68, 0.5)' : undefined
              }}
            >
              <Mic size={18} />
              <span style={{ marginLeft: '0.3rem' }}>{isRecording ? 'Stop' : 'Speak'}</span>
            </button>
          </div>
        </div>

        {/* Right: Transcript */}
        <div className="glass-panel" style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>Transcript</h3>
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {history.map((msg, i) => (
              <div key={i} style={{ 
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                background: msg.role === 'user' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255,255,255,0.05)',
                padding: '1rem',
                borderRadius: '12px',
                maxWidth: '80%'
              }}>
                <strong style={{ display: 'block', marginBottom: '0.3rem', color: msg.role === 'user' ? '#38bdf8' : '#eab308' }}>
                  {msg.role === 'user' ? 'You' : character.name}
                </strong>
                <span style={{ whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>{msg.content}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
