import express from "express";
import path from "path";
import multer from "multer";
import pdf from "pdf-parse";
import mammoth from "mammoth";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

// Set up JSON body sizes limit
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

// Configure Multer for in-memory file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB file cap
});

// Lazy-initialized Gemini Client to prevent crash if key is initially absent
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
      throw new Error(
        "GEMINI_API_KEY is not configured. Please supply a valid key in the Settings > Secrets tab."
      );
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Safely resolve pdf-parse import issues if they exist
let pdfParser = pdf;
if (typeof pdfParser !== "function" && (pdfParser as any).default) {
  pdfParser = (pdfParser as any).default;
}

// File extraction utility
async function extractTextFromFile(file: Express.Multer.File): Promise<string> {
  const fileMime = file.mimetype || "";
  const originalName = (file.originalname || "").toLowerCase();

  if (fileMime === "application/pdf" || originalName.endsWith(".pdf")) {
    try {
      const data = await pdfParser(file.buffer);
      return data.text || "";
    } catch (err: any) {
      console.error("PDF extraction error:", err);
      throw new Error(`Failed to extract text from PDF: ${err.message || err}`);
    }
  } else if (
    fileMime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    originalName.endsWith(".docx")
  ) {
    try {
      const result = await mammoth.extractRawText({ buffer: file.buffer });
      return result.value || "";
    } catch (err: any) {
      console.error("DOCX extraction error:", err);
      throw new Error(`Failed to extract text from DOCX: ${err.message || err}`);
    }
  } else if (
    fileMime === "text/plain" ||
    originalName.endsWith(".txt") ||
    originalName.endsWith(".sol") ||
    originalName.endsWith(".rs") ||
    originalName.endsWith(".js") ||
    originalName.endsWith(".ts")
  ) {
    return file.buffer.toString("utf-8");
  } else {
    throw new Error(
      "Unsupported file format. Please upload a PDF, DOCX, solidity (.sol), rust (.rs) or TXT file."
    );
  }
}

// Core Gemini Analysis Logic
async function performGeminiAnalysis(
  text: string,
  fileName: string
): Promise<any> {
  if (!text || text.trim().length === 0) {
    throw new Error("The submitted contract content is empty.");
  }

  const ai = getGeminiClient();

  // Constrain text to fit roughly into safe token limits of 3.5-flash (e.g., ~1M window, but let's take a generous chunk)
  const trimmedText = text.length > 60000 ? text.substring(0, 60000) + "\n[... CONTRACT TRUNCATED FOR LENGTH ANALYSIS ...]" : text;

  const systemInstruction = `You are an elite legal counsel, risk analyst, and smart contract auditor (Solidity/Rust specialist).
Your mission is to completely deobfuscate, humanize, and audit smart contracts or standard legal documents (NDA, SLA, terms, leases, etc.).
Parse the input text and construct a comprehensive, rigorous response as JSON matching the requested responseSchema.

Carefully organize your responses based on these definitions:
1. 'summary': A clean list of 4-7 plain English paragraphs or bullet points describing the contract's actual purpose, mutual obligations, high-level terms, and key deadlines. Avoid dry legalese entirely.
2. 'status': Must be exactly 'Legal' (safer standard terms, typical clauses), 'Illegal' (incorporates illicit provisions, flagrant non-compliance), or 'High-Risk Suspicious' (contains highly predatory clauses, unexpected lockups, exit-scam mechanisms, severe fees, or weird hidden liabilities).
3. 'compliance_score': An integer rating from 0 (terrible, completely predatory/fraudulent/unsafe) to 100 (exemplary fairness, completely standard compliance, no red flags).
4. 'red_flags': Identify up to 6 suspicious variables, predatory terms, uncapped risks, centralizations, or anomalies. For each, extract the underlying 'clause' word-for-word, define the 'issue_detected', and explain 'why_it_is_bad'.
5. 'segments': Break down the whole input text sequentially into distinct, consecutive highlight blocks (usually 10-25 blocks covering everything). Every segment covers a piece of text. Mark its 'risk' classification as 'safe' (positive or fair terms), 'caution' (fees, standard restrictions, common lockups), 'danger' (scams, hidden fees, absolute liability forfeitures, severe lockups, extreme centralization backdoors), or 'none' (generic boilerplate). Elaborate the 'explanation' for each classification. Keep segments clean and sequential so they can be reassembled on the screen in exact order.`;

  const userPrompt = `Analyze this contract file named "${fileName}":

---
${trimmedText}
---`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.1, // low temperature for precise factual extraction
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Bullet points detailing critical elements of the document in plain English.",
            },
            status: {
              type: Type.STRING,
              description: "Overall contract caution level. Options: Legal, Illegal, High-Risk Suspicious.",
            },
            compliance_score: {
              type: Type.INTEGER,
              description: "Fairness and compliance rating (0 to 100).",
            },
            red_flags: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  clause: {
                    type: Type.STRING,
                    description: "Literal string from the contract showing the issue.",
                  },
                  issue_detected: {
                    type: Type.STRING,
                    description: "Summarized title/issue name of the red flag.",
                  },
                  why_it_is_bad: {
                    type: Type.STRING,
                    description: "Why this causes concern, simplified for non-technical users.",
                  },
                },
                required: ["clause", "issue_detected", "why_it_is_bad"],
              },
            },
            segments: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  text: {
                    type: Type.STRING,
                    description: "Text snippet belonging to the contract.",
                  },
                  risk: {
                    type: Type.STRING,
                    description: "Risk category: safe, caution, danger, none.",
                  },
                  explanation: {
                    type: Type.STRING,
                    description: "Brief reasoning behind this risk categorization.",
                  },
                },
                required: ["text", "risk"],
              },
            },
          },
          required: [
            "summary",
            "status",
            "compliance_score",
            "red_flags",
            "segments",
          ],
        },
      },
    });

    const parsedJson = JSON.parse(response.text || "{}");
    return parsedJson;
  } catch (err: any) {
    console.error("Gemini invocation error:", err);
    throw new Error(`AI processing failed: ${err.message || err}`);
  }
}

// REST Backend API Endpoints

// 1. File ingestion and extraction `/api/upload`
app.post("/api/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file was uploaded." });
    }

    const text = await extractTextFromFile(req.file);
    const analysis = await performGeminiAnalysis(text, req.file.originalname);

    res.json({
      success: true,
      textUsed: text,
      metadata: {
        documentName: req.file.originalname,
        documentType: req.file.mimetype || "unknown",
        wordCount: text.split(/\s+/).filter(Boolean).length,
        charCount: text.length,
        detectedLanguage: "English (analyzed)",
      },
      analysis,
    });
  } catch (err: any) {
    console.error("Upload API Error:", err);
    res.status(500).json({
      error: err.message || "An unexpected error occurred during analysis.",
    });
  }
});

// 2. Direct text analysis `/api/analyze-text`
app.post("/api/analyze-text", async (req, res) => {
  try {
    const { text, title } = req.body;
    if (!text || text.trim() === "") {
      return res
        .status(400)
        .json({ error: "No contract code or text provided." });
    }

    const name = title || "Pasted Contract";
    const analysis = await performGeminiAnalysis(text, name);

    res.json({
      success: true,
      textUsed: text,
      metadata: {
        documentName: name,
        documentType: "text/plain",
        wordCount: text.split(/\s+/).filter(Boolean).length,
        charCount: text.length,
        detectedLanguage: "English (analyzed)",
      },
      analysis,
    });
  } catch (err: any) {
    console.error("Analyze Text API Error:", err);
    res.status(500).json({
      error: err.message || "An unexpected error occurred during analysis.",
    });
  }
});

// Vite Middleware for client orchestration
const configServer = async () => {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // SPA Fallback
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
};

configServer().then(() => {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Backend server ready and running on http://0.0.0.0:${PORT}`);
  });
});
