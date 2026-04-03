import express from "express";
import cors from "cors";
import multer from "multer";
import { analyzeCourseFileContent, analyzeRoadmapSelection, analyzeSkillGap } from "./analysisEngine.js";
import { extractTextFromCourseFile } from "./courseFileParser.js";

const app = express();
const PORT = Number(process.env.AI_BACKEND_PORT || 8787);
const OLLAMA_URL = process.env.OLLAMA_URL || "http://127.0.0.1:11434/api/generate";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "qwen2.5:7b-instruct";
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "masari-ai-backend", port: PORT });
});

async function generateOllamaSummary(result) {
  const prompt = [
    "You are a career advisor assistant.",
    "Summarize the student's skill gap result in 5 concise bullet points.",
    "Use plain Arabic language.",
    `Gap Percent: ${result.summary.gapPercent}%`,
    `Readiness Percent: ${result.summary.readinessPercent}%`,
    "Top gaps:",
    ...result.skillGaps.slice(0, 5).map((item) => `${item.skill}: ${item.gapPercent}% (${item.priority})`),
    "Give a compact 4-week study plan.",
  ].join("\n");

  const response = await fetch(OLLAMA_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      prompt,
      stream: false,
      options: {
        temperature: 0.2,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama failed: ${response.status}`);
  }

  const json = await response.json();
  return json.response || "";
}

app.post("/api/ai/analyze-gap", async (req, res) => {
  try {
    const result = analyzeSkillGap(req.body || {});

    const useOllama = Boolean(req.body?.options?.useOllamaSummary);
    let aiNarrative = "";

    if (useOllama) {
      try {
        aiNarrative = await generateOllamaSummary(result);
      } catch (error) {
        aiNarrative = "";
        result.summary.ollamaWarning = error.message;
      }
    }

    res.json({
      ok: true,
      result: {
        ...result,
        aiNarrative,
      },
    });
  } catch (error) {
    res.status(400).json({
      ok: false,
      error: error instanceof Error ? error.message : "Unexpected analysis error",
    });
  }
});

app.post("/api/ai/roadmap-analysis", async (req, res) => {
  try {
    const result = analyzeRoadmapSelection(req.body || {});

    const useOllama = Boolean(req.body?.options?.useOllamaSummary);
    let aiNarrative = "";

    if (useOllama) {
      try {
        aiNarrative = await generateOllamaSummary(result);
      } catch (error) {
        aiNarrative = "";
        result.summary.ollamaWarning = error.message;
      }
    }

    res.json({
      ok: true,
      result: {
        ...result,
        aiNarrative,
      },
    });
  } catch (error) {
    res.status(400).json({
      ok: false,
      error: error instanceof Error ? error.message : "Unexpected roadmap analysis error",
    });
  }
});

app.post("/api/ai/analyze-course-file", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ ok: false, error: "Course file is required" });
    }

    const fileText = await extractTextFromCourseFile({
      buffer: req.file.buffer,
      mimetype: req.file.mimetype,
      originalname: req.file.originalname,
    });

    let parsedMarketRequirements = [];
    try {
      parsedMarketRequirements = req.body?.marketRequirements ? JSON.parse(req.body.marketRequirements) : [];
    } catch {
      parsedMarketRequirements = [];
    }

    const result = analyzeCourseFileContent({
      fileText,
      courseCode: req.body?.courseCode,
      courseName: req.body?.courseName,
      major: req.body?.major,
      category: req.body?.category,
      marketRequirements: parsedMarketRequirements,
    });

    res.json({
      ok: true,
      result: {
        ...result,
        file: {
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
        },
      },
    });
  } catch (error) {
    res.status(400).json({
      ok: false,
      error: error instanceof Error ? error.message : "Unexpected course file analysis error",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Masari AI backend running on http://localhost:${PORT}`);
});
