import JSZip from "jszip";
import mammoth from "mammoth";

function decodeBuffer(buffer) {
  return Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer || []);
}

function cleanText(text) {
  return String(text || "")
    .replace(/\r/g, " ")
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function unique(items) {
  return Array.from(new Set(items.filter(Boolean)));
}

const KEYWORD_MAP = [
  { skill: "API Design", keywords: ["api", "rest", "graphql", "endpoint", "microservice"] },
  { skill: "Node.js", keywords: ["node", "express", "backend", "server-side"] },
  { skill: "Python", keywords: ["python", "jupyter", "notebook"] },
  { skill: "SQL", keywords: ["sql", "database", "relational", "query"] },
  { skill: "Data Analysis", keywords: ["data analysis", "analysis", "dashboard", "visualization", "analytics"] },
  { skill: "Statistics", keywords: ["statistics", "probability", "distribution", "hypothesis", "regression"] },
  { skill: "Testing", keywords: ["testing", "test case", "unit test", "integration test", "qa"] },
  { skill: "CI/CD", keywords: ["ci/cd", "pipeline", "deployment", "github actions", "automation"] },
  { skill: "Git", keywords: ["git", "version control", "branch", "commit", "repository"] },
  { skill: "C/C++", keywords: ["c++", "c language", "c programming", "pointer", "memory"] },
  { skill: "Embedded Programming", keywords: ["embedded", "firmware", "microcontroller", "arduino", "stm32"] },
  { skill: "Microcontrollers", keywords: ["microcontroller", "mcu", "embedded", "sensor"] },
  { skill: "Networking", keywords: ["network", "routing", "switching", "tcp", "udp", "dns"] },
  { skill: "Linux", keywords: ["linux", "shell", "bash", "unix", "terminal"] },
  { skill: "Cloud", keywords: ["cloud", "aws", "azure", "gcp", "devops"] },
  { skill: "Monitoring", keywords: ["monitoring", "observability", "logs", "metrics", "alerting"] },
  { skill: "Security Basics", keywords: ["security", "authentication", "authorization", "threat", "vulnerability"] },
  { skill: "Requirements Analysis", keywords: ["requirements", "elicitation", "stakeholder", "business need"] },
  { skill: "Process Mapping", keywords: ["process", "flowchart", "workflow", "bpmn"] },
  { skill: "Documentation", keywords: ["documentation", "specification", "report", "write-up"] },
  { skill: "Communication", keywords: ["presentation", "communication", "teamwork", "collaboration"] },
  { skill: "Project Planning", keywords: ["project plan", "milestone", "schedule", "timeline"] },
  { skill: "Model Evaluation", keywords: ["model evaluation", "accuracy", "precision", "recall", "f1"] },
  { skill: "Machine Learning", keywords: ["machine learning", "ml", "ai", "classification", "prediction"] },
  { skill: "UI/UX", keywords: ["ui", "ux", "design", "prototype", "figma", "user experience"] },
];

export function extractSkillsFromText(text) {
  const normalized = cleanText(text).toLowerCase();
  const scored = KEYWORD_MAP.map((entry) => {
    const hits = entry.keywords.reduce((count, keyword) => {
      return normalized.includes(keyword) ? count + 1 : count;
    }, 0);
    return { skill: entry.skill, hits };
  }).filter((item) => item.hits > 0);

  const skills = scored
    .sort((a, b) => b.hits - a.hits)
    .map((item) => item.skill);

  return unique(skills);
}

async function parsePdf(buffer) {
  const mod = await import("pdf-parse");
  const pdfParse = mod.default || mod;
  const result = await pdfParse(decodeBuffer(buffer));
  return cleanText(result.text);
}

async function parseDocx(buffer) {
  const result = await mammoth.extractRawText({ buffer: decodeBuffer(buffer) });
  return cleanText(result.value);
}

async function parsePptx(buffer) {
  const zip = await JSZip.loadAsync(decodeBuffer(buffer));
  const slideFiles = Object.keys(zip.files).filter((name) => /^ppt\/slides\/slide\d+\.xml$/i.test(name));
  const texts = [];

  for (const fileName of slideFiles) {
    const xml = await zip.files[fileName].async("string");
    const fragments = xml.match(/<a:t[^>]*>(.*?)<\/a:t>/g) || [];
    const cleaned = fragments.map((fragment) => fragment.replace(/<[^>]+>/g, ""));
    texts.push(...cleaned);
  }

  return cleanText(texts.join(" "));
}

export async function extractTextFromCourseFile({ buffer, mimetype = "", originalname = "" }) {
  const ext = originalname.split(".").pop()?.toLowerCase() || "";
  const mime = String(mimetype || "").toLowerCase();

  if (mime.includes("pdf") || ext === "pdf") {
    return parsePdf(buffer);
  }

  if (mime.includes("word") || ext === "docx") {
    return parseDocx(buffer);
  }

  if (mime.includes("presentation") || ext === "pptx") {
    return parsePptx(buffer);
  }

  if (mime.startsWith("text/") || ext === "txt" || ext === "md" || ext === "csv") {
    return cleanText(Buffer.from(buffer).toString("utf8"));
  }

  throw new Error("Unsupported file type. Use PDF, DOCX, PPTX, TXT, MD, or CSV.");
}
