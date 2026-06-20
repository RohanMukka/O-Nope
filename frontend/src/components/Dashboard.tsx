import { useGlobalState } from '../GlobalState'
import { motion } from 'framer-motion'
import { Activity, ShieldAlert, TrendingDown } from 'lucide-react'

export default function Dashboard({ setActiveMode }: { setActiveMode: (mode: string) => void }) {
  const { score, loading, resetProfile } = useGlobalState()

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
        <div className="glass-panel" style={{ flex: 1, padding: '2rem', textAlign: 'center', borderTop: `4px solid ${score < 50 ? 'var(--danger-color)' : 'var(--text-success)'}`, position: 'relative', overflow: 'hidden' }}>
          {score < 50 && <div className="noise-overlay" style={{ opacity: 0.1 }}></div>}
          <h3 style={{ color: '#888', textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '0.2em', fontWeight: 900 }}>Ego Score</h3>
          <div className={score < 50 ? 'glitch-text' : ''} data-text={score.toFixed(1)} style={{ fontSize: '5rem', fontWeight: 900, color: score < 50 ? 'var(--danger-color)' : 'var(--text-success)', textShadow: score < 50 ? 'var(--neon-glow)' : 'none', letterSpacing: '-0.05em' }}>
            {score.toFixed(1)}
          </div>
          <p style={{ color: '#666', marginTop: '1rem', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase' }}>Starts at 100. Let's see how fast you drop to 0.</p>
          <button 
            className="cyber-button" 
            onClick={resetProfile}
            style={{ 
              marginTop: '1.5rem', 
              fontSize: '0.75rem', 
              padding: '0.5rem 1rem'
            }}
          >
            RESET SYSTEM
          </button>
        </div>

        <div className="glass-panel" style={{ flex: 2, padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ color: 'var(--text-warning)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 900, letterSpacing: '0.1em' }}>
            <TrendingDown size={20} />
            Immediate Threats
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', height: '100%' }}>
            <button className="cyber-button" onClick={() => setActiveMode('roast')} style={{ padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
              <ShieldAlert size={32} />
              <span style={{ fontSize: '0.85rem' }}>THE CODE ROAST</span>
            </button>
            <button className="cyber-button" onClick={() => setActiveMode('interview')} style={{ padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
              <Activity size={32} />
              <span style={{ fontSize: '0.85rem' }}>LIVE INTERVIEW</span>
            </button>
            <button className="cyber-button" onClick={() => setActiveMode('think')} style={{ padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
              <ShieldAlert size={32} />
              <span style={{ fontSize: '0.85rem' }}>THINK OUT LOUD</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
