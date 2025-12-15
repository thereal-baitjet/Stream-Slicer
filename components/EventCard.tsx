import React from 'react';
import { ViralClip } from '../types';
import { FireIcon, CheckCircleIcon, PlayIcon } from './Icons';

interface ClipCardProps {
  clip: ViralClip;
  onClick: (timestamp: string) => void;
  isActive: boolean;
}

const ClipCard: React.FC<ClipCardProps> = ({ clip, onClick, isActive }) => {
  const getScoreColor = (score: number) => {
    if (score >= 9) return 'border-l-fuchsia-500 hover:bg-fuchsia-950/20';
    if (score >= 7) return 'border-l-purple-500 hover:bg-purple-950/20';
    return 'border-l-zinc-500 hover:bg-zinc-900/50';
  };

  const getBadgeStyle = (score: number) => {
    if (score >= 9) return "text-fuchsia-400 bg-fuchsia-950/30 border-fuchsia-500/30";
    if (score >= 7) return "text-purple-400 bg-purple-950/30 border-purple-500/30";
    return "text-zinc-400 bg-zinc-800 border-zinc-700";
  };

  return (
    <button
      onClick={() => onClick(clip.start_timestamp)}
      className={`w-full text-left group flex flex-col gap-3 p-4 rounded-r-xl border-l-4 transition-all duration-300 border-y border-r border-zinc-800 bg-zinc-900/40 
        ${getScoreColor(clip.virality_score)}
        ${isActive ? 'bg-zinc-800 ring-1 ring-zinc-700' : ''}
      `}
    >
      <div className="flex w-full justify-between items-start">
        <div className="flex items-center gap-2">
           <span className="font-mono text-xs font-bold text-zinc-300 bg-black/50 px-2 py-1 rounded border border-zinc-800">
             {clip.start_timestamp} - {clip.end_timestamp}
           </span>
           <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border ${getBadgeStyle(clip.virality_score)}`}>
              <FireIcon className="w-3 h-3" />
              <span>Score: {clip.virality_score}/10</span>
           </div>
        </div>
      </div>
      
      <div>
        <h4 className="font-bold text-zinc-100 text-lg leading-tight group-hover:text-fuchsia-300 transition-colors">
            {clip.title}
        </h4>
        <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
            <span className="text-zinc-500 uppercase text-xs font-bold tracking-wider mr-2">Why Viral:</span>
            {clip.reason}
        </p>
      </div>
      
      <div className="flex items-center gap-2 text-xs text-zinc-600 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <PlayIcon className="w-3 h-3" />
          <span>Click to jump to clip</span>
      </div>
    </button>
  );
};

export default ClipCard;