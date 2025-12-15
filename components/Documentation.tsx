import React from 'react';
import { UploadIcon, KeyIcon, FireIcon } from './Icons';

interface DocumentationProps {
  onBack: () => void;
}

const Documentation: React.FC<DocumentationProps> = ({ onBack }) => {
  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <button 
        onClick={onBack}
        className="mb-8 flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm group"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 group-hover:-translate-x-1 transition-transform">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
        </svg>
        Back to Editor
      </button>

      <div className="space-y-12">
        {/* Header */}
        <div className="border-b border-zinc-800 pb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-fuchsia-400 bg-clip-text text-transparent mb-4">
            StreamSlicer Documentation
          </h1>
          <p className="text-xl text-zinc-400 leading-relaxed">
            StreamSlicer is a creator economy tool that uses AI to instantly turn long streams into viral short-form content.
          </p>
        </div>

        {/* Section: How it Works */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-zinc-100 flex items-center gap-3">
            <span className="w-8 h-8 rounded bg-fuchsia-500/10 text-fuchsia-500 flex items-center justify-center text-sm font-bold">1</span>
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl hover:bg-zinc-900/80 transition-colors">
              <KeyIcon className="w-8 h-8 text-zinc-500 mb-4" />
              <h3 className="font-medium text-white mb-2">1. Connect</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Enter your Gemini API Key. We use your key to perform a direct upload to Google, bypassing our servers entirely.
              </p>
            </div>
            <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl hover:bg-zinc-900/80 transition-colors">
              <UploadIcon className="w-8 h-8 text-zinc-500 mb-4" />
              <h3 className="font-medium text-white mb-2">2. Upload VOD</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Upload your large stream file. We use the "Resumable Upload" protocol to handle large files (1GB+) securely.
              </p>
            </div>
            <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl hover:bg-zinc-900/80 transition-colors">
              <FireIcon className="w-8 h-8 text-zinc-500 mb-4" />
              <h3 className="font-medium text-white mb-2">3. Extract Viral Clips</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Gemini 2.5 Flash scans audio and visuals for high-energy moments, creating a list of ready-to-edit viral clips.
              </p>
            </div>
          </div>
        </section>

        {/* Section: Features */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-zinc-100">Virality Criteria</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <ul className="space-y-6 text-zinc-300">
              <li className="flex gap-4 items-start">
                <div className="mt-1.5 w-2 h-2 rounded-full bg-fuchsia-500 shrink-0 shadow-[0_0_10px_rgba(217,70,239,0.5)]" />
                <div>
                  <strong className="text-white block text-lg mb-1">Audio Dynamics</strong>
                  <p className="text-zinc-400 text-sm">Detects shouting, sudden laughter, or high-WPM speech patterns indicative of excitement.</p>
                </div>
              </li>
              <li className="flex gap-4 items-start">
                <div className="mt-1.5 w-2 h-2 rounded-full bg-blue-500 shrink-0 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                <div>
                  <strong className="text-white block text-lg mb-1">Visual Surprise</strong>
                  <p className="text-zinc-400 text-sm">Analyzes facial expressions and screen movement to find jump scares or intense gameplay.</p>
                </div>
              </li>
            </ul>
            <ul className="space-y-6 text-zinc-300">
              <li className="flex gap-4 items-start">
                <div className="mt-1.5 w-2 h-2 rounded-full bg-purple-500 shrink-0 shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                <div>
                  <strong className="text-white block text-lg mb-1">Context Awareness</strong>
                  <p className="text-zinc-400 text-sm">Understands "Wins", "Fails", "Glitches", and "Funny Interactions" based on context.</p>
                </div>
              </li>
            </ul>
          </div>
        </section>

         {/* Section: Technical */}
         <section className="space-y-4 pt-8 border-t border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-100">Technical Stack</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm bg-zinc-900/30 p-6 rounded-xl border border-zinc-800/50">
             <div>
                <span className="text-zinc-500 block mb-1">AI Model</span>
                <span className="text-zinc-200 font-mono">Gemini 2.5 Flash</span>
             </div>
             <div>
                <span className="text-zinc-500 block mb-1">Upload Protocol</span>
                <span className="text-zinc-200 font-mono">Google Resumable</span>
             </div>
             <div>
                <span className="text-zinc-500 block mb-1">Context Window</span>
                <span className="text-zinc-200 font-mono">1 Million Tokens</span>
             </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Documentation;