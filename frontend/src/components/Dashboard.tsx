import { useGlobalState } from '../GlobalState'
import { motion } from 'framer-motion'
import { Activity, ShieldAlert, TrendingDown } from 'lucide-react'

export default function Dashboard({ setActiveMode }: { setActiveMode: (mode: string) => void }) {
  const { score, logs, loading } = useGlobalState()

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-accent)' }}>
        Loading System Profile...
      </div>
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '2rem', height: '100%', overflowY: 'auto', paddingRight: '1rem' }}
    >
      <div>
        <h2 className="glitch-hover" style={{ color: 'var(--text-accent)', display: 'flex', alignItems: 'center', gap: '0.5rem', textTransform: 'uppercase' }}>
          <Activity size={28} />
          DEVELOPER DASHBOARD
        </h2>
        <p style={{ color: '#888', fontStyle: 'italic', marginTop: '0.5rem' }}>Your persistent record of inadequacy.</p>
      </div>

      <div style={{ display: 'flex', gap: '2rem' }}>
        <div className="glass-panel" style={{ flex: 1, padding: '2rem', textAlign: 'center', borderTop: '4px solid ' + (score < 50 ? 'var(--danger-color)' : 'var(--text-success)') }}>
          <h3 style={{ color: '#888', textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '0.1em' }}>Current Ego Score</h3>
          <div style={{ fontSize: '4rem', fontWeight: 900, color: score < 50 ? 'var(--danger-color)' : 'var(--text-success)', textShadow: '0 0 20px rgba(255, 42, 42, 0.3)' }}>
            {score.toFixed(1)}
          </div>
          <p style={{ color: '#666', marginTop: '1rem', fontSize: '0.9rem' }}>Starts at 100. Let's see how fast you can hit 0.</p>
        </div>

        <div className="glass-panel" style={{ flex: 2, padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ color: 'var(--text-warning)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingDown size={20} />
            Quick Assessment
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', height: '100%' }}>
            <button className="btn-primary" onClick={() => setActiveMode('roast')} style={{ padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <ShieldAlert size={24} />
              <span>THE CODE ROAST</span>
            </button>
            <button className="btn-primary" onClick={() => setActiveMode('interview')} style={{ padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <ShieldAlert size={24} />
              <span>LIVE INTERVIEW</span>
            </button>
            <button className="btn-primary" onClick={() => setActiveMode('think')} style={{ padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <ShieldAlert size={24} />
              <span>THINK OUT LOUD</span>
            </button>
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h3 style={{ color: 'var(--text-accent)', textTransform: 'uppercase', borderBottom: '1px solid #333', paddingBottom: '0.5rem' }}>Recent Trauma Log</h3>
        {logs.length === 0 ? (
          <p style={{ color: '#666', fontStyle: 'italic', textAlign: 'center', padding: '2rem' }}>No trauma recorded yet. Are you too scared to start?</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {logs.map((log, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0a0a0a', padding: '1rem', borderLeft: '3px solid var(--danger-color)' }}>
                <div>
                  <span style={{ color: '#888', fontSize: '0.8rem', textTransform: 'uppercase', marginRight: '1rem' }}>[{log.mode}]</span>
                  <span style={{ color: '#ddd' }}>{log.details}</span>
                </div>
                <span style={{ color: '#555', fontSize: '0.8rem', fontFamily: 'monospace' }}>
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}
