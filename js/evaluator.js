// Symbolic AI Evaluation Suite & Dynamic Academic Metrics
import { answerQuestion } from './inference_engine.js';

export function getBenchmarkCases(kb) {
  if (!kb || (!kb.facts?.length && !kb.rules?.length)) return [];
  const subjects = [...new Set(kb.facts.map((f) => f.subject))];
  const isDefaultDoc = subjects.includes('Rahul') && subjects.includes('Priya');
  if (isDefaultDoc) {
    return [
      { id: 'TC01', category: '1-hop fact', query: 'What is the attendance of Rahul?', expected: 85 },
      { id: 'TC02', category: '1-hop fact', query: 'What is the cie_marks of Priya?', expected: 18 },
      { id: 'TC03', category: '1-hop fact', query: 'What is the fee_status of Amit?', expected: 'pending' },
      { id: 'TC04', category: '1-hop fact', query: 'What is the lab_completed of Sneha?', expected: true },
      { id: 'TC05', category: 'multi-hop rule', query: 'Is Rahul academically eligible?', expected: true },
      { id: 'TC06', category: 'multi-hop rule', query: 'Can Rahul sit for exam?', expected: true },
      { id: 'TC07', category: 'multi-hop rule', query: 'Is Sneha eligible for honors?', expected: true },
      { id: 'TC08', category: 'multi-hop rule', query: 'Does Priya require condonation?', expected: true },
      { id: 'TC09', category: 'negative closed-world', query: 'Can Amit sit for exam?', expected: false },
      { id: 'TC10', category: 'negative closed-world', query: 'Can Priya sit for exam?', expected: false }
    ];
  }

  const cases = [];
  let count = 1;
  const pad = (n) => `TC${String(n).padStart(2, '0')}`;
  for (const f of kb.facts.slice(0, 4)) {
    cases.push({ id: pad(count++), category: '1-hop fact', query: `What is the ${f.predicate} of ${f.subject}?`, expected: f.object });
  }
  for (const r of kb.rules.slice(0, 4)) {
    for (const s of subjects.slice(0, 2)) {
      if (count > 8) break;
      cases.push({ id: pad(count++), category: 'multi-hop rule', query: `Is ${s} ${r.conclusion.predicate}?`, expected: r.conclusion.object });
    }
  }
  cases.push({ id: pad(count++), category: 'negative closed-world', query: 'Is UnknownEntity eligible?', expected: false });
  if (subjects[0]) cases.push({ id: pad(count++), category: 'negative closed-world', query: `What is the non_existent_prop of ${subjects[0]}?`, expected: false });
  return cases;
}

export function runBenchmark(kb, mode = 'backward') {
  const cases = getBenchmarkCases(kb);
  if (!cases.length) {
    return { cases: [], metrics: { accuracy: 0, precision: 0, recall: 0, avgLatencyMs: 0 } };
  }
  const results = [];
  let tp = 0, fp = 0, tn = 0, fn = 0, totalLatency = 0;

  for (const tc of cases) {
    const res = answerQuestion(tc.query, kb, mode);
    let passed = false;
    const isPosExpected = tc.expected !== false;
    const isPosPred = res.status === 'PROVED';

    if (typeof tc.expected === 'boolean') {
      passed = tc.expected ? (res.status === 'PROVED' && res.answer === true) : (res.status === 'UNPROVABLE');
    } else {
      passed = res.status === 'PROVED' && res.answer === tc.expected;
    }

    if (isPosExpected && isPosPred) tp++;
    else if (!isPosExpected && isPosPred) fp++;
    else if (!isPosExpected && !isPosPred) tn++;
    else if (isPosExpected && !isPosPred) fn++;

    totalLatency += res.latencyMs;
    results.push({
      id: tc.id, category: tc.category, query: tc.query, expected: tc.expected,
      actual: res.status === 'PROVED' ? res.answer : 'UNPROVABLE',
      status: res.status, passed, hops: res.hops, latencyMs: res.latencyMs
    });
  }

  const total = cases.length;
  const passedCount = results.filter((r) => r.passed).length;
  const precision = tp + fp > 0 ? parseFloat((tp / (tp + fp)).toFixed(4)) : 1.0;
  const recall = tp + fn > 0 ? parseFloat((tp / (tp + fn)).toFixed(4)) : 1.0;
  const accuracy = parseFloat(((passedCount / total) * 100).toFixed(2));
  const avgLatencyMs = parseFloat((totalLatency / total).toFixed(2));

  return { cases: results, metrics: { accuracy, precision, recall, avgLatencyMs, totalCases: total, passedCount, tp, fp, tn, fn } };
}
