📝 Project Blueprint: Telegram Mini App "Grechka"
Objective: Develop a high-performance Telegram Mini App (TMA) for learning the Greek language (Top 1000 words and Top 1000 phrases) specifically for Russian-speaking users.

1. General Information
Project Name: Grechka (Гречка)

Platform: Telegram Mini Apps (TMA)

Target Audience: Russian speakers learning Greek from scratch or at an intermediate level.

Core Principle: "Antigravity" speed of development and UI responsiveness.

2. Technical Stack
Frontend: React 18+ (Vite) — for near-instant loading.

Language: TypeScript — to ensure type safety and minimize runtime errors.

Styling: Tailwind CSS + Telegram UI Components (official library for native TG look & feel).

Integration: @telegram-apps/sdk — for seamless communication with the Telegram API.

Database (Local): knowledge_base.json (to be generated via NotebookLM).

State Management: Zustand or React Context — for tracking progress and settings.

Data Persistence: window.Telegram.WebApp.CloudStorage — to sync user progress across devices.

3. Core Functional Modules
3.1. "Words" Module (Flashcards)
Mechanic: "Tinder-style" swipes: Swipe Right for "Known", Swipe Left for "Review later".

Display: Greek Word -> Transcription -> Russian Translation (revealed on tap).

Algorithm: Priority given to high-frequency words from the Top 1000 list.

3.2. "Phrases" Module
Content: 1000 essential phrases categorized by topic (Food, Transport, Greeting, etc.).

Audio: "Listen" button utilizing the native Web Speech API for text-to-speech.

3.3. "Progress" Module
Visuals: Circular Progress Bar on the main dashboard.

Stats: Counter displaying "Learned: X / 2000 units".

4. Telegram Integration & Design
Theming: Automatic implementation of Telegram CSS variables (e.g., --tg-theme-bg-color, --tg-theme-text-color). The app must adapt perfectly to both Light and Dark modes.

UX: Support for HapticFeedback (vibration) on correct answers or swipe actions.

Native UI: Active use of the Telegram MainButton and BackButton for primary navigation.

5. Development & Testing Requirements (Webview-First)
5.1. Environment Emulation
Agent Requirement: Set up @telegram-apps/mock-sdk to ensure the app runs within the Antigravity IDE browser.

Mock Data: In the absence of the global window.Telegram object, initialize a test user profile: id: 12345, first_name: "Test Greek", language_code: "ru".

5.2. IDE-Based Testing
Mobile-First: Development must strictly target a mobile aspect ratio (recommended: 390x844).

Webview Verification: The Agent must verify every UI component in the built-in Webview.

Debug Tools: Integrate the eruda console, enabled only in development mode.

6. Data Structure (JSON Schema)
The Agent shall expect data in src/data/knowledge_base.json using the following format:

JSON
{
   {"rank": 155, "greek": "χρήση", "russian_translation": "использование / применение"}
}
7. Step-by-Step Instructions for the AI Agent
Step 1: Initialize the Vite + React + TS project.

Step 2: Install dependencies: @telegram-apps/sdk, lucide-react, tailwindcss, clsx, tailwind-merge.

Step 3: Configure vite.config.ts for host: true and ensure proper Webview rendering.

Step 4: Implement the Telegram Mock Provider to allow local development without a real TG client.

Step 5: Create the base Layout with bottom Tab navigation.

Step 6: Implement the JSON data loading logic and render the first functional word card.
## 8. Exercise Engine & Game Logic
Implement a factory pattern for various exercise types to keep user engagement high.

### Exercise Types to Implement:
1. **Classic Quiz:** 1 target item vs 4 distractors (Multiple Choice).
2. **Word Builder:** Scrambled letters of a Greek word to be put in order.
3. **Matching Pairs:** A 4x4 grid where users match Greek words with Russian equivalents.
4. **Instant Recall (True/False):** Rapid-fire mode to check if a translation is correct.
5. **Context Fill:** For phrases, hide one word and provide options to fill the gap.

### Logic Requirements:
- **Distractor Generation:** The AI should pull random "wrong" answers from the same category/level in `knowledge_base.json` to create options for quizzes.
- **Session Management:** One learning session = 10 mixed exercises.
- **Spaced Repetition:** Words that the user got wrong must reappear more frequently in the next session.
- **Feedback:** Add "Correct/Wrong" visual and haptic feedback (vibration) for each answer.