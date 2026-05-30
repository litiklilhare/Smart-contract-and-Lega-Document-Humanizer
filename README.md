# Smart Contract & Legal Document "Humanizer" 📜✨
An AI-powered web application that simplifies complex legal jargon and blockchain smart contracts into easy-to-understand, human-readable language. Built using Google AI Studio (Gemini API) for advanced text processing and Firebase for a robust backend.
---
## 🚀 Features
* **Smart Contract Decoder:** Paste any Solidity or blockchain smart contract code to understand its functions, risks, and conditions in plain language.
* **Legal Document Simplifier:** Upload or paste lengthy legal PDFs, agreements, or terms of service to get instant, jargon-free summaries.
* **Risk & Loophole Detector:** Highlights potential red flags, hidden clauses, or high-risk functions in the documents.
* **Interactive AI Chat:** Ask follow-up questions about specific clauses directly to the AI model.
* **Secure History:** Track and save your previously analyzed documents securely (powered by Firebase).
---
## 🛠️ Tech Stack

| Component | Technology Used |
| :--- | :--- |
| **Frontend** | HTML5, CSS3, JavaScript (or React/Vue if applicable) |
| **AI Integration** | Google AI Studio (Gemini API) |
| **Backend & Auth** | Firebase (Firestore, Authentication, Hosting) |

---
## 📸 Architecture & Workflow
1. **User Input:** User uploads a PDF/Text file or pastes raw Smart Contract code.
2. **Backend Processing:** Firebase handles the user session and secure API requests.
3. **AI Analysis:** The prompt is sent to Google AI Studio, optimized to break down legalese into simple terms.
4. **Output Generation:** The UI renders structured, easy-to-read explanations with key highlights and risks.
---
# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/81525776-8cbc-4055-a048-cfca75d777dc

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
