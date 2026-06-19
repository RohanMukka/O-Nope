import { useState, useRef, useEffect, useMemo } from 'react'
import { Play, Maximize2, Minimize2, ExternalLink, Info, AlertCircle, Sparkles } from 'lucide-react'

const PRESETS = {
  fibonacci: {
    name: 'Fibonacci Recursion',
    code: `def fib(n):
    if n <= 1:
        return n
    return fib(n - 1) + fib(n - 2)

print("fib(4) is:", fib(4))`
  },
  bubblesort: {
    name: 'Bubble Sort',
    code: `def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr

test_list = [64, 34, 25, 12]
print("Sorted array:", bubble_sort(test_list))`
  },
  twosum: {
    name: 'Two Sum (Hash Map)',
    code: `def two_sum(nums, target):
    complements = {}
    for i, num in enumerate(nums):
        diff = target - num
        if diff in complements:
            return [complements[diff], i]
        complements[num] = i
    return []

print("Indices:", two_sum([2, 7, 11, 15], 9))`
  }
}

export default function VisualizerMode() {
  const [code, setCode] = useState(PRESETS.fibonacci.code)
  const [engine, setEngine] = useState<'pythontutor' | 'native'>('pythontutor')
  const [loading, setLoading] = useState(false)
  const [iframeUrl, setIframeUrl] = useState(
    `https://pythontutor.com/iframe-embed.html#code=${encodeURIComponent(PRESETS.fibonacci.code)}&cumulative=false&py=3&curInstr=0`
  )
  const [iframeLoading, setIframeLoading] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
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

  const handleEngineChange = (newEngine: 'pythontutor' | 'native') => {
    setEngine(newEngine)
    setError('')
    if (newEngine === 'pythontutor') {
      setIframeLoading(true)
      const encodedCode = encodeURIComponent(code)
      setIframeUrl(`https://pythontutor.com/iframe-embed.html#code=${encodedCode}&cumulative=false&py=3&curInstr=0`)
    } else {
      setSteps([])
      setCurrentStepIndex(0)
    }
  }

  const handlePresetSelect = (presetKey: keyof typeof PRESETS) => {
    const selectedPreset = PRESETS[presetKey]
    setCode(selectedPreset.code)
    setError('')
    
    if (engine === 'pythontutor') {
      setIframeLoading(true)
      const encodedCode = encodeURIComponent(selectedPreset.code)
      setIframeUrl(`https://pythontutor.com/iframe-embed.html#code=${encodedCode}&cumulative=false&py=3&curInstr=0`)
    } else {
      setSteps([])
      setCurrentStepIndex(0)
    }
  }

  const handleVisualize = async () => {
    if (!code.trim()) return
    setError('')

    if (engine === 'pythontutor') {
      setIframeLoading(true)
      const encodedCode = encodeURIComponent(code)
      setIframeUrl(`https://pythontutor.com/iframe-embed.html#code=${encodedCode}&cumulative=false&py=3&curInstr=0`)
    } else {
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
  }

  const codeLines = useMemo(() => code.split('\n'), [code])
  const lineCount = codeLines.length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%', color: 'var(--text-main)' }}>
      {/* Header Area */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Python Visualizer <Sparkles size={20} style={{ color: 'var(--text-accent)' }} />
          </h2>
          <p style={{ color: '#94a3b8' }}>Visualize Python code execution step-by-step with rich diagrams.</p>
        </div>

        {/* Engine Toggle Selection */}
        <div style={{ display: 'flex', background: 'rgba(0, 0, 0, 0.4)', padding: '0.25rem', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
          <button 
            onClick={() => handleEngineChange('pythontutor')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              border: 'none',
              background: engine === 'pythontutor' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
              color: engine === 'pythontutor' ? 'var(--text-accent)' : '#94a3b8',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            Python Tutor (Visual)
          </button>
          <button 
            onClick={() => handleEngineChange('native')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              border: 'none',
              background: engine === 'native' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
              color: engine === 'native' ? 'var(--text-accent)' : '#94a3b8',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            Native Trace (Beta)
          </button>
        </div>
      </div>
      
      {/* Split screen layout */}
      <div style={{ display: 'flex', gap: '1.5rem', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        {/* Left pane: Code Editor and Controls */}
        <div style={{ 
          flex: isExpanded ? 1 : 1.2, 
          display: isExpanded ? 'none' : 'flex', 
          flexDirection: 'column', 
          gap: '1rem', 
          minWidth: '320px',
          transition: 'all 0.3s ease'
        }}>
          {/* Preset Selector */}
          <div className="glass-panel" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Select Template</span>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {Object.entries(PRESETS).map(([key, item]) => (
                <button
                  key={key}
                  onClick={() => handlePresetSelect(key as any)}
                  className="btn-primary"
                  style={{
                    padding: '0.4rem 0.8rem',
                    fontSize: '0.8rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--glass-border)',
                    boxShadow: 'none',
                    color: '#e2e8f0'
                  }}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>

          {/* Code Editor */}
          <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '1rem', overflow: 'hidden' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
              Python Code Editor
            </span>
            <div style={{
              flex: 1,
              display: 'flex',
              background: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid var(--glass-border)',
              borderRadius: '8px',
              fontFamily: "JetBrains Mono, Fira Code, Consolas, Monaco, 'Courier New', monospace",
              fontSize: '13px',
              lineHeight: '1.5rem',
              position: 'relative',
              overflow: 'hidden',
              marginBottom: '1rem'
            }}>
              {/* Line Gutter */}
              <div 
                ref={gutterRef}
                style={{
                  padding: '0.8rem 0',
                  width: '3rem',
                  background: 'rgba(0, 0, 0, 0.25)',
                  borderRight: '1px solid var(--glass-border)',
                  color: '#475569',
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
                placeholder="# Enter Python code here..."
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  borderRadius: 0,
                  color: 'white',
                  padding: '0.8rem',
                  margin: 0,
                  fontFamily: "JetBrains Mono, Fira Code, Consolas, Monaco, 'Courier New', monospace",
                  fontSize: '13px',
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

            <button className="btn-primary" onClick={handleVisualize} disabled={loading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <Play size={16} fill="currentColor" /> {loading ? 'Executing...' : 'Visualize Execution'}
            </button>
          </div>
        </div>

        {/* Right pane: Execution Visualization */}
        <div className="glass-panel" style={{ 
          flex: isExpanded ? 3 : 1.8, 
          padding: '1.2rem', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '1rem',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.3s ease'
        }}>
          {/* Controls header for visualization */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '0.8rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-accent)', letterSpacing: '0.05em' }}>
                {engine === 'pythontutor' ? 'Python Tutor Execution View' : 'Local Tracing Panel'}
              </span>
              <a 
                href={`https://pythontutor.com/visualize.html#code=${encodeURIComponent(code)}&cumulative=false&py=3`} 
                target="_blank" 
                rel="noreferrer" 
                title="Open in pythonTutor.com website directly"
                style={{ color: '#64748b', display: 'flex', alignItems: 'center', marginLeft: '0.5rem', hover: { color: 'white' } }}
              >
                <ExternalLink size={14} />
              </a>
            </div>

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--glass-border)',
                borderRadius: '6px',
                padding: '0.3rem 0.6rem',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                fontSize: '0.75rem'
              }}
            >
              {isExpanded ? (
                <>
                  <Minimize2 size={12} /> Standard View
                </>
              ) : (
                <>
                  <Maximize2 size={12} /> Expand View
                </>
              )}
            </button>
          </div>

          {/* Main visual display container */}
          <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            
            {/* 1. Python Tutor Engine */}
            {engine === 'pythontutor' && (
              <div style={{ width: '100%', height: '100%', position: 'relative', display: 'flex', flexDirection: 'column', flex: 1 }}>
                {iframeLoading && (
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(15, 23, 42, 0.95)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '1rem',
                    zIndex: 20,
                    borderRadius: '8px'
                  }}>
                    <div className="spinner" style={{
                      width: '40px',
                      height: '40px',
                      border: '3px solid rgba(56, 189, 248, 0.2)',
                      borderTop: '3px solid var(--text-accent)',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                    <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Generating execution diagram...</span>
                  </div>
                )}
                
                <iframe 
                  src={iframeUrl} 
                  width="100%" 
                  height="100%" 
                  frameBorder="0"
                  onLoad={() => setIframeLoading(false)}
                  style={{ borderRadius: '8px', background: 'white', flex: 1 }}
                  sandbox="allow-scripts allow-same-origin"
                />

                <style>{`
                  @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                  }
                `}</style>
              </div>
            )}

            {/* 2. Native Tracer Engine */}
            {engine === 'native' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%', overflowY: 'auto' }}>
                {error && (
                  <div style={{ 
                    background: 'rgba(239, 68, 68, 0.1)', 
                    border: '1px solid rgba(239, 68, 68, 0.2)', 
                    borderRadius: '8px', 
                    padding: '1rem', 
                    color: '#ef4444',
                    display: 'flex',
                    gap: '0.5rem',
                    alignItems: 'center'
                  }}>
                    <AlertCircle size={18} />
                    <span>{error}</span>
                  </div>
                )}

                {steps.length === 0 && !error && !loading && (
                  <div style={{ 
                    flex: 1, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    color: '#64748b', 
                    gap: '0.8rem',
                    padding: '3rem 1rem',
                    textAlign: 'center'
                  }}>
                    <Info size={36} style={{ color: '#475569' }} />
                    <div>
                      <p style={{ fontWeight: 600, color: '#94a3b8', marginBottom: '0.2rem' }}>No trace active</p>
                      <p style={{ fontSize: '0.85rem', maxWidth: '300px' }}>Click "Visualize Execution" to run local step-by-step trace.</p>
                    </div>
                  </div>
                )}

                {loading && (
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', gap: '0.5rem' }}>
                    <span>Running trace on backend...</span>
                  </div>
                )}

                {steps.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
                    {/* Native Tracer Controls */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.2)', padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid var(--glass-border)' }}>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button 
                          className="btn-primary" 
                          style={{ padding: '0.35rem 0.7rem', fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--glass-border)', boxShadow: 'none' }}
                          onClick={() => setCurrentStepIndex(0)}
                          disabled={currentStepIndex === 0}
                        >
                          First
                        </button>
                        <button 
                          className="btn-primary" 
                          style={{ padding: '0.35rem 0.7rem', fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--glass-border)', boxShadow: 'none' }}
                          onClick={() => setCurrentStepIndex(prev => Math.max(0, prev - 1))}
                          disabled={currentStepIndex === 0}
                        >
                          Prev
                        </button>
                        <button 
                          className="btn-primary" 
                          style={{ padding: '0.35rem 0.7rem', fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--glass-border)', boxShadow: 'none' }}
                          onClick={() => setCurrentStepIndex(prev => Math.min(steps.length - 1, prev + 1))}
                          disabled={currentStepIndex === steps.length - 1}
                        >
                          Next
                        </button>
                        <button 
                          className="btn-primary" 
                          style={{ padding: '0.35rem 0.7rem', fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--glass-border)', boxShadow: 'none' }}
                          onClick={() => setCurrentStepIndex(steps.length - 1)}
                          disabled={currentStepIndex === steps.length - 1}
                        >
                          Last
                        </button>
                      </div>
                      
                      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.8rem', marginLeft: '1rem' }}>
                        <input 
                          type="range" 
                          min={0} 
                          max={steps.length - 1} 
                          value={currentStepIndex} 
                          onChange={(e) => setCurrentStepIndex(Number(e.target.value))}
                          style={{ flex: 1, height: '4px', cursor: 'pointer' }}
                        />
                        <span style={{ fontSize: '0.8rem', color: '#94a3b8', minWidth: '85px', textAlign: 'right' }}>
                          Step {currentStepIndex + 1} of {steps.length}
                        </span>
                      </div>
                    </div>

                    {/* Split: Code Highlight vs Call Stack */}
                    <div style={{ display: 'flex', gap: '1rem', flex: 1, minHeight: '300px' }}>
                      {/* Code Execution Viewer */}
                      <div style={{ flex: 1.5, background: 'rgba(0,0,0,0.15)', border: '1px solid var(--glass-border)', borderRadius: '8px', padding: '0.8rem', overflowY: 'auto' }}>
                        <div style={{ fontFamily: "JetBrains Mono, Fira Code, Consolas, Monaco, monospace", fontSize: '12px', lineHeight: '1.5rem', whiteSpace: 'pre' }}>
                          {codeLines.map((lineText, idx) => {
                            const isCurrentLine = steps[currentStepIndex]?.line === idx + 1
                            return (
                              <div 
                                key={idx} 
                                style={{ 
                                  display: 'flex', 
                                  background: isCurrentLine ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                                  borderLeft: isCurrentLine ? '3px solid var(--text-accent)' : '3px solid transparent',
                                  paddingLeft: '0.4rem'
                                }}
                              >
                                <span style={{ width: '2rem', color: isCurrentLine ? 'var(--text-accent)' : '#475569', userSelect: 'none', textAlign: 'right', marginRight: '0.6rem' }}>
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

                      {/* Frame Variables View */}
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.8rem', overflowY: 'auto' }}>
                        {steps[currentStepIndex]?.stack && steps[currentStepIndex].stack.map((frame: any, idx: number) => (
                          <div key={idx} style={{ 
                            border: '1px solid var(--glass-border)', 
                            borderRadius: '6px', 
                            background: 'rgba(0,0,0,0.25)'
                          }}>
                            <div style={{ 
                              background: 'rgba(56, 189, 248, 0.08)', 
                              padding: '0.4rem 0.6rem', 
                              fontSize: '0.8rem', 
                              fontWeight: 600,
                              color: 'var(--text-accent)',
                              borderBottom: '1px solid var(--glass-border)',
                              display: 'flex',
                              justifyContent: 'space-between'
                            }}>
                              <span>{frame.name === '<module>' ? 'Global Scope' : `${frame.name}()`}</span>
                              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>line {frame.line}</span>
                            </div>
                            <div style={{ padding: '0.5rem 0.6rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                              {Object.keys(frame.variables).length === 0 ? (
                                <span style={{ color: '#475569', fontSize: '0.75rem', fontStyle: 'italic' }}>No variables</span>
                              ) : (
                                Object.entries(frame.variables).map(([name, val]: any) => (
                                  <div key={name} style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'monospace', fontSize: '0.75rem' }}>
                                    <span style={{ color: '#f43f5e' }}>{name}</span>
                                    <span style={{ color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '120px' }} title={String(val)}>
                                      {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                                    </span>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Standard Output Console */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Standard Output (stdout)</span>
                      <pre style={{ 
                        background: 'rgba(0, 0, 0, 0.4)', 
                        padding: '0.6rem 0.8rem', 
                        borderRadius: '6px', 
                        fontFamily: 'monospace', 
                        fontSize: '12px', 
                        color: '#10b981',
                        minHeight: '50px',
                        maxHeight: '100px',
                        overflowY: 'auto',
                        margin: 0,
                        whiteSpace: 'pre-wrap',
                        border: '1px solid var(--glass-border)'
                      }}>{steps[currentStepIndex]?.output || 'No output printed.'}</pre>
                    </div>

                    {/* Trace Runtime Errors */}
                    {steps[currentStepIndex]?.error && (
                      <div style={{ 
                        background: 'rgba(239, 68, 68, 0.08)', 
                        border: '1px solid rgba(239, 68, 68, 0.2)', 
                        borderRadius: '6px', 
                        padding: '0.8rem',
                        color: '#fca5a5'
                      }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#ef4444', display: 'block', marginBottom: '0.2rem' }}>Runtime Error:</span>
                        <pre style={{ fontFamily: 'monospace', fontSize: '0.75rem', margin: 0 }}>{steps[currentStepIndex].error}</pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
