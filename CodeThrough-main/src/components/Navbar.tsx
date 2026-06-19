import { Play, ChevronDown, Github } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import type { AlgorithmTemplate } from '../types';

interface NavbarProps {
  onRun: () => void;
  templates: AlgorithmTemplate[];
  onSelectTemplate: (template: AlgorithmTemplate) => void;
}

export default function Navbar({ onRun, templates, onSelectTemplate }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as HTMLElement)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const categories = [...new Set(templates.map((t) => t.category))];

  return (
    <div className="px-5 py-3 border-b border-[#1A1A1A] flex justify-between items-center bg-transparent z-20">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-[#fff]">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
          </svg>
          <span className="font-semibold tracking-tight text-sm">CodeThrough</span>
        </div>

        <div className="w-px h-4 bg-[#222]" />

        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[#999] hover:text-[#EDEDED] text-xs font-medium transition-colors rounded hover:bg-[#1A1A1A]"
          >
            Templates
            <ChevronDown
              size={12}
              className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {isOpen && (
            <div className="absolute top-full left-0 mt-1 w-72 bg-[#0A0A0A] border border-[#222] rounded-lg shadow-2xl z-[100] max-h-[400px] overflow-auto custom-scrollbar">
              {categories.map((cat) => (
                <div key={cat}>
                  <div className="px-3 py-2 text-[9px] uppercase tracking-[0.2em] text-[#555] font-semibold border-b border-[#1A1A1A] bg-[#060606] sticky top-0">
                    {cat}
                  </div>
                  {templates
                    .filter((t) => t.category === cat)
                    .map((t) => (
                      <button
                        key={t.name}
                        onClick={() => {
                          onSelectTemplate(t);
                          setIsOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-[#1A1A1A] transition-colors"
                      >
                        <div className="text-xs text-[#EDEDED] font-medium">{t.name}</div>
                        <div className="text-[10px] text-[#555] mt-0.5">{t.description}</div>
                      </button>
                    ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <a
          href="https://github.com/RohanMukka/CodeThrough"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#444] hover:text-[#999] transition-colors"
          title="View on GitHub"
        >
          <Github size={14} />
        </a>
        <span className="text-[10px] text-[#444] font-mono hidden sm:block">
          Cmd+Enter
        </span>
        <button
          onClick={onRun}
          className="flex items-center gap-2 px-3 py-1.5 bg-[#EDEDED] text-[#000] hover:bg-[#FFF] rounded font-medium transition-colors cursor-pointer shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] text-sm"
        >
          <Play size={12} fill="currentColor" /> Run
        </button>
      </div>
    </div>
  );
}
