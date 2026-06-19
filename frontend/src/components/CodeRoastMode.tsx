import { useState, useRef, useEffect, useMemo } from 'react'
import { Loader2 } from 'lucide-react'
import Editor from '@monaco-editor/react'

const TAGLINES = [
  "Upload your code and let our compiler judge your life choices.",
  "Paste your logic here to initiate an automated ego wipe.",
  "Submit your script so we can mathematically prove it is a disaster.",
  "Drop your code below to find out why your pull requests keep getting ignored.",
  "Run your codebase through our technical trauma simulator.",
  "Let our static analyzer find every missing colon and ounce of dignity.",
  "Submit your syntax and receive a brutally honest traceback of your failures.",
  "Enter your solution to get linted, roasted, and thoroughly humbled.",
  "Paste your algorithm and let us tell you why it is an O(Tragedy).",
  "Click to run a diagnostic on your code and your confidence.",
  "Let an AI read your code so human reviewers do not have to suffer.",
  "Submit for a line-by-line teardown of your problem-solving skills.",
  "Feed us your logic and we will return a beautifully formatted insult.",
  "Upload your files to get roasted faster than your runtime complexity.",
  "Paste your snippet to see how quickly a language model can lose respect for you.",
  "Let an automated script mathematically prove how much you suck at this.",
  "Submit your code and watch a linter destroy your self-esteem in milliseconds.",
  "Time to let the static analyzer explain why your computer science degree was a waste of money.",
  "Click here to let a robot call your baby ugly.",
  "Offer your spaghetti code as a sacrifice to the angry static analysis gods.",
  "Run your code through the linter to find out exactly how many war crimes you've committed.",
  "Let the static analyzer read your code its Miranda rights.",
  "Get your code cyberbullied by a shell script.",
  "Find out exactly how many bad decisions you made today.",
  "Static analysis: Because your code isn't going to roast itself.",
  "Feed the linter. Embrace the shame.",
  "Linter: 1, Your Ego: 0.",
  "Subject your code to static analysis and discover new and exciting ways you are wrong.",
  "Let's see what the linter has to say about your 'quick fix'.",
  "Submit for static analysis: A great way to ruin a perfectly good Friday."
]

export default function CodeRoastMode() {
  const [code, setCode] = useState('')
  const [intensity, setIntensity] = useState('Constructive')
  const [loading, setLoading] = useState(false)
  const [roast, setRoast] = useState('')
  const [correctedCode, setCorrectedCode] = useState('')
  const [errors, setErrors] = useState<string[]>([])
  const [tagline, setTagline] = useState(() => TAGLINES[Math.floor(Math.random() * TAGLINES.length)])
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const gutterRef = useRef<HTMLDivElement>(null)

  const handleScroll = () => {
    if (textareaRef.current && gutterRef.current) {
      gutterRef.current.scrollTop = textareaRef.current.scrollTop
    }
  }

  useEffect(() => {
    if (textareaRef.current && gutterRef.current) {
      gutterRef.current.scrollTop = textareaRef.current.scrollTop
    }
  }, [code])

  const lineCount = useMemo(() => code.split('\n').length, [code])

  const handleRoast = async () => {
    if (!code.trim()) return
    setLoading(true)
    setRoast('')
    setCorrectedCode('')
    setErrors([])

    // Select a new random tagline different from current one
    setTagline(prev => {
      const remaining = TAGLINES.filter(t => t !== prev)
      return remaining[Math.floor(Math.random() * remaining.length)]
    })
    
    try {
      const formData = new FormData()
      formData.append('code', code)
      formData.append('intensity', intensity)
      
      const res = await fetch('http://localhost:8000/api/roast', {
        method: 'POST',
        body: formData
      })
      
      const data = await res.json()
      setRoast(data.roast || data.error || 'Error connecting to the backend API.')
      setCorrectedCode(data.corrected_code || '')
      setErrors(data.errors || [])
    } catch (err) {
      setRoast('Error connecting to the backend API.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ marginBottom: '0.5rem' }}>The Code Roast</h2>
          <p style={{ color: '#94a3b8' }}>{tagline}</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <label style={{ color: '#94a3b8' }}>Intensity:</label>
          <select 
            value={intensity} 
            onChange={(e) => setIntensity(e.target.value)}
            style={{ width: '150px' }}
          >
            <option value="Constructive">Constructive</option>
            <option value="Brutal">Brutal</option>
            <option value="Demeaning">Demeaning</option>
          </select>
        </div>
      </div>
      
      <div className="glass-panel" style={{ padding: '1rem', display: 'flex', flexDirection: 'column' }}>
        <div style={{
          background: 'rgba(0, 0, 0, 0.4)',
          border: '1px solid var(--glass-border)',
          borderRadius: '8px',
          overflow: 'hidden',
          minHeight: '300px',
          height: '40vh',
          marginBottom: '1rem'
        }}>
          <Editor
            height="100%"
            defaultLanguage="python"
            theme="vs-dark"
            value={code}
            onChange={(val) => setCode(val || '')}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              fontFamily: "JetBrains Mono, Fira Code, Consolas, Monaco, 'Courier New', monospace",
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              padding: { top: 16, bottom: 16 }
            }}
          />
        </div>
        <button 
          className="btn-primary" 
          onClick={handleRoast} 
          disabled={loading}
          style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={18} /> Analyzing Codebase...
            </>
          ) : 'Roast Me'}
        </button>
      </div>

      {(roast || errors.length > 0) && (
        <div className="glass-panel" style={{ padding: '2rem', flex: 1, overflowY: 'auto' }}>
          {errors.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: '#ef4444', marginBottom: '1rem' }}>Syntax Errors Found:</h3>
              <ul style={{ color: '#fca5a5', paddingLeft: '1.5rem' }}>
                {errors.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            </div>
          )}
          
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ color: '#eab308', marginBottom: '1rem' }}>The Roast:</h3>
            <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{roast}</p>
          </div>

          {correctedCode && correctedCode !== code && (
            <div>
              <h3 style={{ color: '#38bdf8', marginBottom: '1rem' }}>Corrected Code:</h3>
              <pre style={{ 
                background: 'rgba(0,0,0,0.3)', 
                padding: '1rem', 
                borderRadius: '8px',
                overflowX: 'auto',
                border: '1px solid rgba(255,255,255,0.1)'
              }}>
                <code style={{ fontFamily: 'monospace', color: '#e2e8f0' }}>{correctedCode}</code>
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
