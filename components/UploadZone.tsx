import React, { useRef, useState } from 'react';
import { UploadIcon } from './Icons';

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  onError: (msg: string) => void;
  isProcessing: boolean;
  maxSize?: number; // Optional custom limit
}

const DEFAULT_MAX_SIZE = 1500 * 1024 * 1024; // 1.5 GB

const UploadZone: React.FC<UploadZoneProps> = ({ onFileSelect, onError, isProcessing, maxSize = DEFAULT_MAX_SIZE }) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const formatSize = (bytes: number) => {
    if (bytes >= 1024 * 1024 * 1024) {
      return (bytes / (1024 * 1024 * 1024)).toFixed(1) + 'GB';
    }
    return Math.round(bytes / (1024 * 1024)) + 'MB';
  };

  const validateAndSelect = (file: File) => {
    if (file.size > maxSize) {
      onError(`File is too large for this plan. Limit: ${formatSize(maxSize)}.`);
      return;
    }
    if (!file.type.startsWith('video/')) {
      onError("Invalid file type. Please upload a video file (MP4, MOV).");
      return;
    }
    onFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSelect(e.dataTransfer.files[0]);
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSelect(e.target.files[0]);
    }
  };

  return (
    <div
      onClick={isProcessing ? undefined : handleClick}
      onDragOver={isProcessing ? undefined : handleDragOver}
      onDragLeave={isProcessing ? undefined : handleDragLeave}
      onDrop={isProcessing ? undefined : handleDrop}
      className={`
        relative overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center p-16 text-center cursor-pointer group
        ${isDragging 
          ? 'border-fuchsia-500 bg-fuchsia-500/10' 
          : 'border-zinc-800 hover:border-fuchsia-500/50 hover:bg-zinc-900'
        }
        ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <input
        type="file"
        ref={inputRef}
        onChange={handleChange}
        accept="video/*"
        className="hidden"
        disabled={isProcessing}
      />
      <div className="z-10 flex flex-col items-center gap-6">
        <div className="p-5 rounded-full bg-zinc-900 border border-zinc-800 group-hover:border-fuchsia-500/30 group-hover:scale-110 transition-all duration-300">
            <UploadIcon className="w-10 h-10 text-zinc-400 group-hover:text-fuchsia-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-zinc-100 group-hover:text-white">Upload Stream VOD</h3>
          <p className="text-zinc-400 text-sm mt-2">Drag & drop MP4/MOV (Max {formatSize(maxSize)})</p>
        </div>
        <div className="flex gap-2 text-xs text-zinc-500 font-mono">
           <span className="bg-zinc-900 px-2 py-1 rounded border border-zinc-800">Direct-to-Google Upload</span>
           <span className="bg-zinc-900 px-2 py-1 rounded border border-zinc-800">Encrypted</span>
        </div>
      </div>
    </div>
  );
};

export default UploadZone;