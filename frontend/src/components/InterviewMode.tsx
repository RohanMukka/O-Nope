import { useState, useRef, useEffect } from 'react'
import { Mic, Send, Video } from 'lucide-react'
import { motion } from 'framer-motion'
import { useGlobalState } from '../GlobalState'

const CHARACTERS = [
  { name: 'Sarah', role: 'Senior Engineer' },
  { name: 'David', role: 'Staff Engineer' },
  { name: 'Marcus', role: 'Tech Lead' }
]

export default function InterviewMode() {
  const [character, setCharacter] = useState(CHARACTERS[0])
  const [targetRole, setTargetRole] = useState('Software Engineer')
  const [experience, setExperience] = useState('Entry Level')
  const [score, setScore] = useState(5)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [history, setHistory] = useState<any[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [scaleY, setScaleY] = useState(1)
  const [inputText, setInputText] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const { logTrauma } = useGlobalState()
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyzerRef = useRef<AnalyserNode | null>(null)
  const animationRef = useRef<number | null>(null)
  const activeAudioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    return () => {
      if (activeAudioRef.current) {
        activeAudioRef.current.pause()
        activeAudioRef.current.src = ""
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
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
      const chatFormData = new FormData()
      chatFormData.append('character_name', character.name)
      chatFormData.append('target_role', targetRole)
      chatFormData.append('experience', experience)
      chatFormData.append('score', score.toString())
      chatFormData.append('history', JSON.stringify(history))
      chatFormData.append('user_message', userText)
      
      const chatRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/interview`, {
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
      
      const scoreDiff = chatData.score - score
      if (scoreDiff !== 0) {
        logTrauma('Live Interview', `Grilled by ${character.name} (${targetRole}).`, scoreDiff)
      }
      
      if (chatData.audio_url) {
        playAudioWithLipSync((import.meta.env.VITE_API_URL || 'http://localhost:8000') + chatData.audio_url)
      }
    } catch (err) {
      console.error(err)
      setErrorMsg("Failed to communicate with AI.")
      // restore text if failed
      setInputText(userText)
    } finally {
      setLoading(false)
    }
  }

  const processAudio = async (blob: Blob) => {
    setLoading(true)
    const formData = new FormData()
    formData.append('audio', blob, 'recording.wav')
    
    try {
      const transcribeRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/think_aloud`, {
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

  const handleSendText = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault()
    if (!inputText.trim() || loading || isRecording) return
    const text = inputText.trim()
    setInputText('')
    setErrorMsg('')
    await sendChatMessage(text)
  }

  const playAudioWithLipSync = async (url: string) => {
    const audio = new Audio(url)
    audio.crossOrigin = "anonymous"
    activeAudioRef.current = audio

    if (!audioContextRef.current) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    
    // Scale based on volume for orb pulsing
    const newScale = 1 + (average / 255) * 0.5
    setScaleY(newScale)
    
    if (isSpeaking) {
      animationRef.current = requestAnimationFrame(animateLipSync)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h2 className="glitch-text" data-text="LIVE INTERVIEW" style={{ marginBottom: '0.2rem', color: 'var(--text-accent)', display: 'flex', alignItems: 'center', gap: '0.5rem', textTransform: 'uppercase', fontWeight: 900 }}>
            <Video size={24} /> LIVE INTERVIEW
          </h2>
          <p style={{ color: '#888', fontStyle: 'italic', fontWeight: 700 }}>Defend your technical decisions.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#666', textTransform: 'uppercase' }}>Interviewer:</span>
            <select 
              value={character.name} 
              onChange={(e) => setCharacter(CHARACTERS.find(c => c.name === e.target.value)!)}
              style={{ width: '200px', border: '1px solid var(--text-accent)' }}
            >
              {CHARACTERS.map(c => <option key={c.name} value={c.name}>{c.name} - {c.role}</option>)}
            </select>
          </div>
          
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#666', textTransform: 'uppercase' }}>Target:</span>
            <select value={targetRole} onChange={(e) => setTargetRole(e.target.value)} style={{ width: '160px', border: '1px solid #333' }}>
              <option value="Software Engineer">Software Engineer</option>
              <option value="Data Scientist">Data Scientist</option>
              <option value="AI/ML Engineer">AI/ML Engineer</option>
              <option value="DevOps">DevOps</option>
            </select>
            <select value={experience} onChange={(e) => setExperience(e.target.value)} style={{ width: '140px', border: '1px solid #333' }}>
              <option value="Entry Level">Entry Level</option>
              <option value="Mid-Level">Mid-Level</option>
              <option value="Senior">Senior</option>
            </select>
          </div>
          <div className="glass-panel" style={{ padding: '0.5rem 1rem', color: 'var(--text-warning)', fontWeight: 'bold', border: '2px solid var(--text-warning)', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <span style={{ fontFamily: 'Space Mono, monospace', fontSize: '1.1rem', letterSpacing: '-2px' }}>
              {'█'.repeat(score)}{'░'.repeat(10 - score)}
            </span>
            <span>SURVIVAL PROBABILITY: {score * 10}%</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '2rem', flex: 1, overflow: 'hidden' }}>
        {/* Left: Avatar / Orb Frame */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '350px' }}>
          <div className="glass-panel" style={{ 
            flex: 1, 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            overflow: 'hidden',
            position: 'relative',
            background: '#0a0a0a',
            border: '1px solid var(--text-accent)'
          }}>
            <div style={{ position: 'absolute', top: 10, left: 10, color: 'var(--text-accent)', fontSize: '0.8rem', fontWeight: 'bold' }}>
              REC [•]
            </div>

            {/* Pulsing AI Core (Scary) */}
            <motion.div 
              style={{
                width: '140px',
                height: '140px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, #fff 0%, var(--danger-color) 30%, #500 70%, #000 100%)',
                boxShadow: '0 0 80px var(--danger-color), inset 0 0 40px #000',
                border: '4px solid var(--danger-color)',
                position: 'relative'
              }}
              animate={{ 
                scale: isSpeaking ? scaleY : [1, 1.05, 1],
                opacity: isSpeaking ? 1 : [0.8, 1, 0.8],
                filter: isSpeaking ? ['brightness(1)', 'brightness(1.5)', 'brightness(1)'] : 'brightness(1)',
                boxShadow: isSpeaking ? '0 0 120px var(--danger-color), inset 0 0 40px #000' : '0 0 80px var(--danger-color), inset 0 0 40px #000'
              }}
              transition={isSpeaking ? { type: 'spring', damping: 10, stiffness: 100 } : { repeat: Infinity, duration: 2 }}
            >
              <motion.div 
                style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '50%', 
                  background: '#fff', 
                  position: 'absolute', 
                  top: '50%', 
                  left: '50%', 
                  marginTop: '-20px',
                  marginLeft: '-20px',
                  boxShadow: '0 0 30px #fff' 
                }}
                animate={{ scale: isSpeaking ? [1, 1.8, 1] : 1 }}
                transition={{ repeat: Infinity, duration: 0.1 }}
              />
            </motion.div>
            
            {loading && (
              <div style={{ position: 'absolute', bottom: 20, background: '#000', padding: '0.5rem 1rem', border: '1px solid var(--text-accent)', color: 'var(--text-accent)' }}>
                {character.name.toUpperCase()} IS EVALUATING YOUR INCOMPETENCE...
              </div>
            )}
          </div>
          
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'stretch' }}>
            <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
              <input
                type="text"
                placeholder={isRecording ? "RECORDING AUDIO..." : "TYPE YOUR PATHETIC DEFENSE AND PRESS ENTER..."}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={isRecording || loading}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendText()
                }}
                style={{
                  flex: 1,
                  background: '#000',
                  border: '2px solid var(--text-accent)',
                  color: 'white',
                  padding: '0.8rem',
                  paddingRight: isRecording ? '3.5rem' : '0.8rem',
                  fontSize: '14px',
                  outline: 'none',
                  width: '100%',
                  textTransform: 'uppercase'
                }}
              />
              {errorMsg && (
                <div style={{ position: 'absolute', top: '-25px', left: 0, color: 'var(--danger-color)', fontSize: '0.75rem', fontWeight: 'bold' }}>
                  {errorMsg}
                </div>
              )}
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
              type="button"
              onClick={handleSendText}
              disabled={!inputText.trim() || loading || isRecording}
              className="cyber-button"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.8rem 1.2rem',
                opacity: (!inputText.trim() || loading || isRecording) ? 0.5 : 1,
                border: '1px solid var(--text-warning)',
                color: 'var(--text-warning)'
              }}
            >
              <Send size={18} style={{ pointerEvents: 'none' }} />
            </button>

            <button 
              onClick={isRecording ? stopRecording : startRecording}
              className="cyber-button"
              disabled={loading}
              style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                padding: '0.8rem 1.2rem',
                background: isRecording ? 'var(--text-accent)' : 'transparent',
                color: isRecording ? '#000' : 'var(--text-accent)'
              }}
            >
              <Mic size={18} />
              <span style={{ marginLeft: '0.3rem' }}>{isRecording ? 'HALT' : 'SPEAK'}</span>
            </button>
          </div>
        </div>

        {/* Right: Transcript */}
        <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div className="terminal-header">
            <div className="mac-btn mac-close"></div>
            <div className="mac-btn mac-min"></div>
            <div className="mac-btn mac-max"></div>
            <span className="font-mono" style={{ marginLeft: '1rem', color: 'var(--text-success)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 900 }}>interview_log.sh</span>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.5rem', background: '#050505', border: '1px solid #111' }}>
            {history.length === 0 ? (
              <div className="font-mono" style={{ color: '#555', fontSize: '0.85rem' }}>
                <p>&gt; SYSTEM INITIALIZED.</p>
                <p>&gt; CALIBRATING CONDESCENSION PROTOCOLS...</p>
                <p>&gt; LOADING ARCHIVED INTERVIEW QUESTIONS...</p>
                <br/>
                <p className="glitch-text" data-text={`${character.name.toUpperCase()} IS READY TO JUDGE YOU.`} style={{ color: 'var(--danger-color)', fontWeight: 'bold' }}>{character.name.toUpperCase()} IS READY TO JUDGE YOU.</p>
                <span className="blink">_</span>
              </div>
            ) : (
              history.map((msg, i) => (
                <div key={i} style={{ 
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  background: msg.role === 'user' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 0, 60, 0.1)',
                  borderLeft: msg.role === 'user' ? 'none' : '4px solid var(--danger-color)',
                  borderRight: msg.role === 'user' ? '4px solid #888' : 'none',
                  padding: '1rem',
                  maxWidth: '85%',
                  borderRadius: '0',
                  boxShadow: msg.role === 'user' ? 'none' : 'inset 0 0 10px rgba(255,0,60,0.1)'
                }}>
                  <strong style={{ display: 'block', marginBottom: '0.4rem', color: msg.role === 'user' ? '#aaa' : 'var(--danger-color)', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.05em', fontWeight: 900 }}>
                    {msg.role === 'user' ? 'SUBJECT' : character.name.toUpperCase()}
                  </strong>
                  <span className={msg.role === 'user' ? '' : 'font-mono'} style={{ whiteSpace: 'pre-wrap', lineHeight: '1.5', fontSize: msg.role === 'user' ? '0.95rem' : '0.85rem', color: msg.role === 'user' ? '#fff' : '#ddd' }}>{msg.content}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
