import { MED_DB, LAB_SUGGESTIONS } from "./data.js";
import { uniq, fmtDate } from "./utils.js";
import { computeNutrientScores, tierFromScore } from "./scoring.js";
import { latestCheckin } from "./coach.js";

export function safetyFlags(state){
  const p = state.profile || {};
  const flags = [];
  if(p.pregnant) flags.push("Pregnant/breastfeeding");
  if(p.kidneyDisease) flags.push("Kidney disease");
  if(p.anticoagulants) flags.push("Anticoagulants/blood thinners");
  return flags;
}

export function buildClinicianSnapshotText(state){
  const flags = safetyFlags(state);
  const meds = state.meds.map(m=>{
    const med = MED_DB.find(x=>x.id===m.medId);
    const nm = med ? med.name : m.medId;
    return `- ${nm} • dose: ${m.dose} • duration: ${m.durationMonths||0} months`;
  });

  const last = latestCheckin(state);
  const scores = computeNutrientScores(state);
  const top = scores.slice(0,6).map(([n,sc]) => `- ${n}: ${tierFromScore(sc)} signal (${sc}%)`);

  const supp = (state.plan.recommendedSupplements||[]);
  const adh = last ? `${last.adherencePct}%` : "—";

  const labs = uniq(scores.slice(0,5).flatMap(([n]) => LAB_SUGGESTIONS[n] || [])).slice(0,8);
  const symptoms = state.symptoms.selected.length ? state.symptoms.selected.join(", ") : "None selected";
  const lastDate = last ? fmtDate(last.dateISO) : "—";

  return [
    "GENEOMX — 30-SECOND VISIT SNAPSHOT",
    "=================================",
    "",
    `Patient: ${state.account.email || "Anonymous"}   Age: ${state.profile.age || "—"}   Gender: ${state.profile.gender || "—"}`,
    `Safety flags: ${flags.length ? flags.join(", ") : "None reported"}`,
    "",
    "Medications:",
    meds.length ? meds.join("\n") : "- None reported",
    "",
    `Symptoms (recent): ${symptoms}`,
    "",
    "Nutrient risk signals (Geneomx estimate):",
    top.length ? top.join("\n") : "- No signals yet (add meds/symptoms)",
    "",
    "Current protocol (supplement support):",
    supp.length ? supp.map(x=>`- ${x}`).join("\n") : "- Not started / none saved",
    `Adherence (latest check-in): ${adh}`,
    "",
    "Optional labs to consider (clinical context needed):",
    labs.length ? labs.map(x=>`- ${x}`).join("\n") : "- —",
    "",
    `Latest check-in date: ${lastDate}`,
    "",
    "Note: Educational guidance with evidence transparency; confirm labs/dosing/interactions with clinician."
  ].join("\n");
}

export function wireSnapshotModal(stateRef){
  const backdrop = document.getElementById("backdrop");
  const modal = document.getElementById("modal");
  const snapText = document.getElementById("snapText");

  const open = ()=>{
    snapText.textContent = buildClinicianSnapshotText(stateRef.get());
    backdrop.style.display="block";
    modal.style.display="block";
  };
  const close = ()=>{
    backdrop.style.display="none";
    modal.style.display="none";
  };

  document.getElementById("snapClose").addEventListener("click", close);
  backdrop.addEventListener("click", close);

  document.getElementById("snapCopy").addEventListener("click", async ()=>{
    await navigator.clipboard.writeText(snapText.textContent);
  });

  document.getElementById("snapPrint").addEventListener("click", ()=>{
    const w = window.open("", "_blank");
    const pre = snapText.textContent.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;");
    w.document.write(`<pre style="font-family: ui-monospace, Menlo, Consolas, monospace; white-space:pre-wrap; font-size:12px;">${pre}</pre>`);
    w.document.close();
    w.focus();
    w.print();
  });

  return { open, close };
}