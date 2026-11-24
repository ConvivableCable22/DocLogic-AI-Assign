# DocLogic • Deterministic Document QA System (AID201A)

> **Pure First-Order Logic (FOL) & Horn-Clause Inference Engine**  
> Department of Computer Science & Engineering, Ramaiah University of Applied Sciences (MSRUAS)  
> Course: **AID201A - Artificial Intelligence** (3rd Semester B.Tech CSE)  
> Student: **Arnav Jhawar (25ETAI410018)**

---

## 📌 Project Overview
**DocLogic** is an explainable, deterministic Document Question Answering System built using classical Symbolic Artificial Intelligence principles. Unlike probabilistic Large Language Models (LLMs) or Vector-RAG pipelines that suffer from hallucinations, DocLogic strictly adheres to:
- **Zero External NLP Libraries / Zero LLM APIs**: No OpenAI, LangChain, HuggingFace, embeddings, or TF-IDF.
- **Pure First-Order Logic (FOL)**: Documents are deterministically parsed into ground fact triples `(Subject, Predicate, Object)` and Horn-clause production rules `(Premises → Conclusion)`.
- **Deductive Inference**: Evaluates queries using **Backward Chaining** (goal-driven sub-goaling) and **Forward Chaining** (data-driven closure) with complete step-by-step audit trails.
- **Closed-World Assumption (CWA)**: Missing or unprovable facts evaluate strictly as unprovable/false rather than hallucinating answers.
- **Zero-Backend Architecture**: 100% client-side execution in vanilla JavaScript (ES6+ Modules) and Tailwind CSS.

---

## 🚀 Key Features

1. **Multi-Format Document Ingestion**:
   - Supports plain text (**`.txt`**), Microsoft Word (**`.docx`**), and Portable Document Format (**`.pdf`**).
   - In-browser document parsing using PDF.js and Mammoth.js (with pure JavaScript stream fallback).
2. **Deterministic Knowledge Base Extraction**:
   - Parses unstructured/semi-structured statements into First-Order Logic triples and Horn rules.
   - Live visual Knowledge Base Viewer displaying extracted Ground Facts and Production Rules.
3. **Dual Chaining Inference Engine**:
   - **Backward Chaining**: Goal-directed reasoning recursively searching for satisfying rules and ground facts.
   - **Forward Chaining**: Successive iteration of production rules until fixed-point closure.
   - Explanatory audit trail logging every step, rule fired, premise satisfied, or CWA derivation failure.
4. **Automated Evaluation Benchmark Suite**:
   - Dynamically benchmarks reasoning performance against the loaded Knowledge Base across:
     - 1-Hop ground fact lookups
     - Multi-hop Horn clause deductions
     - Closed-world negative unprovability checks
   - Computes **Accuracy, Precision, Recall, and Sub-Millisecond Latency**.

---

## 📂 File Architecture

```text
CodeBase/
├── index.html                   # Bento dashboard UI (Tailwind CSS CDN)
├── js/
│   ├── app.js                   # DOM controller & client-side file extractor (143 lines)
│   ├── kb_parser.js             # Text to FOL Triples & Horn Rules compiler (79 lines)
│   ├── inference_engine.js      # Forward/Backward chaining reasoning engine (120 lines)
│   └── evaluator.js             # Dynamic benchmark suite & academic metrics (72 lines)
├── samples/                     # Test policy documents (.txt, .docx, .pdf)
│   ├── sample_academic_policy.txt
│   ├── sample_scholarship_policy.docx
│   └── sample_library_policy.pdf
├── screenshots/                 # High-resolution UI captures for IEEE Report
└── README.md                    # System documentation
```
*Note: All core JavaScript logic files strictly adhere to a **< 160 lines** limit for direct inclusion in academic reports.*

---

## 🛠️ How to Run Locally

Because DocLogic uses standard ES6 modules (`type="module"`), run it with any lightweight HTTP server:

```bash
# Using Python
python -m http.server 5173

# Or using Node npx
npx serve .
```

Open `http://localhost:5173` in your browser.

---

## 📄 License
Academic Coursework submission for Ramaiah University of Applied Sciences (AID201A).
© 2026 Arnav Jhawar. All rights reserved.
