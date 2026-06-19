import { useState } from 'react'
import { Video, Mic, TerminalSquare, Eye, MessageCircle } from 'lucide-react'
import InterviewMode from './components/InterviewMode'
import ThinkOutLoudMode from './components/ThinkOutLoudMode'
import VisualizerMode from './components/VisualizerMode'
import CodeRoastMode from './components/CodeRoastMode'
import './index.css'

function App() {
  const [activeMode, setActiveMode] = useState('interview')

  const renderContent = () => {
    switch (activeMode) {
      case 'interview':
        return <InterviewMode />
      case 'think':
        return <ThinkOutLoudMode />
      case 'roast':
        return <CodeRoastMode />
      case 'visualizer':
        return <VisualizerMode />
      default:
        return <div>Select a mode</div>
    }
  }

  return (
    <div className="app-container">
      <div className="sidebar glass-panel">
        <div>
          <h1 style={{ color: 'var(--text-accent)' }}>O(Nope) 🔥</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.5rem' }}>Your brutally honest AI coding coach.</p>
        </div>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '2rem' }}>
          <div 
            className={`nav-item ${activeMode === 'interview' ? 'active' : ''}`}
            onClick={() => setActiveMode('interview')}
          >
            <Video size={18} /> Live Video Interview
          </div>
          <div 
            className={`nav-item ${activeMode === 'think' ? 'active' : ''}`}
            onClick={() => setActiveMode('think')}
          >
            <MessageCircle size={18} /> Think Out Loud
          </div>
          <div 
            className={`nav-item ${activeMode === 'roast' ? 'active' : ''}`}
            onClick={() => setActiveMode('roast')}
          >
            <TerminalSquare size={18} /> The Code Roast
          </div>
          <div 
            className={`nav-item ${activeMode === 'visualizer' ? 'active' : ''}`}
            onClick={() => setActiveMode('visualizer')}
          >
            <Eye size={18} /> Python Visualizer
          </div>
        </nav>
      </div>
      
      <div className="main-content">
        {renderContent()}
      </div>
    </div>
  )
}

export default App
