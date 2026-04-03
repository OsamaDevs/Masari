# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Free Local AI Backend (Skill Gap Analyzer)

This project now includes a free backend AI analyzer that runs locally and compares:

- student courses and skills
- market job skill requirements

Then it returns:

- gap percentage
- readiness percentage
- per-skill gap ranking
- recommended resources to close the gaps

### Run the backend

```bash
npm install
npm run server
```

Backend endpoint:

- `POST /api/ai/analyze-gap`
- Health check: `GET /api/health`

The frontend uses Vite proxy, so `/api/*` is forwarded to `http://localhost:8787`.

### Optional free local LLM narrative (Ollama)

If you want Arabic narrative text generated locally:

1. Install Ollama
2. Pull a free model (example):

```bash
ollama pull qwen2.5:7b-instruct
```

3. Keep Ollama running, then enable "Use local Ollama narrative" in Course Analysis page.

### Data you should provide for best analysis quality

#### 1) Student transcript/course data (required)

For each course:

- `code` (e.g. `CS301`)
- `title`
- `skills[]` (normalized skill tokens)
- `semester` (number)
- `grade` (numeric 0-100 or letter)
- `creditHours`

#### 2) Market requirements data (required)

For each market item (company/role):

- `company`
- `role`
- `requiredSkills[]`
- `weight` (importance multiplier, e.g. `1.2`)
- optional `minSemester`, `maxSemester`

#### 3) Resource catalog (recommended)

Map each skill to learning resources:

- `title`
- `url`
- `type` (`course`, `video`, `docs`, `article`)
- optional `durationHours`

Example:

```json
{
	"SQL": [
		{
			"title": "SQLBolt Interactive SQL",
			"url": "https://sqlbolt.com/",
			"type": "interactive",
			"durationHours": 4
		}
	]
}
```

### Formula used

- Per skill: `G_s = max(0, R_s - C_s)`
- Total gap: `Gap% = 100 * sum(w_s * G_s) / sum(w_s * R_s)`
- Current level: `C_s = 0.45*grade + 0.35*recency + 0.2*courseDepth`

This keeps scoring deterministic and auditable while AI is used only for optional narrative explanation.

## Roadmap AI Flow (when student chooses a job roadmap)

When the student clicks a target job in Roadmap page, backend now returns:

- Saudi market outlook for that job
- gap percentage between student's real courses and market requirements
- most relevant student courses to the selected job
- prioritized external resources to close top gaps

### Use real student courses (not demo curriculum)

Upload a transcript JSON from inside the Roadmap modal. A template is available at:

- `public/data/student-transcript.template.json`

Required fields per course:

- `code`
- `title`
- `major`
- `semester`
- `grade`
- `creditHours`
- `skills[]`

If transcript is uploaded, analysis and roadmap mapping will use those real courses first. If not uploaded, fallback curriculum is used.
