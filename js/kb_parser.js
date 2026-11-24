// Symbolic AI Document QA System - Knowledge Base Parser
export const SAMPLE_POLICY_DOC = `# MSRUAS B.Tech Academic & Examination Eligibility Policy

# FACTS: Base Student Academic Records
Rahul attendance 85
Rahul cie_marks 38
Rahul lab_completed true
Rahul fee_status cleared
Rahul prerequisites_met true

Priya attendance 72
Priya cie_marks 18
Priya lab_completed true
Priya fee_status cleared
Priya prerequisites_met true

Amit attendance 80
Amit cie_marks 25
Amit lab_completed false
Amit fee_status pending
Amit prerequisites_met false

Sneha attendance 92
Sneha cie_marks 45
Sneha lab_completed true
Sneha fee_status cleared
Sneha prerequisites_met true

# HORN RULES: Academic & Examination Inference Engine
RULE R1: IF ?s attendance >= 75 AND ?s cie_marks >= 20 THEN ?s academic_eligible true
RULE R2: IF ?s academic_eligible == true AND ?s lab_completed == true THEN ?s internal_cleared true
RULE R3: IF ?s internal_cleared == true AND ?s fee_status == cleared THEN ?s hall_ticket_approved true
RULE R4: IF ?s hall_ticket_approved == true AND ?s prerequisites_met == true THEN ?s can_sit_for_exam true
RULE R5: IF ?s attendance >= 85 AND ?s cie_marks >= 40 THEN ?s honors_eligible true
RULE R6: IF ?s attendance < 75 THEN ?s condonation_required true
`;

export const DEFAULT_POLICY_DOC = '';

const parseVal = (v) => {
  if (v === 'true') return true;
  if (v === 'false') return false;
  return isNaN(Number(v)) ? v : Number(v);
};

export function parseDocumentToKB(rawText) {
  const facts = [];
  const rules = [];
  if (!rawText || typeof rawText !== 'string') return { facts, rules };

  const lines = rawText.split(/\r?\n/).map((l) => l.trim()).filter((l) => l && !l.startsWith('#') && !l.startsWith('//'));
  let ruleCounter = 1;

  for (const line of lines) {
    if (/^(?:RULE\s+[^:]+:|IF\s+)/i.test(line)) {
      const ruleMatch = line.match(/^(?:RULE\s+([^:]+):\s*)?IF\s+(.+)\s+THEN\s+(.+)$/i);
      if (!ruleMatch) continue;
      const id = (ruleMatch[1] || `R${ruleCounter++}`).trim();
      const [, , condPart, concPart] = ruleMatch;
      const conditions = condPart.split(/\s+AND\s+/i).map((cStr) => {
        const parts = cStr.trim().replace(/[(),]/g, '').split(/\s+/);
        return {
          subject: parts[0],
          predicate: parts[1],
          op: parts[2] || '==',
          object: parseVal(parts[3] !== undefined ? parts[3] : parts[2])
        };
      });
      const cTokens = concPart.trim().replace(/[(),]/g, '').split(/\s+/);
      const conclusion = {
        subject: cTokens[0],
        predicate: cTokens[1],
        object: parseVal(cTokens[2] ?? 'true')
      };
      rules.push({ id, conditions, conclusion });
    } else {
      const clean = line.replace(/^(?:FACT:\s*|[-*•]\s*)/i, '').replace(/[:=,]/g, ' ').trim();
      const tokens = clean.split(/\s+/).filter(Boolean);
      if (tokens.length >= 3) {
        facts.push({
          subject: tokens[0],
          predicate: tokens[1],
          object: parseVal(tokens.slice(2).join(' '))
        });
      }
    }
  }
  return { facts, rules };
}
