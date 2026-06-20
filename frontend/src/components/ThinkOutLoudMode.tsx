import { useState, useRef, useEffect } from 'react'
import { Mic, MessageSquare, Loader2, CheckSquare, XSquare } from 'lucide-react'
import { motion } from 'framer-motion'
import { useGlobalState } from '../GlobalState'

const PROBLEMS = [
  { id: 'two_sum', name: 'Two Sum' },
  { id: 'lru_cache', name: 'LRU Cache' },
  { id: 'binary_search', name: 'Binary Search' },
  { id: 'custom', name: 'Custom Problem...' }
]

export default function ThinkOutLoudMode() {
  const [problemId, setProblemId] = useState(PROBLEMS[0].id)
  const [customProblem, setCustomProblem] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [loading, setLoading] = useState(false)
  const [transcription, setTranscription] = useState('')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [rubric, setRubric] = useState<any>(null)
  const [critique, setCritique] = useState('')
  const [error, setError] = useState('')
  const { logTrauma } = useGlobalState()

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioContextRef = useRef<AudioContext | null>(null)
  const silenceTimerRef = useRef<number | null>(null)
  const isStoppingRef = useRef(false)

  useEffect(() => {
    return () => {
      if (silenceTimerRef.current !== null) window.clearTimeout(silenceTimerRef.current)
      if (audioContextRef.current) audioContextRef.current.close()
      if (mediaRecorderRef.current && mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  const startRecording = async () => {
    try {
      setError('')
      setTranscription('')
      setRubric(null)
      setCritique('')
      isStoppingRef.current = false
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      const audioContext = new AudioContext()
      const analyser = audioContext.createAnalyser()
      const source = audioContext.createMediaStreamSource(stream)
      source.connect(analyser)
      analyser.minDecibels = -60
      analyser.fftSize = 256
      audioContextRef.current = audioContext
      
      const bufferLength = analyser.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)

      const detectSilence = () => {
        if (isStoppingRef.current) return
        analyser.getByteFrequencyData(dataArray)
        let sum = 0
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i]
        }
        const average = sum / bufferLength
        
        if (average < 5) {
          if (silenceTimerRef.current === null) {
            silenceTimerRef.current = window.setTimeout(() => {
              if (!isStoppingRef.current) {
                console.log("Silence detected. Auto-stopping recording.")
                stopRecording()
              }
            }, 2000)
          }
        } else {
          if (silenceTimerRef.current !== null) {
            window.clearTimeout(silenceTimerRef.current)
            silenceTimerRef.current = null
          }
        }
        requestAnimationFrame(detectSilence)
      }

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
      detectSilence() 
    } catch (err) {
      console.error("Microphone access denied", err)
      setError("FATAL: MICROPHONE ACCESS DENIED.")
    }
  }

  const stopRecording = () => {
    isStoppingRef.current = true
    if (silenceTimerRef.current !== null) {
      window.clearTimeout(silenceTimerRef.current)
      silenceTimerRef.current = null
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {})
      audioContextRef.current = null
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
    }
  }

  const processAudio = async (blob: Blob) => {
    setLoading(true)
    
    const formData = new FormData()
    formData.append('audio', blob, 'recording.wav')
    formData.append('problem_id', problemId)
    if (problemId === 'custom') {
      formData.append('custom_problem', customProblem)
    }
    
    try {
      const res = await fetch('http://localhost:8000/api/think_aloud', {
        method: 'POST',
        body: formData
      })
      const data = await res.json()
      
      if (data.error) {
        setError(data.error)
      } else {
        setTranscription(data.transcription)
        setRubric(data.rubric)
        setCritique(data.critique)
        
        // Log trauma based on rubric
        if (data.rubric) {
           let scoreChange = 0;
           if (!data.rubric.articulated_optimal_path) scoreChange -= 10;
           if (!data.rubric.correct_time_complexity) scoreChange -= 5;
           if (!data.rubric.correct_space_complexity) scoreChange -= 5;
           
           if (scoreChange < 0) {
              logTrauma('Think Out Loud', `Failed to explain optimal approach for ${problemId}`, scoreChange);
           } else if (data.rubric.articulated_optimal_path) {
              logTrauma('Think Out Loud', `Successfully explained optimal approach for ${problemId}`, 10);
           }
        }
      }
    } catch (err) {
      console.error(err)
      setError('FATAL: BACKEND COMMUNICATION FAILED.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="glitch-text" data-text="THINK OUT LOUD" style={{ marginBottom: '0.5rem', color: 'var(--text-accent)', display: 'flex', alignItems: 'center', gap: '0.5rem', textTransform: 'uppercase', fontWeight: 900 }}>
            <MessageSquare size={24} /> THINK OUT LOUD
          </h2>
          <p style={{ color: '#888', fontStyle: 'italic', fontWeight: 700 }}>Speak your algorithm out loud and get brutally graded.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <label style={{ color: '#888', textTransform: 'uppercase' }}>Target Algorithm:</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
            <select 
              value={problemId} 
              onChange={(e) => setProblemId(e.target.value)}
              style={{ width: '200px', border: '1px solid var(--text-accent)' }}
            >
              {PROBLEMS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
        </div>
      </div>
      
      {problemId === 'custom' && (
        <div style={{ marginBottom: '1rem' }}>
          <textarea 
            placeholder="Paste your custom problem description here... (e.g. 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.')"
            value={customProblem}
            onChange={(e) => setCustomProblem(e.target.value)}
            style={{ 
              width: '100%', 
              height: '80px', 
              background: '#0a0a0a', 
              border: '1px solid #333', 
              resize: 'vertical',
              fontSize: '0.9rem'
            }}
          />
        </div>
      )}
      
      {/* Top Half: Input & Rubric */}
      <div style={{ display: 'flex', gap: '1.5rem', flex: 1 }}>
        {/* Left: Input Panel */}
        <div className="glass-panel" style={{ flex: 1, padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            onMouseLeave={isRecording ? stopRecording : undefined}
            className={isRecording ? "biometric-scanner" : ""}
            style={{ 
              display: 'flex', 
              flexDirection: 'column',
              justifyContent: 'center', 
              alignItems: 'center', 
              gap: '0.5rem',
              width: '160px',
              height: '160px',
              borderRadius: '50%',
              background: isRecording ? 'var(--danger-color)' : 'transparent',
              color: isRecording ? '#fff' : 'var(--danger-color)',
              border: isRecording ? 'none' : '2px solid var(--danger-color)',
              transition: 'all 0.2s ease',
              position: 'relative',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
            disabled={loading}
          >
            {isRecording && (
              <motion.div 
                animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ repeat: Infinity, duration: 1.2 }}
                style={{ position: 'absolute', inset: -20, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,42,42,0.4) 0%, transparent 70%)', zIndex: 0 }}
              />
            )}
            <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <Mic size={40} />
              <span style={{ fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'center' }}>
                {loading ? 'ANALYZING...' : (isRecording ? 'RELEASE' : 'HOLD TO SPEAK')}
              </span>
            </div>
          </motion.button>
          
          <div style={{ height: '40px', marginTop: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
            {isRecording ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span className="glitch-hover font-mono" style={{ color: 'var(--danger-color)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>[ LISTENING ]</span>
                <div className="sound-wave" style={{ transform: 'scale(1.2)' }}>
                  <div className="sound-wave-bar"></div>
                  <div className="sound-wave-bar"></div>
                  <div className="sound-wave-bar"></div>
                  <div className="sound-wave-bar"></div>
                  <div className="sound-wave-bar"></div>
                </div>
              </div>
            ) : loading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-warning)', textTransform: 'uppercase', fontSize: '0.85rem', fontWeight: 'bold' }}>
                <Loader2 className="animate-spin" size={16} />
                <span>PROCESSING AUDIO STREAM...</span>
              </div>
            ) : (
              <div className="font-mono" style={{ opacity: 0.3, color: '#888', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.85rem' }}>MIC INACTIVE</div>
            )}
          </div>
          {error && <p style={{ color: 'var(--danger-color)', fontWeight: 'bold', marginTop: '1rem' }}>{error}</p>}
        </div>

        {/* Right: Live Rubric Dashboard */}
        <div className="glass-panel" style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column', border: '1px solid var(--text-accent)', boxShadow: 'inset 0 0 20px rgba(255,0,60,0.05)' }}>
          <h3 className="glitch-text" data-text="EVALUATION MATRIX" style={{ color: 'var(--text-accent)', marginBottom: '1.5rem', textTransform: 'uppercase', borderBottom: '2px solid var(--text-accent)', paddingBottom: '0.5rem', fontWeight: 900 }}>
            EVALUATION MATRIX
          </h3>
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {['Brute Force Identified', 'Optimal Path Articulated', 'Time Complexity Correct', 'Space Complexity Correct'].map((item, idx) => {
              const keyMap: Record<number, string> = {
                0: 'identified_brute_force',
                1: 'articulated_optimal_path',
                2: 'correct_time_complexity',
                3: 'correct_space_complexity'
              }
              const passed = rubric ? rubric[keyMap[idx]] : null;
              
              return (
                <div key={idx} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  background: passed === true ? 'rgba(0, 255, 0, 0.05)' : passed === false ? 'rgba(255, 42, 42, 0.05)' : '#000',
                  border: passed === true ? '1px solid var(--text-success)' : passed === false ? '1px solid var(--danger-color)' : '1px solid #333',
                  padding: '1rem',
                  textTransform: 'uppercase',
                  opacity: rubric ? 1 : 0.4
                }}>
                  <span style={{ color: passed === true ? 'var(--text-success)' : passed === false ? 'var(--danger-color)' : '#888', fontWeight: 'bold' }}>{item}</span>
                  <div>
                    {passed === true && <CheckSquare size={24} color="var(--text-success)" />}
                    {passed === false && <XSquare size={24} color="var(--danger-color)" />}
                    {passed === null && <span style={{ color: '#555' }}>[ ? ]</span>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Bottom Half: Transcript & Critique Feed */}
      <div style={{ display: 'flex', gap: '1.5rem', height: '250px' }}>
        <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', border: '1px solid #333', overflow: 'hidden' }}>
          <div style={{ background: '#050505', padding: '0.5rem 1rem', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-success)', textTransform: 'uppercase', fontSize: '0.85rem', fontWeight: 900 }}>LIVE TRANSCRIPT</span>
            {isRecording && <span className="glitch-hover" style={{ color: 'var(--danger-color)', fontSize: '0.85rem' }}>● REC</span>}
          </div>
          <div style={{ padding: '1rem', flex: 1, overflowY: 'auto', background: '#000', fontFamily: 'Space Mono, monospace', fontSize: '0.9rem' }}>
            {transcription ? (
              <p style={{ color: '#fff', lineHeight: '1.6' }}>&gt; {transcription}</p>
            ) : isRecording ? (
              <p style={{ color: '#888' }}>&gt; Capturing audio stream...</p>
            ) : (
              <p style={{ color: '#333' }}>&gt; Awaiting vocal input...</p>
            )}
          </div>
        </div>

        <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', border: '1px solid var(--text-warning)', overflow: 'hidden', boxShadow: 'inset 0 0 10px rgba(255,176,0,0.05)' }}>
          <div style={{ background: 'rgba(255, 176, 0, 0.1)', padding: '0.5rem 1rem', borderBottom: '1px solid var(--text-warning)' }}>
            <span style={{ color: 'var(--text-warning)', textTransform: 'uppercase', fontSize: '0.85rem', fontWeight: 900 }}>SYSTEM CRITIQUE</span>
          </div>
          <div style={{ padding: '1rem', flex: 1, overflowY: 'auto', background: '#000' }}>
            {critique ? (
              <p style={{ color: '#fff', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{critique}</p>
            ) : loading ? (
              <div style={{ display: 'flex', gap: '0.5rem', color: '#666', marginTop: '1rem' }}>
                <Loader2 className="animate-spin" size={16} /> GENERATING INSULTS...
              </div>
            ) : (
              <div className="font-mono" style={{ color: '#555', fontSize: '0.85rem' }}>
                <p>SYSTEM IDLE.</p>
                <p>AWAITING VOICE INPUT FOR CRITIQUE.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
