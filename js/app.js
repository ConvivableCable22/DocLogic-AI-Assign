// DocLogic (AID201A) - Application Controller & DOM Binder
import { SAMPLE_POLICY_DOC, parseDocumentToKB } from './kb_parser.js';
import { answerQuestion } from './inference_engine.js';
import { runBenchmark } from './evaluator.js';

let currentKB = { facts: [], rules: [] }, chainingMode = 'backward';
const $ = (id) => document.getElementById(id);

function renderKB(kb) {
  $('factCount').textContent = kb.facts.length;
  $('ruleCount').textContent = kb.rules.length;
  $('factsTable').innerHTML = kb.facts.length
    ? kb.facts.map((f) => `<tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40"><td class="p-2 text-center font-semibold text-slate-800 dark:text-slate-200">${f.subject}</td><td class="p-2 text-center text-blue-600 dark:text-blue-400 font-mono text-[11px]">${f.predicate}</td><td class="p-2 text-center text-slate-600 dark:text-slate-300 font-mono text-[11px]">${f.object}</td></tr>`).join('')
    : '<tr><td colspan="3" class="p-6 text-center text-slate-400 dark:text-zinc-500 font-sans text-xs">No facts loaded. Click "BUILD KNOWLEDGE BASE" to extract facts.</td></tr>';
  $('rulesTable').innerHTML = kb.rules.length
    ? kb.rules.map((r) => `<tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40"><td class="p-2 text-center font-bold text-amber-600 dark:text-amber-400 text-xs">${r.id}</td><td class="p-2 text-center font-mono text-[11px] text-slate-700 dark:text-slate-300">IF ${r.conditions.map((c) => `${c.predicate} ${c.op} ${c.object}`).join(' ∧ ')}</td><td class="p-2 text-center font-mono text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">THEN ${r.conclusion.predicate}=${r.conclusion.object}</td></tr>`).join('')
    : '<tr><td colspan="3" class="p-6 text-center text-slate-400 dark:text-zinc-500 font-sans text-xs">No Horn rules loaded. Click "BUILD KNOWLEDGE BASE" to extract rules.</td></tr>';
}

function updatePresets(kb) {
  const container = $('presetContainer');
  if (!container) return;
  if (!kb.facts.length && !kb.rules.length) {
    container.innerHTML = '<span class="font-display font-bold text-slate-600 dark:text-zinc-400 mr-1 flex items-center gap-1">⚡ Presets:</span><span class="text-xs text-slate-400 dark:text-zinc-500 italic">Click "BUILD KNOWLEDGE BASE" to generate query presets</span>';
    return;
  }
  const chips = [
    kb.facts[0] && `What is the ${kb.facts[0].predicate} of ${kb.facts[0].subject}?`,
    kb.facts[1] && `What is the ${kb.facts[1].predicate} of ${kb.facts[1].subject}?`,
    kb.rules[0] && kb.facts[0] && `Is ${kb.facts[0].subject} ${kb.rules[0].conclusion.predicate}?`,
    kb.rules[3] && kb.facts[0] && `Can ${kb.facts[0].subject} ${kb.rules[3].conclusion.predicate}?`
  ].filter(Boolean);
  container.innerHTML = `<span class="font-display font-bold text-slate-600 dark:text-zinc-400 mr-1 flex items-center gap-1">⚡ Dynamic Presets:</span>` +
    chips.map((q) => `<button class="preset-chip min-h-[36px] px-3 py-1 bg-slate-50 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 border-2 border-slate-900 dark:border-white/20 rounded-full font-medium text-xs shadow-brutal-sm dark:shadow-none hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:border-blue-600 hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] transition-all cursor-pointer" data-query="${q}">${q}</button>`).join('');
  container.querySelectorAll('.preset-chip').forEach((chip) => chip.addEventListener('click', () => handleAsk(chip.dataset.query)));
}

function handleAsk(query) {
  const q = query ?? $('queryInput').value.trim();
  if (query) $('queryInput').value = query;
  if (!q) return;
  if (!currentKB.facts.length && !currentKB.rules.length) {
    $('traceList').innerHTML = '<li class="p-3 text-rose-500 dark:text-rose-400 font-mono text-xs">Knowledge Base not built yet. Click "BUILD KNOWLEDGE BASE" first.</li>';
    $('statusBadge').textContent = 'KB NOT BUILT';
    $('statusBadge').className = 'inline-block mt-0.5 px-2.5 py-0.5 text-xs font-bold rounded-full bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-700';
    return;
  }
  const res = answerQuestion(q, currentKB, chainingMode);
  $('goalDisplay').textContent = res.goal ? `${res.goal.subject}.${res.goal.predicate} == ${res.goal.object}` : 'Unrecognized Goal';
  $('statusBadge').className = `inline-block mt-0.5 px-2.5 py-0.5 text-xs font-bold rounded-full ${res.status === 'PROVED' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700' : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-700'}`;
  $('statusBadge').textContent = `${res.status} [${res.answer}]`;
  $('latencyDisplay').textContent = `${res.latencyMs} ms (${res.hops} hops)`;
  $('traceList').innerHTML = res.trace.map((step, idx) => {
    const hl = step.includes('PROVED') || step.includes('Fired');
    return `<li class="p-1 rounded font-mono text-xs ${hl ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-medium' : 'text-slate-700 dark:text-slate-300'}"><span class="font-bold text-slate-400 dark:text-slate-600 mr-1.5">[${idx + 1}]</span>${step}</li>`;
  }).join('');
}

function handleBenchmark() {
  const { cases, metrics } = runBenchmark(currentKB, chainingMode);
  $('metricAccuracy').textContent = cases.length ? `${metrics.accuracy}%` : '-%';
  $('metricPrecision').textContent = cases.length ? metrics.precision : '-';
  $('metricRecall').textContent = cases.length ? metrics.recall : '-';
  $('metricLatency').textContent = cases.length ? `${metrics.avgLatencyMs} ms` : '- ms';
  $('benchmarkTable').innerHTML = cases.length
    ? cases.map((c) => `<tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40 font-mono text-xs"><td class="p-2.5 font-bold">${c.id}</td><td class="p-2.5 font-sans text-slate-600 dark:text-slate-400">${c.category}</td><td class="p-2.5 font-sans font-medium text-slate-900 dark:text-slate-100">${c.query}</td><td class="p-2.5 text-slate-600 dark:text-slate-300">${c.expected}</td><td class="p-2.5 font-bold ${c.status === 'PROVED' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}">${c.actual}</td><td class="p-2.5 text-center"><span class="px-2 py-0.5 text-[11px] font-bold rounded-full ${c.passed ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700' : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-700'}">${c.passed ? 'PASS' : 'FAIL'}</span></td><td class="p-2.5 text-slate-500">${c.latencyMs} ms</td></tr>`).join('')
    : '<tr><td colspan="7" class="p-6 text-center text-slate-400 dark:text-zinc-500 font-sans text-xs">Knowledge Base not built yet. Click "BUILD KNOWLEDGE BASE" first.</td></tr>';
}

function resetKB() {
  currentKB = { facts: [], rules: [] };
  renderKB(currentKB);
  updatePresets(currentKB);
  handleBenchmark();
}

async function extractText(file) {
  const ext = file.name.split('.').pop().toLowerCase();
  if (ext === 'docx' && window.mammoth) {
    const res = await window.mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
    return res.value;
  }
  if (ext === 'pdf') {
    const buf = await file.arrayBuffer();
    try {
      if (window.pdfjsLib) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        const pdf = await window.pdfjsLib.getDocument({ data: buf }).promise;
        let text = '', lastY;
        for (let i = 1; i <= pdf.numPages; i++) {
          const content = await (await pdf.getPage(i)).getTextContent();
          for (const it of content.items) {
            if (lastY !== undefined && Math.abs(it.transform[5] - lastY) > 5) text += '\n';
            text += it.str + ' ';
            lastY = it.transform[5];
          }
          text += '\n';
        }
        if (text.trim()) return text;
      }
    } catch (e) { console.warn('PDF.js warning, using fallback:', e); }
    const raw = new TextDecoder('latin1').decode(new Uint8Array(buf)), lines = [], re = /(?:\(([^)]+)\)\s*(?:Tj|'|")|\[([^\]]+)\]\s*TJ)/g;
    let m;
    while ((m = re.exec(raw)) !== null) { if (m[1]) lines.push(m[1].replace(/\\([()\\])/g, '$1')); }
    return lines.join('\n');
  }
  return await file.text();
}

document.addEventListener('DOMContentLoaded', () => {
  resetKB();
  $('btnBuildKB').addEventListener('click', () => {
    const raw = $('docEditor').value.trim();
    if (!raw) return alert('Please upload a file or enter document text first.');
    currentKB = parseDocumentToKB(raw);
    renderKB(currentKB);
    updatePresets(currentKB);
    handleBenchmark();
  });
  $('btnLoadSample')?.addEventListener('click', () => { $('docEditor').value = SAMPLE_POLICY_DOC; resetKB(); });
  $('btnClearDoc')?.addEventListener('click', () => {
    $('docEditor').value = $('queryInput').value = '';
    if ($('fileInput')) $('fileInput').value = '';
    $('goalDisplay').textContent = $('statusBadge').textContent = $('latencyDisplay').textContent = '-';
    $('statusBadge').className = 'inline-block mt-0.5 px-3 py-0.5 text-xs font-bold rounded-full bg-slate-200 text-slate-700 border border-slate-400 dark:border-zinc-700';
    $('traceList').innerHTML = '<li class="p-3 text-center text-slate-400 dark:text-zinc-500 font-sans text-xs">Upload a document and run a proof to inspect the deductive inference trace.</li>';
    resetKB();
  });
  $('fileInput').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try { $('docEditor').value = await extractText(file); resetKB(); } catch (err) { console.error('File parsing error:', err); }
  });
  $('btnAsk').addEventListener('click', () => handleAsk());
  $('queryInput').addEventListener('keydown', (e) => { if (e.key === 'Enter') handleAsk(); });
  $('btnRunBenchmark').addEventListener('click', handleBenchmark);
  $('darkToggle').addEventListener('click', () => document.documentElement.classList.toggle('dark'));

  if (new URLSearchParams(window.location.search).has('demo')) {
    $('docEditor').value = SAMPLE_POLICY_DOC;
    currentKB = parseDocumentToKB(SAMPLE_POLICY_DOC);
    renderKB(currentKB);
    updatePresets(currentKB);
    handleAsk('Can Rahul sit for exam?');
    handleBenchmark();
    const f = new URLSearchParams(window.location.search).get('focus');
    if (f === 'panel3' && $('topGrid')) $('topGrid').style.display = 'none';
    if (f === 'panel4') {
      if ($('topGrid')) $('topGrid').style.display = 'none';
      if ($('panel3')) $('panel3').style.display = 'none';
    }
  }
});
