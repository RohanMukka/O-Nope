import { useState, useRef, useEffect } from 'react'

export default function VisualizerMode() {
  const [code, setCode] = useState(`def fib(n):
    if n <= 1:
        return n
    return fib(n - 1) + fib(n - 2)

print("fib(4) is:", fib(4))`)
  const [loading, setLoading] = useState(false)
  const [steps, setSteps] = useState<any[]>([])
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [error, setError] = useState('')
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

  const handleVisualize = async () => {
    if (!code.trim()) return
    setLoading(true)
    setError('')
    setSteps([])
    setCurrentStepIndex(0)

    try {
      const formData = new FormData()
      formData.append('code', code)

      const res = await fetch('http://localhost:8000/api/visualize', {
        method: 'POST',
        body: formData
      })

      const data = await res.json()
      if (data.error) {
        setError(data.error)
      } else if (data.steps && data.steps.length > 0) {
        setSteps(data.steps)
        setCurrentStepIndex(0)
      } else {
        setError('No steps generated during execution.')
      }
    } catch (err) {
      setError('Error connecting to the backend API.')
    } finally {
      setLoading(false)
    }
  }

  const lineCount = code.split('\n').length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
      <div>
        <h2 style={{ marginBottom: '0.5rem' }}>Python Visualizer</h2>
        <p style={{ color: '#94a3b8' }}>Visualize your Python execution step-by-step natively.</p>
      </div>
      
      <div className="glass-panel" style={{ padding: '1rem' }}>
        <div style={{
          display: 'flex',
          background: 'rgba(0, 0, 0, 0.2)',
          border: '1px solid var(--glass-border)',
          borderRadius: '8px',
          fontFamily: "JetBrains Mono, Fira Code, Consolas, Monaco, 'Courier New', monospace",
          fontSize: '14px',
          lineHeight: '1.5rem',
          marginBottom: '1rem',
          height: '220px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Gutter */}
          <div 
            ref={gutterRef}
            style={{
              padding: '0.8rem 0',
              width: '3.5rem',
              background: 'rgba(0, 0, 0, 0.15)',
              borderRight: '1px solid var(--glass-border)',
              color: '#64748b',
              textAlign: 'right',
              paddingRight: '0.8rem',
              userSelect: 'none',
              overflowY: 'hidden',
              boxSizing: 'border-box',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'stretch'
            }}
          >
            {Array.from({ length: lineCount }).map((_, index) => (
              <div key={index} style={{ height: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                {index + 1}
              </div>
            ))}
          </div>
          
          {/* Textarea */}
          <textarea 
            ref={textareaRef}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onScroll={handleScroll}
            wrap="off"
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              borderRadius: 0,
              color: 'white',
              padding: '0.8rem',
              margin: 0,
              fontFamily: "JetBrains Mono, Fira Code, Consolas, Monaco, 'Courier New', monospace",
              fontSize: '14px',
              lineHeight: '1.5rem',
              resize: 'none',
              overflowY: 'auto',
              overflowX: 'auto',
              whiteSpace: 'pre',
              outline: 'none',
              boxSizing: 'border-box',
              height: '100%',
            }}
          />
        </div>
        <button className="btn-primary" onClick={handleVisualize} disabled={loading}>
          {loading ? 'Executing...' : 'Visualize Execution'}
        </button>
      </div>

      {error && (
        <div className="glass-panel" style={{ padding: '1rem', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
          {error}
        </div>
      )}

      {steps.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1, overflowY: 'auto' }}>
          {/* Controls */}
          <div className="glass-panel" style={{ padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                className="btn-primary" 
                style={{ padding: '0.4rem 0.8rem', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--glass-border)', boxShadow: 'none' }}
                onClick={() => setCurrentStepIndex(0)}
                disabled={currentStepIndex === 0}
              >
                First
              </button>
              <button 
                className="btn-primary" 
                style={{ padding: '0.4rem 0.8rem', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--glass-border)', boxShadow: 'none' }}
                onClick={() => setCurrentStepIndex(prev => Math.max(0, prev - 1))}
                disabled={currentStepIndex === 0}
              >
                Prev
              </button>
              <button 
                className="btn-primary" 
                style={{ padding: '0.4rem 0.8rem', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--glass-border)', boxShadow: 'none' }}
                onClick={() => setCurrentStepIndex(prev => Math.min(steps.length - 1, prev + 1))}
                disabled={currentStepIndex === steps.length - 1}
              >
                Next
              </button>
              <button 
                className="btn-primary" 
                style={{ padding: '0.4rem 0.8rem', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--glass-border)', boxShadow: 'none' }}
                onClick={() => setCurrentStepIndex(steps.length - 1)}
                disabled={currentStepIndex === steps.length - 1}
              >
                Last
              </button>
            </div>
            
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <input 
                type="range" 
                min={0} 
                max={steps.length - 1} 
                value={currentStepIndex} 
                onChange={(e) => setCurrentStepIndex(Number(e.target.value))}
                style={{ flex: 1, height: '4px', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.9rem', color: '#94a3b8', minWidth: '90px', textAlign: 'right' }}>
                Step {currentStepIndex + 1} of {steps.length}
              </span>
            </div>
          </div>

          {/* Trace Panel: Code on left, stack frames/variables on right */}
          <div style={{ display: 'flex', gap: '1rem', flex: 1, minHeight: '350px' }}>
            {/* Code view */}
            <div className="glass-panel" style={{ flex: 1.5, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
              <h4 style={{ color: '#94a3b8', marginBottom: '0.5rem', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Execution Trace</h4>
              <div style={{ 
                fontFamily: "JetBrains Mono, Fira Code, Consolas, Monaco, 'Courier New', monospace",
                fontSize: '13px',
                lineHeight: '1.6rem',
                whiteSpace: 'pre',
                flex: 1
              }}>
                {code.split('\n').map((lineText, idx) => {
                  const isCurrentLine = steps[currentStepIndex]?.line === idx + 1
                  return (
                    <div 
                      key={idx} 
                      style={{ 
                        display: 'flex', 
                        background: isCurrentLine ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                        borderLeft: isCurrentLine ? '3px solid var(--text-accent)' : '3px solid transparent',
                        paddingLeft: '0.5rem',
                        transition: 'background 0.1s ease'
                      }}
                    >
                      <span style={{ width: '2.5rem', color: isCurrentLine ? 'var(--text-accent)' : '#475569', userSelect: 'none', display: 'inline-block', textAlign: 'right', paddingRight: '0.8rem' }}>
                        {idx + 1}
                      </span>
                      <span style={{ color: isCurrentLine ? 'white' : '#cbd5e1' }}>
                        {lineText || ' '}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Stack Frames & Variables */}
            <div className="glass-panel" style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h4 style={{ color: '#94a3b8', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Call Stack & Frames</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', flex: 1 }}>
                {steps[currentStepIndex]?.stack && steps[currentStepIndex].stack.map((frame: any, idx: number) => (
                  <div key={idx} style={{ 
                    border: '1px solid var(--glass-border)', 
                    borderRadius: '8px', 
                    background: 'rgba(0,0,0,0.2)',
                    overflow: 'hidden'
                  }}>
                    {/* Frame header */}
                    <div style={{ 
                      background: 'rgba(56, 189, 248, 0.1)', 
                      padding: '0.4rem 0.8rem', 
                      fontSize: '0.9rem', 
                      fontWeight: 600,
                      color: 'var(--text-accent)',
                      borderBottom: '1px solid var(--glass-border)',
                      display: 'flex',
                      justifyContent: 'space-between'
                    }}>
                      <span>{frame.name === '<module>' ? 'Global Frame' : `${frame.name}()`}</span>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>line {frame.line}</span>
                    </div>
                    {/* Frame variables */}
                    <div style={{ padding: '0.6rem 0.8rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                      {Object.keys(frame.variables).length === 0 ? (
                        <span style={{ color: '#64748b', fontSize: '0.85rem', fontStyle: 'italic' }}>No variables</span>
                      ) : (
                        Object.entries(frame.variables).map(([name, val]: any) => (
                          <div key={name} style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                            <span style={{ color: '#f43f5e' }}>{name}</span>
                            <span style={{ color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '150px' }} title={String(val)}>{typeof val === 'object' ? JSON.stringify(val) : String(val)}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Console / Output */}
          <div className="glass-panel" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <h4 style={{ color: '#94a3b8', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Standard Output (stdout)</h4>
            <pre style={{ 
              background: 'rgba(0, 0, 0, 0.4)', 
              padding: '0.8rem', 
              borderRadius: '6px', 
              fontFamily: 'monospace', 
              fontSize: '13px', 
              color: '#10b981',
              minHeight: '60px',
              maxHeight: '120px',
              overflowY: 'auto',
              margin: 0,
              whiteSpace: 'pre-wrap'
            }}>
              {steps[currentStepIndex]?.output || 'No output printed.'}
            </pre>
          </div>

          {/* Trace Error (if any) */}
          {steps[currentStepIndex]?.error && (
            <div style={{ 
              background: 'rgba(239, 68, 68, 0.1)', 
              border: '1px solid rgba(239, 68, 68, 0.3)', 
              borderRadius: '8px', 
              padding: '1rem',
              color: '#fca5a5',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.2rem'
            }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#ef4444' }}>Runtime Error:</h4>
              <p style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{steps[currentStepIndex].error}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
