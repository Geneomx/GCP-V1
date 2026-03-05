import { clamp, escapeHtml, fmtDate } from "./utils.js";
import { MED_DB, GENERIC_SYMPTOMS } from "./data.js";
import { computeNutrientScores } from "./scoring.js";
import { safetyFlags } from "./snapshot.js";
import { claimsForSelectedMeds } from "./evidence.js";

let toastTimer = null;

export function showToast(msg="Saved ✓"){
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.style.display = "block";
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>{ t.style.display="none"; }, 1200);
}

export function evidenceCoverage(state){
  const selected = state.meds.map(m=>m.medId);
  const evidenceCount = selected.filter(id=>{
    const med = MED_DB.find(x=>x.id===id);
    return med && (med.claims||[]).some(c => (c.citations||[]).length>0);
  }).length;
  return { selectedCount: selected.length, evidenceCount };
}

export function getSymptomUniverse(state){
  if(state.meds.length){
    const chips = [];
    state.meds.forEach(mi=>{
      const med = MED_DB.find(x=>x.id===mi.medId);
      if(med) chips.push(...(med.symptomChips||[]));
    });
    return [...new Set(chips)].slice(0,24);
  }
  return GENERIC_SYMPTOMS;
}

export function renderSteps(state, setStep){
  const STEP_LABELS = ["Account","Medications","Symptoms","Wellbeing","Results","Check-in","Progress","Citations","Feedback"];
  const stepsEl = document.getElementById("steps");
  const colors = ["c1","c2","c3","c4","c5","c6","c7","c8","c9"];
  stepsEl.innerHTML = "";
  STEP_LABELS.forEach((lbl,i)=>{
    const s = document.createElement("div");
    s.className = `step ${colors[i]} ${i===state.step ? "on":""}`;
    s.textContent = lbl;
    s.addEventListener("click", ()=> setStep(i));
    stepsEl.appendChild(s);
  });
}

export function renderPills(state){
  document.getElementById("pillUser").textContent = state.account.email ? state.account.email : "Guest";
  document.getElementById("pillPlan").textContent = state.plan.started ? `Started ${fmtDate(state.plan.startDate)}` : "Not started";
  document.getElementById("pillChecks").textContent = String(state.checkins.length);
}

export function renderContactBox(){
  const contactBox = document.getElementById("contactBox");
  contactBox.innerHTML = `
    <div class="k">Your feedback is valuable</div>
    <div class="v">
      Found something confusing? Want to suggest an improvement?
      Email us at <a class="mailto" href="mailto:info@geneomx.com">info@geneomx.com</a>.
    </div>
    <div class="fineprint" style="margin-top:10px">
      Pro tip: “Share for review” exports a review packet JSON.
    </div>
  `;
}

export function renderSummaryTop(state, setStep){
  const summaryTop = document.getElementById("summaryTop");
  const medsCount = state.meds.length;
  const symCount = state.symptoms.selected.length;
  const cov = evidenceCoverage(state);
  const flags = safetyFlags(state);

  const next =
    !state.account.consent ? "Complete Account"
    : medsCount===0 ? "Add Medications"
    : symCount===0 ? "Select Symptoms"
    : !state.plan.started ? "Review Results"
    : "Log a Check-in";

  summaryTop.innerHTML = `
    <div class="tagline">
      <strong>Quick status</strong><br>
      Age: <strong>${escapeHtml(state.profile.age||"—")}</strong> • Gender: <strong>${escapeHtml(state.profile.gender||"—")}</strong><br>
      Medications: <strong>${medsCount}</strong> • Symptoms: <strong>${symCount}</strong> • Evidence: <strong>${cov.evidenceCount}/${cov.selectedCount}</strong><br>
      <div class="fineprint" style="margin-top:8px">Safety flags: <strong>${escapeHtml(flags.length?flags.join(", "):"None")}</strong></div>
      <div class="fineprint" style="margin-top:8px">Next suggested step: <strong>${escapeHtml(next)}</strong></div>
      <div class="quickActions">
        <button class="qaBtn ghost" data-go="0">Account</button>
        <button class="qaBtn ghost" data-go="1">Medications</button>
        <button class="qaBtn ghost" data-go="2">Symptoms</button>
        <button class="qaBtn ghost" data-go="4">Results</button>
        <button class="qaBtn ghost" data-go="5">Check-in</button>
        <button class="qaBtn ghost" data-go="6">Progress</button>
      </div>
    </div>
  `;
  summaryTop.querySelectorAll("[data-go]").forEach(b=>{
    b.addEventListener("click", ()=> setStep(parseInt(b.getAttribute("data-go"),10)));
  });
}

export function renderSide(state){
  const sideEl = document.getElementById("side");
  const meds = state.meds.map(m=>{
    const med = MED_DB.find(x=>x.id===m.medId);
    return med ? med.name : m.medId;
  });
  const last = state.checkins.length ? state.checkins[state.checkins.length-1] : null;
  const lastLine = last ? `Latest: ${fmtDate(last.dateISO)} • Adherence ${last.adherencePct}%` : "No check-ins yet.";
  const flags = safetyFlags(state);

  const blocks = [
    {k:"Account", v: `${state.account.email || "Guest"} • Consent: ${state.account.consent ? "Yes" : "No"}`},
    {k:"Age / Gender", v: `${state.profile.age || "—"} / ${state.profile.gender || "—"}`},
    {k:"Safety flags", v: flags.length ? flags.join(", ") : "None"},
    {k:"Medications", v: meds.length ? meds.join(", ") : "None yet."},
    {k:"Symptoms selected", v: state.symptoms.selected.length ? state.symptoms.selected.join(", ") : "None yet."},
    {k:"Baseline wellbeing", v: `Energy ${state.wellbeingBaseline.energy}/10 • Mood ${state.wellbeingBaseline.mood}/10 • Sleep ${state.wellbeingBaseline.sleep}/10 • Focus ${state.wellbeingBaseline.focus}/10`},
    {k:"Plan", v: state.plan.started ? `Started ${fmtDate(state.plan.startDate)}` : "Not started yet."},
    {k:"Supplements", v: state.plan.recommendedSupplements.length ? state.plan.recommendedSupplements.join(", ") : "No active plan supplements."},
    {k:"Check-ins", v: lastLine},
  ];

  sideEl.innerHTML = "";
  blocks.forEach(x=>{
    const div = document.createElement("div");
    div.className = "item";
    div.innerHTML = `<div class="k">${escapeHtml(x.k)}</div><div class="v">${escapeHtml(x.v)}</div>`;
    sideEl.appendChild(div);
  });
}

export function navButtons(state, setStep, prev=true, next=true, nextLabel="Continue"){
  const wrap = document.createElement("div");
  wrap.className = "btns";
  if(prev){
    const b = document.createElement("button");
    b.textContent = "Back";
    b.className = "ghost";
    b.addEventListener("click", ()=> setStep(state.step-1));
    wrap.appendChild(b);
  }
  if(next){
    const b = document.createElement("button");
    b.textContent = nextLabel;
    b.className = "primary";
    b.addEventListener("click", ()=> setStep(state.step+1));
    wrap.appendChild(b);
  }
  return wrap;
}

export const STEP_LABELS = ["Account","Medications","Symptoms","Wellbeing","Results","Check-in","Progress","Citations","Feedback"];

export function setMainHeader(state){
  const mainTitle = document.getElementById("mainTitle");
  const mainSub = document.getElementById("mainSub");
  mainTitle.textContent = STEP_LABELS[state.step];

  const subMap = {
    "Account":"Set basics + consent + safety flags.",
    "Medications":"Pick from list or search + add a custom medication.",
    "Symptoms":"Pick symptoms and severity.",
    "Wellbeing":"Set baseline for tracking improvement.",
    "Results":"Nutrient signals + recommendations + evidence.",
    "Check-in":"Log symptom improvement + adherence + wellbeing.",
    "Progress":"Weekly health signal + snapshot for clinician.",
    "Citations":"All sources referenced in this session.",
    "Feedback":"Send questions and feedback to Geneomx."
  };
  mainSub.textContent = subMap[STEP_LABELS[state.step]] || "";
}