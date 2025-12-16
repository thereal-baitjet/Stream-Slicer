# StreamSlicer AI Coding Guidelines

## Architecture Overview
StreamSlicer is a React SPA that analyzes long-form video streams to extract viral short clips using Google's Gemini AI. The app uses a credit-based monetization system backed by Firebase Realtime Database.

**Core Data Flow:**
1. User uploads video file via `UploadZone` component
2. Video sent to Gemini AI via `geminiService.ts` for analysis
3. AI returns structured JSON with viral clips (1-10 virality score)
4. Clips displayed in `ClipCard` components with export functionality
5. Exports create ZIP packages with WebM video and metadata

**Key Components:**
- `App.tsx`: Main state management and view routing (landing/app/docs)
- `VideoPlayer.tsx`: Custom video player with seek functionality
- `EventCard.tsx` (ClipCard): Displays individual viral clips with scores
- `services/geminiService.ts`: Handles Gemini API integration and video upload
- `services/pricing.ts`: Calculates credit costs based on token usage (10x markup)

## Development Workflow
- **Start dev server:** `npm run dev` (runs on port 3000)
- **Environment setup:** Set `GEMINI_API_KEY` in `.env` file
- **Firebase config:** Update `firebase.ts` with your project credentials
- **Build:** `npm run build` for production bundle

## Code Patterns & Conventions

### State Management
- Use React hooks (`useState`, `useEffect`) in functional components
- Centralize state in `App.tsx` for user credits, analysis results, and view switching
- Persist user ID in localStorage via `firebase.ts` helpers

### Component Structure
- Components in `/components/` directory
- Use Tailwind CSS classes for styling (zinc/fuchsia color scheme)
- Forward refs for imperative video controls (`VideoPlayer`)
- Event handlers prefixed with `handle` (e.g., `handleFileSelect`)

### AI Integration
- Use structured JSON schemas for Gemini responses (`responseSchema` in `geminiService.ts`)
- Poll for file processing completion before analysis
- Handle token usage for credit deduction (input + output tokens)

### Credit System
- Credits stored in Firebase: `users/{userId}/credits`
- Cost calculation: Base Gemini pricing × 10 markup × 1000 (USD to credits)
- Minimum 5 credits per analysis
- Log usage to `logs/{userId}/{timestamp}`

### Video Handling
- Timestamps in "HH:MM:SS" format (parsed with `parseTimestamp`)
- Export uses `MediaRecorder` API for client-side video capture
- ZIP packages include WebM video + TXT metadata

### Error Handling
- Display user-friendly messages in UI (e.g., insufficient credits)
- Log technical errors to console
- Graceful fallbacks (show results even if credit deduction fails)

## Key Files to Reference
- [App.tsx](App.tsx): Main app logic and state flow
- [services/geminiService.ts](services/geminiService.ts): AI analysis implementation
- [services/pricing.ts](services/pricing.ts): Credit calculation logic
- [firebase.ts](firebase.ts): Database operations
- [types.ts](types.ts): Core interfaces (ViralClip, AnalysisResult)

## Production Notes
- Payment integration now uses PayPal Buttons for secure client-side payments
- Requires backend webhooks for secure credit management (verify payments server-side)
- Firebase security rules must prevent client-side credit writes
- API key should be server-side for production security