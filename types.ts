export interface ViralClip {
  start_timestamp: string; // HH:MM:SS
  end_timestamp: string; // HH:MM:SS
  virality_score: number; // 1-10
  title: string; // Clickbait title
  reason: string; // Why it's viral
}

export interface StreamMeta {
  duration: string;
  streamer_vibe: string;
}

export interface AnalysisResult {
  stream_meta: StreamMeta;
  clips: ViralClip[];
  summary: string;
}

export enum AnalysisState {
  IDLE,
  UPLOADING,
  PROCESSING_FILE,
  ANALYZING,
  COMPLETE,
  ERROR,
}