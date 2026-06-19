import { useState, useRef, useEffect } from 'react'
import { Mic } from 'lucide-react'

const PROBLEMS = [
  { id: 'two_sum', name: 'Two Sum' },
  { id: 'lru_cache', name: 'LRU Cache' },
  { id: 'binary_search', name: 'Binary Search' }
]

export default function ThinkOutLoudMode() {
  const [problemId, setProblemId] = useState(PROBLEMS[0].id)
  const [isRecording, setIsRecording] = useState(false)
  const [loading, setLoading] = useState(false)
  const [transcription, setTranscription] = useState('')
  const [rubric, setRubric] = useState<any>(null)
  const [critique, setCritique] = useState('')
  const [error, setError] = useState('')

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [])


  const startRecording = async () => {
    try {
      setError('')
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
      setError("Microphone access denied.")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
    }
  }

  const processAudio = async (blob: Blob) => {
    setLoading(true)
    setTranscription('')
    setRubric(null)
    setCritique('')
    
    const formData = new FormData()
    formData.append('audio', blob, 'recording.wav')
    formData.append('problem_id', problemId)
    
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
      }
    } catch (err) {
      console.error(err)
      setError('Error connecting to the backend API.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ marginBottom: '0.5rem' }}>Think Out Loud</h2>
          <p style={{ color: '#94a3b8' }}>Speak your algorithm out loud and get brutally graded.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <label style={{ color: '#94a3b8' }}>Algorithm:</label>
          <select 
            value={problemId} 
            onChange={(e) => setProblemId(e.target.value)}
            style={{ width: '200px' }}
          >
            {PROBLEMS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      </div>
      
      <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
        <button 
          onClick={isRecording ? stopRecording : startRecording}
          className="btn-primary"
          style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            gap: '0.5rem',
            padding: '1rem 2rem',
            fontSize: '1.2rem',
            background: isRecording ? '#ef4444' : undefined,
            boxShadow: isRecording ? '0 0 15px rgba(239, 68, 68, 0.5)' : undefined
          }}
          disabled={loading}
        >
          <Mic size={24} />
          {loading ? 'Analyzing Speech...' : (isRecording ? 'Stop Recording' : 'Hold to Explain Algorithm')}
        </button>
        {error && <p style={{ color: '#ef4444' }}>{error}</p>}
      </div>

      {(transcription || critique) && (
        <div style={{ display: 'flex', gap: '1.5rem', flex: 1, overflow: 'hidden' }}>
          
          <div className="glass-panel" style={{ flex: 1, padding: '1.5rem', overflowY: 'auto' }}>
            <h3 style={{ color: '#38bdf8', marginBottom: '1rem' }}>Your Transcription:</h3>
            <p style={{ color: '#e2e8f0', lineHeight: '1.6', fontStyle: 'italic', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px' }}>
              "{transcription}"
            </p>
          </div>

          <div className="glass-panel" style={{ flex: 1, padding: '1.5rem', overflowY: 'auto' }}>
            <h3 style={{ color: '#eab308', marginBottom: '1rem' }}>Evaluation:</h3>
            
            {rubric && (
              <div style={{ marginBottom: '1.5rem', background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px' }}>
                <h4 style={{ color: '#94a3b8', marginBottom: '0.5rem' }}>Rubric Matrix:</h4>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  <li style={{ color: rubric.identified_brute_force ? '#4ade80' : '#ef4444', marginBottom: '0.3rem' }}>
                    {rubric.identified_brute_force ? '✓' : '✗'} Identified Brute Force
                  </li>
                  <li style={{ color: rubric.articulated_optimal_path ? '#4ade80' : '#ef4444', marginBottom: '0.3rem' }}>
                    {rubric.articulated_optimal_path ? '✓' : '✗'} Articulated Optimal Path
                  </li>
                  <li style={{ color: rubric.correct_time_complexity ? '#4ade80' : '#ef4444', marginBottom: '0.3rem' }}>
                    {rubric.correct_time_complexity ? '✓' : '✗'} Correct Time Complexity
                  </li>
                  <li style={{ color: rubric.correct_space_complexity ? '#4ade80' : '#ef4444', marginBottom: '0.3rem' }}>
                    {rubric.correct_space_complexity ? '✓' : '✗'} Correct Space Complexity
                  </li>
                </ul>
              </div>
            )}

            <h4 style={{ color: '#94a3b8', marginBottom: '0.5rem' }}>The Critique:</h4>
            <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', color: '#e2e8f0' }}>{critique}</p>
          </div>

        </div>
      )}
    </div>
  )
}
