import React, { useState, useCallback, useEffect } from 'react';
import { AnalysisResult, AnalysisState } from './types';
import { analyzeVideoContent } from './services/geminiService';
import VideoPlayer from './components/VideoPlayer';
import ClipCard from './components/EventCard'; // Renamed component import
import UploadZone from './components/UploadZone';
import Documentation from './components/Documentation';
import { LoaderIcon, AlertIcon, KeyIcon } from './components/Icons';

const isAIStudio = typeof window !== 'undefined' && (window as any).aistudio;

const App: React.FC = () => {
  const [view, setView] = useState<'app' | 'docs'>('app');
  const [analysisState, setAnalysisState] = useState<AnalysisState>(AnalysisState.IDLE);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [seekTime, setSeekTime] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Auth state
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  const [customApiKey, setCustomApiKey] = useState<string>('');
  const [showSettings, setShowSettings] = useState<boolean>(false);

  useEffect(() => {
    const checkApiKey = async () => {
      // 1. Check for AI Studio env
      if (isAIStudio && (window as any).aistudio.hasSelectedApiKey) {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        setHasApiKey(hasKey);
        return;
      } 
      
      // 2. Check for manual key in localStorage
      const storedKey = localStorage.getItem('streamslicer_api_key');
      if (storedKey) {
        setCustomApiKey(storedKey);
        setHasApiKey(true);
        return;
      }

      // 3. Check for build-time env var
      if (process.env.API_KEY) {
        setHasApiKey(true);
        return;
      }
      
      setHasApiKey(false);
    };
    checkApiKey();
  }, []);

  const handleApiKeyAction = async () => {
    if (isAIStudio && (window as any).aistudio.openSelectKey) {
      await (window as any).aistudio.openSelectKey();
      setHasApiKey(true);
      if (errorMsg && errorMsg.includes("API Key")) setErrorMsg(null);
    } else {
      setShowSettings(true);
    }
  };

  const saveCustomKey = (key: string) => {
    localStorage.setItem('streamslicer_api_key', key);
    setCustomApiKey(key);
    setHasApiKey(true);
    setShowSettings(false);
    if (errorMsg && errorMsg.includes("API Key")) setErrorMsg(null);
  };

  const clearCustomKey = () => {
    localStorage.removeItem('streamslicer_api_key');
    setCustomApiKey('');
    setHasApiKey(false);
    setShowSettings(false);
    setAnalysisResult(null);
    setVideoFile(null);
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

    setAnalysisState(AnalysisState.UPLOADING);
    setErrorMsg(null);

    try {
      const result = await analyzeVideoContent(videoFile, (state) => {
        setAnalysisState(state);
      }, customApiKey);
      
      setAnalysisResult(result);
      setAnalysisState(AnalysisState.COMPLETE);
    } catch (error: any) {
      setAnalysisState(AnalysisState.ERROR);
      
      const isAuthError = error.message && (
        error.message.includes("403") || 
        error.message.includes("API Key is missing") ||
        error.message.includes("fetch failed")
      );

      if (isAuthError) {
         setHasApiKey(false);
         if (customApiKey && !isAIStudio) {
            setErrorMsg("Authentication failed. Please check your API Key permissions.");
            setShowSettings(true);
         } else {
             setErrorMsg(error.message);
         }
      } else {
         setErrorMsg(error.message || "Failed to analyze video. Please try again.");
      }
    }
  }, [videoFile, customApiKey]);

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

  // Status message helper
  const getStatusMessage = (state: AnalysisState) => {
      switch(state) {
          case AnalysisState.UPLOADING: return "Direct-to-Google Resumable Upload...";
          case AnalysisState.PROCESSING_FILE: return "Google is processing the video file...";
          case AnalysisState.ANALYZING: return "Gemini 2.5 is watching your stream...";
          default: return "Processing...";
      }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-fuchsia-500/30">
      
      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-white mb-2">API Configuration</h3>
            <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
              Your API Key is stored locally.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-500 uppercase mb-1">Gemini API Key</label>
                <input 
                  type="password"
                  placeholder="AIza..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white focus:ring-2 focus:ring-fuchsia-600 outline-none transition-all"
                  value={customApiKey}
                  onChange={(e) => setCustomApiKey(e.target.value)}
                />
              </div>
              <div className="flex justify-between items-center pt-4">
                <button
                  onClick={clearCustomKey}
                  className="text-red-400 hover:text-red-300 text-sm font-medium hover:underline"
                >
                  Clear Key
                </button>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setShowSettings(false)}
                    className="text-zinc-400 hover:text-white px-4 py-2 text-sm"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => saveCustomKey(customApiKey)}
                    className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white px-4 py-2 rounded font-medium text-sm transition-colors"
                    disabled={!customApiKey}
                  >
                    Save
                  </button>
                </div>
              </div>
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
             <button 
               onClick={handleApiKeyAction}
               className={`transition-colors p-2 rounded border ${hasApiKey ? 'text-zinc-400 hover:text-white hover:bg-zinc-900 border-transparent hover:border-zinc-800' : 'text-fuchsia-500 bg-fuchsia-500/10 border-fuchsia-500/50 animate-pulse'}`}
               title="Configure API Key"
             >
               <KeyIcon className="w-5 h-5" />
             </button>
             <span className="hidden sm:inline-block text-xs font-mono text-zinc-500 px-2 py-1 bg-zinc-900 rounded border border-zinc-800">
               Gemini 2.5
             </span>
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
                      Upload GBs of footage. AI extracts the high-energy moments instantly.
                    </p>
                  </div>

                  {/* Show Upload Zone if Key is valid */}
                  {hasApiKey ? (
                    <>
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
                            className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white px-6 py-2 rounded-lg font-bold transition-all shadow-lg shadow-fuchsia-900/20"
                          >
                            Find Viral Clips
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    /* API Key Selection Card */
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8 text-center space-y-6 shadow-2xl">
                      <div className="mx-auto w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center border border-zinc-700">
                        <KeyIcon className="w-8 h-8 text-zinc-400" />
                      </div>
                      <div className="space-y-2">
                          <h3 className="text-xl font-medium text-zinc-100">Connect to Google Gemini</h3>
                          <p className="text-zinc-400 max-w-sm mx-auto text-sm">
                            We use your API key to upload large files directly to Google's cloud.
                          </p>
                      </div>
                      <button 
                          onClick={handleApiKeyAction}
                          className="inline-flex items-center justify-center gap-2 bg-zinc-100 hover:bg-white text-zinc-950 px-6 py-3 rounded-lg font-bold transition-all"
                      >
                          <span>{isAIStudio ? "Select API Key" : "Enter API Key"}</span>
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
                    We are analyzing audio dynamics, visual motion, and context to find the best clips.
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