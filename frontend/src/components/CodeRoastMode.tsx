import { useState, useRef, useEffect } from 'react'
import { Loader2, AlertTriangle, Terminal, Share2 } from 'lucide-react'
import Editor from '@monaco-editor/react'
import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import { useGlobalState } from '../GlobalState'

const TAGLINES = [
  "Upload your code and let our compiler judge your life choices.",
  "Paste your logic here to initiate an automated ego wipe.",
  "Submit your script so we can mathematically prove it is a disaster.",
  "Drop your code below to find out why your pull requests keep getting ignored.",
  "Run your codebase through our technical trauma simulator.",
  "Let our static analyzer find every missing colon and ounce of dignity.",
  "Submit your syntax and receive a brutally honest traceback of your failures."
]

export default function CodeRoastMode() {
  const [code, setCode] = useState('')
  const [intensity, setIntensity] = useState('Brutal')
  const [loading, setLoading] = useState(false)
  const [roast, setRoast] = useState('')
  const [correctedCode, setCorrectedCode] = useState('')
  const [errors, setErrors] = useState<string[]>([])
  const [tagline, setTagline] = useState(() => TAGLINES[Math.floor(Math.random() * TAGLINES.length)])
  
  const [shake, setShake] = useState(false)
  const { logTrauma } = useGlobalState()

  const activeAudioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    return () => {
      if (activeAudioRef.current) activeAudioRef.current.pause()
    }
  }, [])

  const handleRoast = async () => {
    if (!code.trim()) return
    setLoading(true)
    setRoast('')
    setCorrectedCode('')
    setErrors([])
    setShake(false)

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
      
      if (!res.body) throw new Error("No response body")
      
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let done = false
      let buffer = ''
      
      setLoading(false) 
      setShake(true) // trigger shake animation on start
      setTimeout(() => setShake(false), 500)
      
      while (!done) {
        const { value, done: doneReading } = await reader.read()
        done = doneReading
        if (value) {
          buffer += decoder.decode(value, { stream: true })
          const parts = buffer.split('\n\n')
          buffer = parts.pop() || ''
          
          for (const part of parts) {
            if (part.startsWith('data: ')) {
              const dataStr = part.slice(6)
              if (dataStr === '[DONE]') {
                done = true
                break
              }
              try {
                const data = JSON.parse(dataStr)
                if (data.type === 'metadata') {
                  setErrors(data.errors || [])
                } else if (data.type === 'chunk') {
                  setRoast(prev => prev + data.text)
                } else if (data.type === 'audio') {
                  if (activeAudioRef.current) activeAudioRef.current.pause()
                  const audio = new Audio('http://localhost:8000' + data.url)
                  activeAudioRef.current = audio
                  audio.play().catch(e => console.error("Audio playback error:", e))
                } else if (data.type === 'error') {
                  setRoast(prev => prev + "\nError: " + data.text)
                }
              } catch (e) {
                console.error("SSE JSON parse error:", e)
              }
            }
          }
        }
      }
      
      // Log trauma to global state depending on intensity
      const scoreHit = intensity === 'Startup' ? -5 : intensity === 'Big Tech' ? -15 : -30;
      await logTrauma('Roast', `Endured a ${intensity} level code roast`, scoreHit);
      
    } catch {
      setRoast(prev => prev + '\nFATAL ERROR: BACKEND REFUSED TO COMMUNICATE.')
    } finally {
      setLoading(false)
    }
  }

  const handleShare = () => {
    const text = `Just got absolutely destroyed by the O(Nope) Hacker AI. 
My ego score is dropping fast.

#Hackathon #CodeRoast`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
  }

  return (
    <motion.div 
      style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={shake ? "screen-shake" : ""}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="glitch-hover" style={{ marginBottom: '0.2rem', color: 'var(--text-accent)', display: 'flex', alignItems: 'center', gap: '0.5rem', textTransform: 'uppercase', fontWeight: 900 }}>
            <Terminal size={24} /> THE CODE ROAST
          </h2>
          <p style={{ color: '#888', fontStyle: 'italic' }}>{tagline}</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <label style={{ color: '#888', textTransform: 'uppercase' }}>Difficulty:</label>
          <select 
            value={intensity} 
            onChange={(e) => setIntensity(e.target.value)}
            style={{ width: '150px', border: '2px solid var(--text-accent)' }}
          >
            <option value="Startup">Startup</option>
            <option value="Big Tech">Big Tech</option>
            <option value="Hedge Fund">Hedge Fund</option>
          </select>
        </div>
      </div>
      
      <div style={{ display: 'flex', flex: 1, gap: '1.5rem', minHeight: 0 }}>
        {/* Left Panel: Editor */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: 0 }}>
          <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div className="terminal-header" style={{ borderBottom: '1px solid #333' }}>
              <div className="mac-btn mac-close"></div>
              <div className="mac-btn mac-min"></div>
              <div className="mac-btn mac-max"></div>
              <span className="font-mono" style={{ marginLeft: '1rem', color: 'var(--danger-color)', fontSize: '0.75rem', fontWeight: 'bold' }}>compiler_panic.log</span>
            </div>
            <div style={{
              background: '#000',
              overflow: 'hidden',
              flex: 1,
              position: 'relative'
            }}>
              <Editor
                height="100%"
                defaultLanguage="python"
                theme="hc-black"
                value={code}
                onChange={(val) => setCode(val || '')}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  fontFamily: "Space Mono, Fira Code, Consolas, Monaco, monospace",
                  scrollBeyondLastLine: false,
                  wordWrap: 'on',
                  padding: { top: 16, bottom: 16 },
                  cursorBlinking: "solid"
                }}
              />
            </div>
          </div>
          <button 
            className="cyber-button" 
            onClick={handleRoast} 
            disabled={loading || !code.trim()}
          >
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <Loader2 className="animate-spin" /> EXECUTING TEARDOWN...
              </div>
            ) : 'INITIATE TEARDOWN'}
          </button>
        </div>

        {/* Right Panel: Roast Output */}
        <div className="glass-panel" style={{ flex: 1, padding: '2rem', overflowY: 'auto', borderTop: '4px solid var(--text-warning)', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <h3 className="glitch-text" style={{ color: 'var(--text-warning)', marginBottom: '1.5rem', textTransform: 'uppercase', borderBottom: '1px solid #333', paddingBottom: '0.5rem' }}>
            [ ANALYSIS LOG ]
          </h3>

          {!(roast || errors.length > 0) ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', opacity: 0.4, gap: '1rem' }}>
              <Terminal size={48} color="var(--text-warning)" />
              <div className="font-mono" style={{ textAlign: 'center', color: '#888', fontSize: '0.85rem' }}>
                <p>SYSTEM IDLE.</p>
                <p>AWAITING TEARDOWN INITIATION...</p>
                <br/>
                <p style={{ opacity: 0.5 }}>$ load_roast_module --intensity={intensity.toLowerCase()}</p>
                <p style={{ opacity: 0.5 }}>$ ready</p>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {errors.length > 0 && (
                <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(255, 0, 60, 0.1)', borderLeft: '4px solid var(--danger-color)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger-color)', marginBottom: '0.5rem', fontWeight: 900, textTransform: 'uppercase' }}>
                    <AlertTriangle size={18} />
                    SYNTAX FATALITIES DETECTED
                  </div>
                  <ul style={{ color: '#ffaaaa', paddingLeft: '1.5rem', listStyleType: 'square' }}>
                    {errors.map((e, i) => <li key={i}>{e}</li>)}
                  </ul>
                </div>
              )}
              
              {roast && (
                <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderLeft: '4px solid var(--text-warning)' }}>
                  <h4 style={{ color: 'var(--text-warning)', marginBottom: '1rem', textTransform: 'uppercase', fontWeight: 900 }}>SYSTEM OUTPUT:</h4>
                  <div className="markdown-body" style={{ lineHeight: '1.6', fontSize: '0.9rem', color: '#ddd', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <ReactMarkdown
                      components={{
                        h3: ({node, ...props}) => <h3 style={{ color: 'var(--text-accent)', textTransform: 'uppercase', fontSize: '1.1rem', marginTop: '1rem', marginBottom: '0.5rem', fontWeight: 900 }} {...props} />,
                        p: ({node, ...props}) => <p style={{ margin: 0 }} {...props} />,
                        code: ({node, className, children, ...props}) => {
                          const match = /language-(\w+)/.exec(className || '')
                          return match ? (
                            <div style={{ background: '#000', padding: '1rem', border: '1px solid #333', borderRadius: '4px', overflowX: 'auto', fontFamily: 'var(--font-mono)' }}>
                              <code className={className} {...props}>{children}</code>
                            </div>
                          ) : (
                            <code style={{ background: '#333', padding: '0.2rem 0.4rem', borderRadius: '2px', fontFamily: 'var(--font-mono)' }} {...props}>{children}</code>
                          )
                        }
                      }}
                    >
                      {roast}
                    </ReactMarkdown>
                    <motion.span 
                      animate={{ opacity: [1, 0, 1] }} 
                      transition={{ repeat: Infinity, duration: 0.8 }}
                      style={{ display: 'inline-block', width: '10px', height: '1.2em', background: 'var(--text-warning)', verticalAlign: 'middle', marginLeft: '5px' }}
                    />
                  </div>
                </div>
              )}

              {correctedCode && correctedCode !== code && (
                <div style={{ borderTop: '2px solid #333', paddingTop: '1.5rem' }}>
                  <h4 style={{ color: 'var(--text-success)', marginBottom: '1rem', textTransform: 'uppercase' }}>Compensating for Human Error...</h4>
                  <pre style={{ 
                    background: '#000', 
                    padding: '1rem', 
                    border: '1px solid #333',
                    overflowX: 'auto'
                  }}>
                    <code style={{ color: '#fff', fontSize: '0.85rem' }}>{correctedCode}</code>
                  </pre>
                </div>
              )}
              
              {!loading && (roast || errors.length > 0) && (
                <button className="cyber-button" onClick={handleShare} style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', alignSelf: 'flex-start' }}>
                  <Share2 size={18} />
                  SHARE HUMILIATION TO X
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
