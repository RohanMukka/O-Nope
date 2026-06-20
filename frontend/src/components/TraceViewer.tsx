import { useState, useEffect } from 'react'

export default function TraceViewer({ steps, onStepChange }: { steps: any[], onStepChange?: (line: number) => void }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)

  useEffect(() => {
    if (steps && steps.length > 0 && onStepChange) {
      onStepChange(steps[currentStepIndex]?.line || 0)
    }
  }, [currentStepIndex, steps, onStepChange])

  if (!steps || steps.length === 0) return null

  return (
    <div style={{ marginTop: '2rem', borderTop: '2px solid #333', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 className="glitch-text" style={{ color: 'var(--text-warning)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }} data-text="[ FORENSIC EXECUTION TRACE ]">[ FORENSIC EXECUTION TRACE ]</h4>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#050505', padding: '0.8rem 1rem', border: '1px solid var(--text-warning)', boxShadow: 'inset 0 0 10px rgba(255, 176, 0, 0.1)' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="cyber-button" style={{ padding: '0.35rem 0.7rem', fontSize: '0.75rem' }} onClick={() => setCurrentStepIndex(0)} disabled={currentStepIndex === 0}>|&lt;</button>
          <button className="cyber-button" style={{ padding: '0.35rem 0.7rem', fontSize: '0.75rem' }} onClick={() => setCurrentStepIndex(prev => Math.max(0, prev - 1))} disabled={currentStepIndex === 0}>&lt; PREV</button>
          <button className="cyber-button" style={{ padding: '0.35rem 0.7rem', fontSize: '0.75rem' }} onClick={() => setCurrentStepIndex(prev => Math.min(steps.length - 1, prev + 1))} disabled={currentStepIndex === steps.length - 1}>NEXT &gt;</button>
          <button className="cyber-button" style={{ padding: '0.35rem 0.7rem', fontSize: '0.75rem' }} onClick={() => setCurrentStepIndex(steps.length - 1)} disabled={currentStepIndex === steps.length - 1}>&gt;|</button>
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.8rem', marginLeft: '1rem' }}>
          <input type="range" min={0} max={steps.length - 1} value={currentStepIndex} onChange={(e) => setCurrentStepIndex(Number(e.target.value))} style={{ flex: 1 }} />
          <span style={{ fontSize: '0.8rem', color: '#888' }}>STEP {currentStepIndex + 1}/{steps.length}</span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '1rem', minHeight: '300px' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto' }}>
          {steps[currentStepIndex]?.stack && steps[currentStepIndex].stack.map((frame: any, idx: number) => (
            <div key={idx} style={{ border: '1px solid var(--text-warning)', background: '#000' }}>
              <div style={{ background: '#111', padding: '0.6rem 0.8rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-warning)', textTransform: 'uppercase' }}>
                {frame.name === '<module>' ? 'GLOBAL SCOPE' : `${frame.name}()`} - LINE:{frame.line}
              </div>
              <div style={{ padding: '0.5rem 0.6rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {Object.keys(frame.variables).length === 0 ? <span style={{ color: '#444', fontSize: '0.75rem', fontStyle: 'italic' }}>[NO VARS]</span> : Object.entries(frame.variables).map(([name, val]: any) => (
                  <div key={name} style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'Space Mono, monospace', fontSize: '0.85rem', padding: '0.2rem 0' }}>
                    <span style={{ color: 'var(--text-warning)' }}>{name}</span>
                    <span style={{ color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '300px' }} title={String(val)}>{typeof val === 'object' ? JSON.stringify(val) : String(val)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {steps[currentStepIndex]?.output && (
             <div style={{ background: '#000', border: '1px solid var(--text-success)', padding: '0.8rem', boxShadow: 'inset 0 0 10px rgba(0,255,65,0.1)' }}>
               <span style={{ fontSize: '0.85rem', color: 'var(--text-success)', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>[ STDOUT ]</span>
               <pre style={{ fontFamily: 'Space Mono, monospace', fontSize: '13px', color: 'var(--text-success)', margin: 0 }}>{steps[currentStepIndex].output}</pre>
             </div>
          )}
          {steps[currentStepIndex]?.error && (
             <div className="glitch-text" data-text="[ EXCEPTION ]" style={{ background: '#000', border: '1px solid var(--danger-color)', padding: '0.8rem', boxShadow: 'inset 0 0 10px rgba(255,0,60,0.1)' }}>
               <span style={{ fontSize: '0.85rem', color: 'var(--danger-color)', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>[ EXCEPTION ]</span>
               <pre style={{ fontFamily: 'Space Mono, monospace', fontSize: '13px', color: 'var(--danger-color)', margin: 0, fontWeight: 'bold', whiteSpace: 'pre-wrap' }}>{steps[currentStepIndex].error}</pre>
             </div>
          )}
        </div>
      </div>
    </div>
  )
}
