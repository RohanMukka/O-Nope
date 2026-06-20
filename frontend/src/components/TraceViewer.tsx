import { useState } from 'react'

export default function TraceViewer({ steps, codeLines }: { steps: any[], codeLines: string[] }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)

  if (!steps || steps.length === 0) return null

  return (
    <div style={{ marginTop: '2rem', borderTop: '2px solid #333', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <h4 style={{ color: 'var(--text-accent)', textTransform: 'uppercase' }}>[ EXECUTION TRACE ]</h4>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#000', padding: '0.6rem 0.8rem', border: '2px solid var(--glass-border)' }}>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button className="btn-primary" style={{ padding: '0.35rem 0.7rem', fontSize: '0.75rem', background: '#222', color: 'white' }} onClick={() => setCurrentStepIndex(0)} disabled={currentStepIndex === 0}>|&lt;</button>
          <button className="btn-primary" style={{ padding: '0.35rem 0.7rem', fontSize: '0.75rem', background: '#222', color: 'white' }} onClick={() => setCurrentStepIndex(prev => Math.max(0, prev - 1))} disabled={currentStepIndex === 0}>&lt; PREV</button>
          <button className="btn-primary" style={{ padding: '0.35rem 0.7rem', fontSize: '0.75rem', background: '#222', color: 'white' }} onClick={() => setCurrentStepIndex(prev => Math.min(steps.length - 1, prev + 1))} disabled={currentStepIndex === steps.length - 1}>NEXT &gt;</button>
          <button className="btn-primary" style={{ padding: '0.35rem 0.7rem', fontSize: '0.75rem', background: '#222', color: 'white' }} onClick={() => setCurrentStepIndex(steps.length - 1)} disabled={currentStepIndex === steps.length - 1}>&gt;|</button>
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.8rem', marginLeft: '1rem' }}>
          <input type="range" min={0} max={steps.length - 1} value={currentStepIndex} onChange={(e) => setCurrentStepIndex(Number(e.target.value))} style={{ flex: 1 }} />
          <span style={{ fontSize: '0.8rem', color: '#888' }}>STEP {currentStepIndex + 1}/{steps.length}</span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '1rem', minHeight: '200px' }}>
        <div style={{ flex: 1.5, background: '#000', border: '2px solid var(--glass-border)', padding: '0.8rem', overflowY: 'auto' }}>
          <div style={{ fontFamily: "Space Mono, monospace", fontSize: '12px', lineHeight: '1.5rem', whiteSpace: 'pre' }}>
            {codeLines.map((lineText, idx) => {
              const isCurrentLine = steps[currentStepIndex]?.line === idx + 1
              return (
                <div key={idx} style={{ background: isCurrentLine ? 'rgba(255, 42, 42, 0.15)' : 'transparent', borderLeft: isCurrentLine ? '4px solid var(--text-accent)' : '4px solid transparent', paddingLeft: '0.4rem' }}>
                  <span style={{ width: '2rem', color: isCurrentLine ? 'var(--text-accent)' : '#444', display: 'inline-block', textAlign: 'right', marginRight: '0.6rem' }}>{idx + 1}</span>
                  <span style={{ color: isCurrentLine ? 'white' : '#aaa' }}>{lineText || ' '}</span>
                </div>
              )
            })}
          </div>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.8rem', overflowY: 'auto' }}>
          {steps[currentStepIndex]?.stack && steps[currentStepIndex].stack.map((frame: any, idx: number) => (
            <div key={idx} style={{ border: '2px solid var(--glass-border)', background: '#000' }}>
              <div style={{ background: '#111', padding: '0.4rem 0.6rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-accent)' }}>
                {frame.name === '<module>' ? 'GLOBAL SCOPE' : `${frame.name}()`} - L:{frame.line}
              </div>
              <div style={{ padding: '0.5rem 0.6rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {Object.keys(frame.variables).length === 0 ? <span style={{ color: '#444', fontSize: '0.75rem' }}>NO VARS</span> : Object.entries(frame.variables).map(([name, val]: any) => (
                  <div key={name} style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'Space Mono, monospace', fontSize: '0.75rem' }}>
                    <span style={{ color: '#ffaaaa' }}>{name}</span>
                    <span style={{ color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '120px' }} title={String(val)}>{typeof val === 'object' ? JSON.stringify(val) : String(val)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {steps[currentStepIndex]?.output && (
             <div style={{ background: '#000', border: '2px solid var(--glass-border)', padding: '0.5rem' }}>
               <span style={{ fontSize: '0.75rem', color: '#888', fontWeight: 600 }}>[ STDOUT ]</span>
               <pre style={{ fontFamily: 'Space Mono, monospace', fontSize: '11px', color: 'var(--text-success)', margin: 0 }}>{steps[currentStepIndex].output}</pre>
             </div>
          )}
          {steps[currentStepIndex]?.error && (
             <div style={{ background: '#000', border: '2px solid var(--danger-color)', padding: '0.5rem' }}>
               <span style={{ fontSize: '0.75rem', color: 'var(--danger-color)', fontWeight: 600 }}>[ EXCEPTION ]</span>
               <pre style={{ fontFamily: 'Space Mono, monospace', fontSize: '11px', color: 'var(--danger-color)', margin: 0 }}>{steps[currentStepIndex].error}</pre>
             </div>
          )}
        </div>
      </div>
    </div>
  )
}
