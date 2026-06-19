import { useState } from 'react'

export default function VisualizerMode() {
  const [code, setCode] = useState(`def fib(n):\n    if n<=1: return n\n    return fib(n-1) + fib(n-2)\n\nfib(4)`)
  const [iframeUrl, setIframeUrl] = useState('')

  const handleVisualize = () => {
    if (!code.trim()) return
    const encodedCode = encodeURIComponent(code)
    const url = `https://pythontutor.com/iframe-embed.html#code=${encodedCode}&cumulative=false&py=3&curInstr=0`
    setIframeUrl(url)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
      <div>
        <h2 style={{ marginBottom: '0.5rem' }}>Python Visualizer</h2>
        <p style={{ color: '#94a3b8' }}>Visualize your Python execution step-by-step.</p>
      </div>
      
      <div className="glass-panel" style={{ padding: '1rem' }}>
        <textarea 
          rows={6}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          style={{ marginBottom: '1rem', fontFamily: 'monospace' }}
        />
        <button className="btn-primary" onClick={handleVisualize}>
          Visualize Execution
        </button>
      </div>

      {iframeUrl && (
        <div className="glass-panel" style={{ flex: 1, overflow: 'hidden' }}>
          <iframe 
            src={iframeUrl} 
            width="100%" 
            height="100%" 
            frameBorder="0"
            style={{ borderRadius: '12px' }}
          />
        </div>
      )}
    </div>
  )
}
