# StreamSlicer AI

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Gemini API](https://img.shields.io/badge/Google%20Gemini-8E75B2?style=for-the-badge&logo=googlebard&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)

**StreamSlicer** is a creator economy tool designed to automate the analysis of long-form stream footage. It uses **Google's Gemini 2.5 Flash** model to identify viral, high-energy clips and extracts them using a token-based credit system backed by **Firebase**.

## ⚠️ Payment Integration Required

**Crucial Note for Developers:**

The current payment implementation in `LandingPage.tsx` and `App.tsx` is a **client-side simulation** for demonstration purposes.

To make this application production-ready, you **must**:
1.  **Implement Webhooks**: Set up a backend (e.g., Firebase Cloud Functions) to receive PayPal Webhook events (Payment Capture).
2.  **Verify Transactions**: Ensure the transaction ID is valid and the amount matches the credit pack purchased.
3.  **Secure Database**: Update Firebase Security Rules to prevent client-side writes to `users/{userId}/credits`. Only the backend Admin SDK should be able to increase user balances.
4.  **Replace Logic**: Remove the `handlePurchaseCredits` simulation in `App.tsx` that blindly adds credits after a timeout.

## 🚀 Features

*   **Pay-As-You-Go AI**: Token-based usage model with a 10x markup on Gemini API costs.
*   **Automated Analysis**: Uploads GBs of footage directly to Google Gemini via the File API.
*   **Virality Scoring**: AI agents score clips from 1-10 based on audio dynamics and visual surprise.
*   **Instant Export**: Client-side recording and ZIP packaging of viral clips.
*   **Firebase Wallet**: Tracks user credits and usage logs in Realtime Database.

## 🛠️ Tech Stack

*   **Frontend**: React 19, TypeScript
*   **Styling**: Tailwind CSS
*   **AI**: Google Gemini API (`gemini-2.5-flash`)
*   **Backend/DB**: Firebase Realtime Database
*   **Payments**: PayPal (Frontend Integration Only)

## 📦 Setup & Configuration

1.  **Firebase**:
    *   Create a project at [console.firebase.google.com](https://console.firebase.google.com).
    *   Enable **Realtime Database**.
    *   Copy your config object into `firebase.ts`.
2.  **Gemini API**:
    *   Get a key from Google AI Studio.
    *   Set it in your environment variables or backend proxy (for the pricing calculation logic in `geminiService.ts`, `process.env.API_KEY` is used).
3.  **PayPal**:
    *   Update the email address in `LandingPage.tsx`.
    *   Implement the backend verification mentioned above.

## 👨‍💻 Credits

**Created by Vibe.**
