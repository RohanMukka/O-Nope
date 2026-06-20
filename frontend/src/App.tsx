import { useState } from 'react'
import { Video, TerminalSquare, MessageCircle, Activity, Code2 } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import InterviewMode from './components/InterviewMode'
import ThinkOutLoudMode from './components/ThinkOutLoudMode'
import CodeRoastMode from './components/CodeRoastMode'
import CodeVisualizerMode from './components/CodeVisualizerMode'
import Dashboard from './components/Dashboard'
import { GlobalProvider } from './GlobalState'
import './index.css'
import './App.css'

function AppContent() {
  const [activeMode, setActiveMode] = useState('dashboard')

  const renderContent = () => {
    switch (activeMode) {
      case 'dashboard':
        return <Dashboard setActiveMode={setActiveMode} />
      case 'interview':
        return <InterviewMode />
      case 'think':
        return <ThinkOutLoudMode />
      case 'roast':
        return <CodeRoastMode />
      case 'visualize':
        return <CodeVisualizerMode />
      default:
        return <Dashboard setActiveMode={setActiveMode} />
    }
  }

  return (
    <div className="app-container">
      <div className="sidebar">
        <div style={{ marginBottom: '2rem' }}>
          <h1 className="glitch-text" data-text="O(Nope)" style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-accent)', letterSpacing: '-0.05em', lineHeight: 1 }}>
            O(Nope)
          </h1>
        </div>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '3rem' }}>
          {[
            { id: 'dashboard', icon: Activity, label: 'DASHBOARD' },
            { id: 'visualize', icon: Code2, label: 'FORENSIC VISUALIZER' },
            { id: 'roast', icon: TerminalSquare, label: 'THE CODE ROAST' },
            { id: 'think', icon: MessageCircle, label: 'THINK OUT LOUD' },
            { id: 'interview', icon: Video, label: 'LIVE INTERVIEW' },
          ].map(item => {
            const isActive = activeMode === item.id;
            return (
              <motion.div 
                key={item.id}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setActiveMode(item.id)}
                whileHover={{ x: 10, backgroundColor: 'rgba(255,42,42,0.1)' }}
                whileTap={{ scale: 0.95 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem',
                  cursor: 'pointer',
                  borderLeft: isActive ? '3px solid var(--text-accent)' : '3px solid transparent',
                  background: isActive ? 'rgba(255, 42, 42, 0.1)' : 'transparent',
                  color: isActive ? '#fff' : '#888',
                  textTransform: 'uppercase',
                  fontWeight: isActive ? 700 : 500,
                  transition: 'background 0.2s, color 0.2s',
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: isActive ? '0 4px 4px 0' : '4px'
                }}
              >
                {isActive && (
                  <motion.div 
                    layoutId="active-nav-bg"
                    style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(255,42,42,0.2) 0%, transparent 100%)', zIndex: 0 }}
                  />
                )}
                <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <motion.div
                    animate={isActive ? { scale: [1, 1.2, 1], filter: ['drop-shadow(0 0 0px var(--text-accent))', 'drop-shadow(0 0 10px var(--text-accent))', 'drop-shadow(0 0 0px var(--text-accent))'] } : {}}
                    transition={{ repeat: Infinity, duration: 2 }}
                    style={{ display: 'flex' }}
                  >
                    <item.icon size={20} color={isActive ? "var(--text-accent)" : "#888"} />
                  </motion.div>
                  <span>{item.label}</span>
                </div>
              </motion.div>
            )
          })}
        </nav>
        <div style={{ marginTop: 'auto', padding: '1.5rem', background: 'rgba(255, 0, 60, 0.05)', borderRadius: '0', border: '1px solid rgba(255, 0, 60, 0.2)', textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: '#666', textTransform: 'uppercase', marginBottom: '0.5rem', fontWeight: 700 }}>SESSION STATUS</div>
          <div className="font-mono" style={{ color: 'var(--text-accent)', fontSize: '0.85rem', fontWeight: 'bold' }}>
            CONNECTED
            <span className="blink">_</span>
          </div>
        </div>
      </div>
      
      <div className="main-content" style={{ position: 'relative' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeMode}
            initial={{ opacity: 0, x: 20, filter: 'blur(4px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, x: -20, filter: 'blur(4px)' }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            style={{ height: '100%' }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <GlobalProvider>
      <AppContent />
    </GlobalProvider>
  )
}
