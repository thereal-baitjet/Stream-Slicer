import React, { useState, useCallback, useEffect, useRef } from 'react';
import JSZip from 'jszip';
import { AnalysisResult, AnalysisState, ViralClip } from './types';
import { analyzeVideoContent } from './services/geminiService';
import { getUserId, getUserBalance, addCredits, deductCredits, logUsage } from './firebase';
import { calculateCost, estimateVideoCost } from './services/pricing';
import VideoPlayer from './components/VideoPlayer';
import ClipCard from './components/EventCard'; 
import UploadZone from './components/UploadZone';
import Documentation from './components/Documentation';
import { LandingPage } from './components/LandingPage';
import { LoaderIcon, AlertIcon, DownloadIcon, FireIcon } from './components/Icons';

const App: React.FC = () => {
  // Views: 'landing' (default) -> 'app' | 'docs'
  const [view, setView] = useState<'landing' | 'app' | 'docs'>('landing');
  
  const [analysisState, setAnalysisState] = useState<AnalysisState>(AnalysisState.IDLE);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [seekTime, setSeekTime] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Wallet State
  const [credits, setCredits] = useState<number>(0);
  const [userId, setUserId] = useState<string>('');
  
  // Export State
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const videoPlayerRef = useRef<HTMLVideoElement>(null);

  // Initialize User and Balance
  useEffect(() => {
    const init = async () => {
      const uid = getUserId();
      setUserId(uid);
      const balance = await getUserBalance(uid);
      setCredits(balance);
    };
    init();
  }, []);

  const refreshBalance = async () => {
    if (userId) {
      const balance = await getUserBalance(userId);
      setCredits(balance);
    }
  };

  const handlePurchaseCredits = async (amount: number) => {
    // In a real app, this is called by a webhook from PayPal.
    // Here we simulate it from the client after user clicks PayPal button
    await addCredits(userId, amount);
    await refreshBalance();
    alert(`Successfully added ${amount} credits!`);
    setView('app');
  };

  const handleFileSelect = useCallback((file: File) => {
    setErrorMsg(null);
    setVideoFile(file);
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    setAnalysisResult(null);
    setAnalysisState(AnalysisState.IDLE);
  }, []);

  const handleUploadError = useCallback((msg: string) => {
    setErrorMsg(msg);
    setVideoFile(null);
    setAnalysisState(AnalysisState.IDLE);
  }, []);

  const startAnalysis = useCallback(async () => {
    if (!videoFile) return;

    // 1. Estimate Cost
    // Use an approximate video duration if available, else guess based on size
    // 1MB ~ 2 seconds for high quality, very rough estimate if metadata not parsed
    const estimatedDuration = videoFile.size / (1024 * 1024 * 0.5); // very rough estimate
    const estimatedCost = estimateVideoCost(estimatedDuration);
    
    // 2. Check Balance
    if (credits < 10) { // Minimum threshold to start
        setErrorMsg(`Insufficient credits. You need at least 10 credits to start. Balance: ${credits}`);
        return;
    }

    setAnalysisState(AnalysisState.UPLOADING);
    setErrorMsg(null);

    try {
      const { result, usage } = await analyzeVideoContent(videoFile, (state) => {
        setAnalysisState(state);
      });
      
      // 3. Calculate Actual Cost & Deduct
      const actualCost = calculateCost(usage.promptTokenCount, usage.candidatesTokenCount);
      
      const success = await deductCredits(userId, actualCost);
      if (success) {
        logUsage(userId, actualCost, { 
          fileName: videoFile.name, 
          tokens: usage,
          timestamp: new Date().toISOString() 
        });
        setCredits(prev => prev - actualCost);
        setAnalysisResult(result);
        setAnalysisState(AnalysisState.COMPLETE);
      } else {
        setErrorMsg("Analysis complete, but credit deduction failed. Please contact support.");
        setAnalysisResult(result); // Show result anyway to be nice
        setAnalysisState(AnalysisState.COMPLETE);
      }

    } catch (error: any) {
      setAnalysisState(AnalysisState.ERROR);
      setErrorMsg(error.message || "Failed to analyze video. Please try again.");
    }
  }, [videoFile, credits, userId]);

  const parseTimestamp = (timeStr: string): number => {
    const parts = timeStr.split(':').map(Number);
    if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    if (parts.length === 2) {
      return parts[0] * 60 + parts[1];
    }
    return 0;
  };

  const handleClipClick = (timeStr: string) => {
    const seconds = parseTimestamp(timeStr);
    setSeekTime(seconds);
  };

  const handleExportClipPackage = async (clip: ViralClip) => {
    if (!videoPlayerRef.current || !videoFile) return;
    
    setIsExporting(true);
    setExportProgress(0);

    const videoElement = videoPlayerRef.current;
    const startSeconds = parseTimestamp(clip.start_timestamp);
    const endSeconds = parseTimestamp(clip.end_timestamp);
    const duration = (endSeconds - startSeconds) * 1000;

    try {
      // 1. Setup Recording
      videoElement.currentTime = startSeconds;
      await new Promise<void>((resolve) => {
        const onSeeked = () => {
          videoElement.removeEventListener('seeked', onSeeked);
          resolve();
        };
        videoElement.addEventListener('seeked', onSeeked);
      });

      const stream = (videoElement as any).captureStream() as MediaStream;
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' });
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.start();
      videoElement.play();

      const startTime = Date.now();
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const p = Math.min((elapsed / duration) * 100, 99);
        setExportProgress(p);
      }, 100);

      await new Promise<void>((resolve) => setTimeout(resolve, duration));
      
      mediaRecorder.stop();
      videoElement.pause();
      clearInterval(interval);
      setExportProgress(100);

      await new Promise<void>(resolve => {
        mediaRecorder.onstop = () => resolve();
      });

      const videoBlob = new Blob(chunks, { type: 'video/webm' });
      
      const safeTitle = clip.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const textContent = `StreamSlicer Export - Viral Clip\nTitle: ${clip.title}\nTimestamp: ${clip.start_timestamp}\nCredits Used for Analysis`;
      
      const zip = new JSZip();
      zip.file(`${safeTitle}.webm`, videoBlob);
      zip.file(`${safeTitle}_info.txt`, textContent);
      
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `${safeTitle}_package.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

    } catch (e) {
      console.error("Export failed", e);
      setErrorMsg("Failed to export clip. Browser may not support MediaRecorder capture.");
    } finally {
      setIsExporting(false);
    }
  };

  const getStatusMessage = (state: AnalysisState) => {
      switch(state) {
          case AnalysisState.UPLOADING: return "Uploading to Cloud...";
          case AnalysisState.PROCESSING_FILE: return "Processing Video...";
          case AnalysisState.ANALYZING: return "Calculating Virality Scores...";
          default: return "Processing...";
      }
  };

  if (view === 'landing') {
    return <LandingPage onEnterApp={() => setView('app')} onBuyCredits={handlePurchaseCredits} />;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-fuchsia-500/30">
      
      {/* Export Overlay */}
      {isExporting && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur flex flex-col items-center justify-center p-8">
           <div className="max-w-md w-full space-y-6 text-center animate-in fade-in duration-300">
              <div className="w-20 h-20 bg-fuchsia-500/20 rounded-full flex items-center justify-center mx-auto border border-fuchsia-500/50 animate-pulse">
                <DownloadIcon className="w-10 h-10 text-fuchsia-400" />
              </div>
              <h3 className="text-2xl font-bold text-white">Rendering Viral Clip...</h3>
              <p className="text-zinc-400">Please wait while we capture this segment.</p>
              <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                <div className="bg-fuchsia-500 h-full transition-all duration-200 ease-linear" style={{ width: `${exportProgress}%` }} />
              </div>
           </div>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <button onClick={() => setView('app')} className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded bg-gradient-to-tr from-fuchsia-600 to-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <span className="font-bold text-white">S</span>
            </div>
            <h1 className="font-bold text-xl tracking-tight">Stream<span className="text-fuchsia-500">Slicer</span></h1>
          </button>
          <div className="flex items-center gap-4">
             {/* Wallet Display */}
             <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-full">
                <FireIcon className="w-4 h-4 text-fuchsia-500" />
                <span className="font-mono font-bold text-white">{credits.toLocaleString()}</span>
                <span className="text-xs text-zinc-500 uppercase tracking-wide">Credits</span>
                <button 
                  onClick={() => setView('landing')} 
                  className="ml-2 text-xs bg-fuchsia-600 hover:bg-fuchsia-500 text-white px-2 py-0.5 rounded"
                >
                  + Buy
                </button>
             </div>

             <button 
               onClick={() => setView('docs')}
               className={`text-sm transition-colors ${view === 'docs' ? 'text-white font-medium' : 'text-zinc-400 hover:text-white'}`}
             >
               Documentation
             </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {view === 'docs' ? (
          <Documentation onBack={() => setView('app')} />
        ) : (
          <>
            {/* Intro / Upload Section */}
            {analysisState === AnalysisState.IDLE && !analysisResult && (
              <div className="max-w-2xl mx-auto mt-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="text-center space-y-2">
                    <h2 className="text-4xl font-bold tracking-tight bg-gradient-to-br from-white to-zinc-500 bg-clip-text text-transparent">
                      Turn Streams into Viral Shorts
                    </h2>
                    <p className="text-zinc-400 text-lg">
                      Upload footage. Pay with credits.
                    </p>
                  </div>

                  <UploadZone 
                    onFileSelect={handleFileSelect} 
                    onError={handleUploadError}
                    isProcessing={false} 
                  />
                  
                  {videoFile && (
                    <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded bg-fuchsia-500/10 flex items-center justify-center text-fuchsia-500 font-bold">
                            MP4
                          </div>
                          <div className="text-sm">
                            <p className="font-medium text-zinc-200">{videoFile.name}</p>
                            <p className="text-zinc-500">{(videoFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                          </div>
                      </div>
                      <button 
                        onClick={startAnalysis}
                        disabled={credits < 10}
                        className={`px-6 py-2 rounded-lg font-bold transition-all shadow-lg ${
                          credits >= 10 
                           ? 'bg-fuchsia-600 hover:bg-fuchsia-500 text-white shadow-fuchsia-900/20' 
                           : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                        }`}
                      >
                        {credits >= 10 ? 'Analyze (Credits Apply)' : 'Insufficent Credits'}
                      </button>
                    </div>
                  )}
                  
                  {errorMsg && (
                      <div className="bg-red-950/20 border border-red-900/50 p-4 rounded-lg flex items-center gap-3 text-red-400 text-sm">
                          <AlertIcon className="w-5 h-5 flex-shrink-0" />
                          {errorMsg}
                      </div>
                  )}
              </div>
            )}

            {/* Processing State */}
            {(analysisState !== AnalysisState.IDLE && analysisState !== AnalysisState.COMPLETE && analysisState !== AnalysisState.ERROR) && (
              <div className="flex flex-col items-center justify-center h-[60vh] space-y-8">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full border-4 border-zinc-800 border-t-fuchsia-500 animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-fuchsia-500/20 animate-pulse"></div>
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-bold text-zinc-100">
                    {getStatusMessage(analysisState)}
                  </h3>
                  <p className="text-zinc-500 text-sm max-w-md mx-auto">
                    We are analyzing audio dynamics, visual motion, and context.
                  </p>
                </div>
              </div>
            )}

            {/* Dashboard View */}
            {(analysisState === AnalysisState.COMPLETE || (analysisState === AnalysisState.IDLE && analysisResult)) && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)]">
                
                {/* Left Column: Video Player */}
                <div className="lg:col-span-2 flex flex-col gap-4">
                  {videoUrl && (
                    <VideoPlayer 
                      ref={videoPlayerRef}
                      src={videoUrl} 
                      seekTime={seekTime} 
                      className="flex-grow bg-black w-full shadow-2xl shadow-purple-900/20"
                    />
                  )}
                  
                  {/* Metadata Bar */}
                  <div className="grid grid-cols-2 gap-4">
                      <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl">
                        <span className="text-zinc-500 text-xs uppercase tracking-wider block mb-1">Duration</span>
                        <span className="text-zinc-200 font-mono text-lg">{analysisResult?.stream_meta.duration || "--:--"}</span>
                      </div>
                      <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl">
                        <span className="text-zinc-500 text-xs uppercase tracking-wider block mb-1">Streamer Vibe</span>
                        <span className="text-zinc-200 text-lg">{analysisResult?.stream_meta.streamer_vibe || "Unknown"}</span>
                      </div>
                  </div>

                  {/* Summary */}
                  <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl">
                      <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-2">Stream Summary</h3>
                      <p className="text-zinc-300 leading-relaxed text-sm">
                        {analysisResult?.summary}
                      </p>
                  </div>
                </div>

                {/* Right Column: Clip List */}
                <div className="lg:col-span-1 bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden flex flex-col h-full shadow-2xl">
                  <div className="p-4 border-b border-zinc-800 bg-zinc-900/80 flex justify-between items-center backdrop-blur">
                    <h3 className="font-bold text-lg text-zinc-100">Viral Candidates</h3>
                    <span className="bg-fuchsia-900/30 text-fuchsia-400 text-xs px-2 py-1 rounded-full border border-fuchsia-800/50">
                      {analysisResult?.clips.length || 0} Found
                    </span>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-zinc-950/50">
                    {analysisResult?.clips.map((clip, idx) => (
                      <ClipCard 
                        key={idx} 
                        clip={clip} 
                        onClick={handleClipClick}
                        onExport={handleExportClipPackage}
                        isActive={false} 
                      />
                    ))}
                    
                    {(!analysisResult?.clips || analysisResult.clips.length === 0) && (
                      <div className="text-center py-12 text-zinc-500 text-sm">
                        No viral moments found. Tough stream?
                      </div>
                    )}
                  </div>
                </div>

              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default App;