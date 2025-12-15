import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult, AnalysisState } from "../types";

// Helper to poll for file active state (Critical for large files)
const waitForFileActive = async (ai: GoogleGenAI, fileName: string): Promise<void> => {
  console.log(`Polling for file processing: ${fileName}`);
  // Initial delay
  await new Promise((resolve) => setTimeout(resolve, 5000));
  
  let file = await ai.files.get({ name: fileName });
  
  while (file.state === "PROCESSING") {
    console.log("File is processing on Google servers...");
    await new Promise((resolve) => setTimeout(resolve, 5000));
    file = await ai.files.get({ name: fileName });
  }
  
  if (file.state !== "ACTIVE") {
    throw new Error(`File processing failed with state: ${file.state}`);
  }
  console.log("File is active and ready for analysis.");
};

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    stream_meta: {
      type: Type.OBJECT,
      properties: {
        duration: { type: Type.STRING },
        streamer_vibe: { type: Type.STRING },
      },
      required: ["duration", "streamer_vibe"],
    },
    clips: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          start_timestamp: { type: Type.STRING },
          end_timestamp: { type: Type.STRING },
          virality_score: { type: Type.INTEGER },
          title: { type: Type.STRING },
          reason: { type: Type.STRING },
        },
        required: ["start_timestamp", "end_timestamp", "virality_score", "title", "reason"],
      },
    },
    summary: { type: Type.STRING },
  },
  required: ["stream_meta", "clips", "summary"],
};

export const analyzeVideoContent = async (
  file: File, 
  onProgress: (state: AnalysisState) => void,
  apiKeyOverride?: string
): Promise<AnalysisResult> => {
  const apiKey = apiKeyOverride || process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error("API Key is missing. Please click the Key icon in the top right to configure it.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  // Using gemini-2.5-flash for 1M context window and fast video processing
  const model = "gemini-2.5-flash";

  let videoPart;

  try {
    // 1. Upload Logic
    // We use ai.files.upload which handles the Resumable Upload protocol.
    // This allows uploading GB-sized files directly to Google, bypassing server limits.
    onProgress(AnalysisState.UPLOADING);
    console.log("Starting Resumable Upload...");
    
    const uploadResponse = await ai.files.upload({
      file: file,
      config: { displayName: file.name, mimeType: file.type }
    });

    console.log(`Upload complete: ${uploadResponse.uri}`);
    
    // 2. Wait for Processing
    onProgress(AnalysisState.PROCESSING_FILE);
    await waitForFileActive(ai, uploadResponse.name);

    // 3. Analyze
    onProgress(AnalysisState.ANALYZING);
    
    videoPart = {
      fileData: {
        fileUri: uploadResponse.uri,
        mimeType: uploadResponse.mimeType
      }
    };

    const systemInstruction = `
      Role: Expert Video Editor for TikTok, YouTube Shorts, and Instagram Reels.
      Objective: Analyze this long-form stream footage to identify the 3-5 most 'viral' moments suitable for short-form content.
      
      Criteria for Viral Clips:
      1. AUDIO SPIKES: Look for sudden laughter, shouting, high-energy speech, or funny noises.
      2. VISUAL SURPRISE: Look for rapid movement, jump scares, or drastic changes in the streamer's facial expression.
      3. CONTEXT: Identify 'wins' in games, funny 'fails', or glitch moments.
      
      Scoring:
      - Assign a 'virality_score' from 1-10 based on how likely it is to retain attention on TikTok.
      - 10 = Screaming/Huge Laugh/Insane Play.
      - 5 = Interesting/Good Context.
      - 1 = Boring.
      
      Output Rules:
      - Generate a 'Clickbait Style' title for each clip.
      - Provide exact timestamps.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          videoPart,
          { text: "Find the viral clips in this stream." }
        ],
      },
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.4, // Slightly creative for titles
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from model");

    return JSON.parse(text) as AnalysisResult;

  } catch (error: any) {
    console.error("Gemini Analysis Error:", error);
    // Add specific help for 403 errors which are common with direct browser uploads if the key lacks permissions
    if (error.message?.includes("403") || error.message?.includes("fetch failed")) {
       throw new Error("Upload failed. Ensure your API Key has permission to use the File API, or try a smaller file.");
    }
    throw error;
  }
};