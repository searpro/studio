# Product Requirements Document (PRD)

**Product Name:** Studio - Asset-based Creative Suite  
**Version:** 1.0 (MVP)  
**Date:** October 2023  
**Status:** In Development / Alpha

---

## 1. Executive Summary
"Studio" is a professional, asset-based AI image generation platform. Unlike traditional "prompt-box" interfaces, Studio allows creators to build reusable libraries of **Characters** and **Scenes**. Users combine these assets with directorial controls (Style, Mood, Shot) to generate consistent, high-quality visuals. The application currently operates as a client-side Single Page Application (SPA) leveraging the Google Gemini API.

## 2. Product Vision
To shift AI creation from "random prompt engineering" to a structured, professional workflow where assets are defined once and reused indefinitely, ensuring consistency across storytelling and design projects.

## 3. Technical Stack
*   **Frontend Framework:** React 19
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS (Dark/Light mode supported)
*   **Routing:** React Router DOM (HashRouter)
*   **AI Provider:** Google Gemini API (`@google/genai` SDK)
*   **Model:** `gemini-2.5-flash-image`
*   **Icons:** Lucide React

## 4. Functional Requirements

### 4.1. Dashboard
**Goal:** Provide a high-level overview of the user's workspace.
*   **Welcome Message:** Personalized greeting.
*   **Quick Stats:** Display counts for Active Characters and Available Scenes.
*   **Quick Actions:** Large call-to-action card to start a new generation.
*   **Recent Activity:** Grid view of the 4 most recently generated images.

### 4.2. Asset Management: Characters
**Goal:** Define consistent personas.
*   **View Library:** Grid layout of existing characters with status indicators (Ready/Preparing).
*   **Create Character:**
    *   Input: Name, Upload Reference Photos (Mocked UI).
    *   Process: Simulates a "Preparing" state (2-second delay) to mimic model fine-tuning/embedding generation.
    *   Result: Character is added to the global state with a "Ready" status.
*   **Card UI:** Displays cover image, name, creation date, and status dot.

### 4.3. Asset Management: Scenes
**Goal:** Define reusable environments.
*   **View Library:** Grid layout of scenes with category badges.
*   **Create Scene:**
    *   Input: Name, Category (Indoor, Outdoor, Fantasy, Sci-Fi, Urban, Nature), Visual Description.
    *   Result: Scene is immediately added to the global state with a generated placeholder thumbnail.
*   **Pre-seeded Content:** App launches with ~6 default scenes (Modern Loft, Neon Street, etc.).

### 4.4. Studio (Generation Engine)
**Goal:** The core workspace for combining assets to create images.
*   **Layout:** Two-column split (Controls vs. Live Preview).
*   **Workflow:**
    1.  **Select Character:** Choose from "Ready" characters.
    2.  **Select Scene:** Choose from available scenes.
    3.  **Action/Details:** Free-text input for specific actions (e.g., "sitting at a desk reading a map").
    4.  **Directorial Controls:**
        *   **Style:** Photorealistic, Cinematic, Illustration, Anime.
        *   **Shot:** Close-up, Portrait, Full body, Wide angle.
        *   **Mood:** Happy, Serious, Dramatic, Cyberpunk.
*   **Output:**
    *   Calls `gemini-2.5-flash-image`.
    *   Constructs a composite prompt ensuring character description + scene description + user action + style modifiers.
    *   Displays loading spinner during generation.
    *   Renders the resulting Base64 image.
    *   **Download:** Direct download button for the generated asset.

### 4.5. Gallery
**Goal:** Archive of creative output.
*   **Layout:** Masonry-style grid of all generated images.
*   **Empty State:** Friendly illustration when no history exists.
*   **Interaction:** Hover to reveal download options.
*   **Persistence:** Images are currently stored in runtime memory (session resets on reload).

### 4.6. Settings & Billing
**Goal:** Account administration (UI Mockups).
*   **Settings Page:**
    *   **Profile:** Edit Display Name and Email.
    *   **Notifications:** Toggles for Email, Browser Push, and Product Updates.
    *   **Security:** View API Key status (masked) and Delete Account option.
*   **Billing Page:**
    *   **Plan Card:** Displays "Studio Pro" ($29/mo) with feature list.
    *   **Usage Stats:** Visual progress bars for "Fast Generations" and "Storage".
    *   **Invoice History:** Table of past payments with status and download icons.

### 4.7. Theme System
*   **Toggle:** Button in Sidebar to switch between Light and Dark modes.
*   **Implementation:** Tailwind `darkMode: 'class'` strategy. Persists for the session.

## 5. Non-Functional Requirements
*   **Responsiveness:** Fully responsive design (Desktop Sidebar / Mobile friendly layouts).
*   **Performance:** UI interactions must be instant; AI generation handles loading states gracefully.
*   **Data Persistence:**
    *   *Current:* In-memory state (React `useState`). Data is lost on refresh.
    *   *Requirement:* Needs backend or local storage implementation for production.
*   **Accessibility:** Semantic HTML, high contrast text in both themes, clear focus states.

## 6. API Integration Details
*   **Service:** `services/geminiService.ts`
*   **Endpoint:** `ai.models.generateContent`
*   **Model:** `gemini-2.5-flash-image`
*   **Prompt Strategy:**
    ```text
    Generate a {style} style image.
    CORE ASSETS:
    - Character: {character.description}
    - Setting: {scene.description}
    SCENE DESCRIPTION / ACTION:
    {userInput}
    ART DIRECTION:
    - Mood: {mood}
    - Shot Type: {shot}
    ```
*   **Auth:** Expects `process.env.API_KEY` to be injected at build/runtime.

## 7. Future Roadmap (Post-MVP)
1.  **Backend Integration:** Connect to Supabase/Firebase for user auth and database persistence.
2.  **Real Model Training:** Replace mocked "Character Preparation" with actual LoRA/Embedding training via Gemini tuning APIs (when available/supported).
3.  **Image Storage:** Upload generated images to cloud storage (S3/GCS) instead of base64 strings.
4.  **Advanced Editing:** In-painting and out-painting tools.
5.  **Community:** Public gallery to share Scenes.
