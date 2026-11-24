# Project Rules: Symbolic AI Document QA System (AID201A)

## 1. Tech Stack & Strict Academic Constraints
- **Stack:** Vanilla HTML5, Tailwind CSS (CDN), and modular ES6+ JavaScript (`type="module"`).
- **Zero External Libraries:** Do NOT install npm packages, React, Node backends, NLP libraries, embeddings, TF-IDF, or LLM/RAG APIs.
- **Pure Symbolic AI Only:** All document parsing, knowledge representation (FOL fact triples & Horn-clause rules), and reasoning (Forward/Backward Chaining) must be deterministic pure JavaScript.

## 2. File Structure & Size Caps (For Speed & IEEE Report Printing)
- Keep every JS file strictly **under 160 lines** so core logic prints cleanly in a 6-page IEEE report.
- `index.html` — High-contrast academic dashboard layout (light mode default for clean print screenshots).
- `js/kb_parser.js` — Deterministic text-to-FOL triples & Horn rules parser.
- `js/inference_engine.js` — Pattern-based goal extractor + Forward/Backward Chaining engine with trace logs.
- `js/evaluator.js` — 10-case test suite (1-hop, multi-hop, negative/closed-world) + Accuracy/Precision/Recall/Latency metrics.
- `js/app.js` — DOM bindings and UI rendering only.

## 3. Antigravity Execution & Speed Rules
- **Targeted Edits Only:** Modify ONLY the specific file(s) named in the prompt. Never rewrite untouched files.
- **No Unnecessary Browser Loops:** Skip headless browser visual checks when editing `js/*.js` logic files; run a visual check ONLY when explicitly asked or after editing `index.html`.
- **Concise Responses:** Output code changes directly without verbose summaries or boilerplate tutorials.
