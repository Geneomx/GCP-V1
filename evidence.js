import { MED_DB, LAB_SUGGESTIONS } from "./data.js";
import { escapeHtml, uniq } from "./utils.js";
import { renderCitationChip } from "./citations.js";

export function claimsForSelectedMeds(state){
  const out = [];
  for(const mi of state.meds){
    const med = MED_DB.find(x => x.id===mi.medId);
    if(!med) continue;
    for(const cl of (med.claims||[])){ out.push({ medId: med.id, medName: med.name, ...cl }); }
  }
  return out;
}

export function aggregateEvidenceByNutrient(claims){
  const map = {};
  for(const cl of claims){
    if(!map[cl.nutrient]) map[cl.nutrient] = [];
    map[cl.nutrient].push(cl);
  }
  return map;
}

export function summarizeSourceQuality(claims){
  const qs = (claims||[]).map(c=>c.source_quality).filter(Boolean);
  if(qs.includes("High")) return "High";
  if(qs.includes("Moderate")) return "Moderate";
  if(qs.includes("Preliminary")) return "Preliminary";
  return "Pending";
}

export function badgeClass(q){
  if(q==="High") return "high";
  if(q==="Moderate") return "mod";
  if(q==="Preliminary") return "pre";
  return "pending";
}

export function renderEvidencePanel(nutrient, claims){
  const labs = LAB_SUGGESTIONS[nutrient] || [];
  const labHtml = labs.length
    ? `<div class="note"><strong>Optional labs to confirm:</strong> ${escapeHtml(labs.join(", "))}</div>`
    : `<div class="note"><strong>Optional labs to confirm:</strong> Ask your clinician based on context.</div>`;

  if(!claims || !claims.length){
    return `<div class="fineprint">Evidence not loaded yet for this nutrient from your selected meds.</div>${labHtml}`;
  }

  const seen = new Set();
  const citations = [];
  const notes = [];

  for(const cl of claims){
    (cl.citations||[]).forEach(id=>{
      const key = String(id||"").trim();
      if(!key || seen.has(key)) return;
      seen.add(key);
      citations.push(key);
    });
    if(cl.notes && String(cl.notes).trim()) notes.push(String(cl.notes).trim());
  }

  const noteText = uniq(notes).slice(0,3).join(" ");
  const citeHtml = citations.slice(0,6).map(id => renderCitationChip(id)).join("");

  return `
    <div class="fineprint">Citations (click to open):</div>
    <div class="citeList">${citeHtml || `<div class="fineprint">No citations attached yet.</div>`}</div>
    ${noteText ? `<div class="note"><strong>Notes:</strong> ${escapeHtml(noteText)}</div>` : ``}
    ${labHtml}
  `;
}