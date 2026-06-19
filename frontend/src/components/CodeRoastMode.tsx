import { useState } from 'react'

export default function CodeRoastMode() {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [roast, setRoast] = useState('')
  const [errors, setErrors] = useState<string[]>([])

  const handleRoast = async () => {
    if (!code.trim()) return
    setLoading(true)
    setRoast('')
    setErrors([])
    
    try {
      const formData = new FormData()
      formData.append('code', code)
      
      const res = await fetch('http://localhost:8000/api/roast', {
        method: 'POST',
        body: formData
      })
      
      const data = await res.json()
      setRoast(data.roast)
      setErrors(data.errors)
    } catch (err) {
      setRoast('Error connecting to the backend API.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
      <div>
        <h2 style={{ marginBottom: '0.5rem' }}>The Code Roast</h2>
        <p style={{ color: '#94a3b8' }}>Submit your code to static analysis and get brutally roasted.</p>
      </div>
      
      <div className="glass-panel" style={{ padding: '1rem' }}>
        <textarea 
          rows={8}
          placeholder="Paste your python code here..."
          value={code}
          onChange={(e) => setCode(e.target.value)}
          style={{ marginBottom: '1rem', fontFamily: 'monospace' }}
        />
        <button className="btn-primary" onClick={handleRoast} disabled={loading}>
          {loading ? 'Analyzing...' : 'Roast Me'}
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
          
          <div>
            <h3 style={{ color: '#eab308', marginBottom: '1rem' }}>The Roast:</h3>
            <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{roast}</p>
          </div>
        </div>
      )}
    </div>
  )
}
