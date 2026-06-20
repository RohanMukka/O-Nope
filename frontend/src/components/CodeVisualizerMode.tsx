import { useState, useRef } from 'react'
import { Loader2, Terminal, Code2 } from 'lucide-react'
import Editor from '@monaco-editor/react'
import { motion } from 'framer-motion'
import TraceViewer from './TraceViewer'

export default function CodeVisualizerMode() {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [visualizerSteps, setVisualizerSteps] = useState<any[]>([])
  const [error, setError] = useState('')
  
  const editorRef = useRef<any>(null)
  const decorationsRef = useRef<any>(null)
  const monacoRef = useRef<any>(null)

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor
    monacoRef.current = monaco
    decorationsRef.current = editor.createDecorationsCollection([])
  }

  const handleTraceStepChange = (line: number) => {
    if (!editorRef.current || !decorationsRef.current || !monacoRef.current) return
    if (line > 0) {
      decorationsRef.current.set([{
        range: new monacoRef.current.Range(line, 1, line, 1),
        options: {
          isWholeLine: true,
          className: 'monaco-line-highlight'
        }
      }])
      editorRef.current.revealLineInCenterIfOutsideViewport(line)
    } else {
      decorationsRef.current.clear()
    }
  }

  const handleVisualize = async () => {
    if (!code.trim()) return
    setLoading(true)
    setVisualizerSteps([])
    setError('')
    
    try {
      const formData = new FormData()
      formData.append('code', code)
      
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/visualize`, { method: 'POST', body: formData })
      const data = await res.json()
      if (data.error) {
        setError(data.error)
      } else if (data.steps) {
        setVisualizerSteps(data.steps)
      }
    } catch (e) {
      console.error(e)
      setError("Failed to communicate with execution server.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div 
      style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="glitch-hover" style={{ marginBottom: '0.2rem', color: 'var(--text-accent)', display: 'flex', alignItems: 'center', gap: '0.5rem', textTransform: 'uppercase', fontWeight: 900 }}>
            <Code2 size={24} /> FORENSIC VISUALIZER
          </h2>
          <p style={{ color: '#888', fontStyle: 'italic' }}>Step through execution and watch your memory leak in real-time.</p>
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
              <span className="font-mono" style={{ marginLeft: '1rem', color: 'var(--text-warning)', fontSize: '0.75rem', fontWeight: 'bold' }}>source.py</span>
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
                onMount={handleEditorDidMount}
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
            onClick={handleVisualize} 
            disabled={loading || !code.trim()}
          >
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <Loader2 className="animate-spin" /> INJECTING TRACER...
              </div>
            ) : 'INITIATE FORENSIC TRACE'}
          </button>
        </div>

        {/* Right Panel: Trace Viewer */}
        <div className="glass-panel" style={{ flex: 1, padding: '2rem', overflowY: 'auto', borderTop: '4px solid var(--text-warning)', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {error ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '1rem', color: 'var(--text-accent)' }}>
              <Terminal size={48} />
              <div className="font-mono" style={{ textAlign: 'center', fontSize: '0.85rem' }}>
                <p style={{ fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.5rem', color: 'var(--text-accent)' }}>Tracer Error</p>
                <p style={{ color: '#aaa', wordBreak: 'break-word' }}>{error}</p>
              </div>
            </div>
          ) : visualizerSteps.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', opacity: 0.4, gap: '1rem' }}>
              <Terminal size={48} color="var(--text-warning)" />
              <div className="font-mono" style={{ textAlign: 'center', color: '#888', fontSize: '0.85rem' }}>
                <p>SYSTEM IDLE.</p>
                <p>AWAITING TRACER INITIATION...</p>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <TraceViewer steps={visualizerSteps} onStepChange={handleTraceStepChange} />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
