// Pure Symbolic AI Inference Engine: Forward & Backward Chaining
export function parseQuestion(q) {
  const text = q.trim().replace(/[?.,!]/g, '');
  let m = text.match(/what\s+is\s+(?:the\s+)?([a-z0-9_]+)\s+of\s+([a-z0-9_]+)/i);
  if (m) return { subject: m[2], predicate: m[1].toLowerCase(), object: '?' };
  m = text.match(/what\s+is\s+([a-z0-9_]+)['’]s\s+([a-z0-9_]+)/i);
  if (m) return { subject: m[1], predicate: m[2].toLowerCase(), object: '?' };
  m = text.match(/can\s+([a-z0-9_]+)\s+sit\s+for(?:\s+[a-z0-9_]+)?\s+exam/i);
  if (m) return { subject: m[1], predicate: 'can_sit_for_exam', object: true };
  m = text.match(/is\s+([a-z0-9_]+)\s+academically\s+eligible/i);
  if (m) return { subject: m[1], predicate: 'academic_eligible', object: true };
  m = text.match(/is\s+([a-z0-9_]+)\s+(?:eligible\s+for\s+honors|honors\s+eligible)/i);
  if (m) return { subject: m[1], predicate: 'honors_eligible', object: true };
  m = text.match(/does\s+([a-z0-9_]+)\s+require\s+condonation/i);
  if (m) return { subject: m[1], predicate: 'condonation_required', object: true };
  m = text.match(/(?:is\s+([a-z0-9_]+)\s+hall\s+ticket\s+approved|does\s+([a-z0-9_]+)\s+have\s+hall\s+ticket)/i);
  if (m) return { subject: m[1] || m[2], predicate: 'hall_ticket_approved', object: true };
  m = text.match(/(?:does|has)\s+([a-z0-9_]+)\s+(?:have\s+)?([a-z0-9_]+)/i);
  if (m) return { subject: m[1], predicate: m[2].toLowerCase(), object: true };
  m = text.match(/can\s+([a-z0-9_]+)\s+([a-z0-9_]+)/i);
  if (m) return { subject: m[1], predicate: m[2].toLowerCase(), object: true };
  m = text.match(/is\s+([a-z0-9_]+)\s+([a-z0-9_]+)/i);
  if (m) return { subject: m[1], predicate: m[2].toLowerCase(), object: true };
  m = text.match(/^([a-z0-9_]+)\s+([a-z0-9_]+)$/i);
  if (m) return { subject: m[1], predicate: m[2].toLowerCase(), object: '?' };
  return null;
}

const evalOp = (a, op, b) =>
  op === '>=' ? a >= b : op === '<=' ? a <= b : op === '>' ? a > b : op === '<' ? a < b : op === '!=' ? a !== b : a === b;

function forwardChaining(goal, kb, trace) {
  const facts = [...kb.facts];
  const subjects = [...new Set(facts.map((f) => f.subject))];
  let changed = true;
  trace.push(`[FC] Initialized with ${facts.length} base facts`);
  while (changed) {
    changed = false;
    for (const rule of kb.rules) {
      for (const s of subjects) {
        const sat = rule.conditions.every((c) => {
          const f = facts.find((x) => x.subject.toLowerCase() === s.toLowerCase() && x.predicate === c.predicate);
          return f && evalOp(f.object, c.op, c.object);
        });
        if (sat) {
          const conc = { subject: s, predicate: rule.conclusion.predicate, object: rule.conclusion.object };
          if (!facts.some((f) => f.subject.toLowerCase() === s.toLowerCase() && f.predicate === conc.predicate)) {
            facts.push(conc);
            changed = true;
            trace.push(`[FC] Fired ${rule.id} for ${s} => Inferred (${conc.predicate}: ${conc.object})`);
          }
        }
      }
    }
  }
  const match = facts.find((f) => f.subject.toLowerCase() === goal.subject.toLowerCase() && f.predicate === goal.predicate);
  if (match) {
    const ok = goal.object === '?' || evalOp(match.object, '==', goal.object);
    return { status: ok ? 'PROVED' : 'UNPROVABLE', answer: ok ? match.object : false, hops: 1 };
  }
  trace.push(`[FC] Closed-World Assumption: No derivation for (${goal.subject}, ${goal.predicate})`);
  return { status: 'UNPROVABLE', answer: false, hops: 0 };
}

function backwardChaining(goal, kb, trace, visited = new Set()) {
  const goalKey = `${goal.subject}:${goal.predicate}:${goal.object}`;
  if (visited.has(goalKey)) return { status: 'UNPROVABLE', answer: false, hops: 0 };
  visited.add(goalKey);

  const bf = kb.facts.find((f) => f.subject.toLowerCase() === goal.subject.toLowerCase() && f.predicate === goal.predicate);
  if (bf) {
    if (goal.object === '?' || evalOp(bf.object, '==', goal.object)) {
      trace.push(`[BC] Base fact proven: (${bf.subject}, ${bf.predicate}, ${bf.object})`);
      return { status: 'PROVED', answer: bf.object, hops: 1 };
    }
    trace.push(`[BC] Base fact mismatch for ${goal.predicate}: ${bf.object} != ${goal.object}`);
    return { status: 'UNPROVABLE', answer: false, hops: 0 };
  }

  const candidateRules = kb.rules.filter((r) => r.conclusion.predicate === goal.predicate);
  for (const rule of candidateRules) {
    trace.push(`[BC] Checking Rule ${rule.id} to satisfy (${goal.subject}, ${goal.predicate})`);
    let ruleSat = true;
    let maxSubHops = 0;
    for (const cond of rule.conditions) {
      const subGoal = { subject: goal.subject, predicate: cond.predicate, object: cond.object };
      const subFact = kb.facts.find((f) => f.subject.toLowerCase() === goal.subject.toLowerCase() && f.predicate === cond.predicate);
      if (subFact) {
        if (!evalOp(subFact.object, cond.op, cond.object)) {
          trace.push(`[BC] Premise failed: ${cond.predicate}=${subFact.object} not ${cond.op} ${cond.object}`);
          ruleSat = false;
          break;
        }
        trace.push(`[BC] Premise satisfied: ${cond.predicate}=${subFact.object} ${cond.op} ${cond.object}`);
        maxSubHops = Math.max(maxSubHops, 1);
      } else {
        const subRes = backwardChaining(subGoal, kb, trace, new Set(visited));
        if (subRes.status !== 'PROVED') {
          trace.push(`[BC] Sub-goal failed: (${goal.subject}, ${cond.predicate})`);
          ruleSat = false;
          break;
        }
        maxSubHops = Math.max(maxSubHops, subRes.hops + 1);
      }
    }
    if (ruleSat) {
      trace.push(`[BC] Rule ${rule.id} PROVED goal (${goal.subject}, ${goal.predicate})`);
      return { status: 'PROVED', answer: rule.conclusion.object, hops: maxSubHops + 1 };
    }
  }
  trace.push(`[BC] Closed-World Assumption: (${goal.subject}, ${goal.predicate}) is UNPROVABLE`);
  return { status: 'UNPROVABLE', answer: false, hops: 0 };
}

export function answerQuestion(question, kb, mode = 'backward') {
  const start = performance.now();
  const trace = [];
  const goal = parseQuestion(question);
  if (!goal) {
    return { goal: null, answer: 'Query format not recognized', status: 'UNPROVABLE', trace: ['Regex parser: no goal pattern matched'], latencyMs: 0, hops: 0 };
  }
  trace.push(`Parsed Target Goal: [Subject: ${goal.subject}, Predicate: ${goal.predicate}, Target: ${goal.object}]`);
  const res = mode === 'forward' ? forwardChaining(goal, kb, trace) : backwardChaining(goal, kb, trace);
  const latencyMs = parseFloat((performance.now() - start).toFixed(2));
  return { goal, answer: res.answer, status: res.status, hops: res.hops, trace, latencyMs };
}
