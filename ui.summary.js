// js/ui.summary.js
function renderContactBox(){
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

function renderSummaryTop(setStep){
  const summaryTop = document.getElementById("summaryTop");
  const medsCount = state.meds.length;
  const symCount = state.symptoms.selected.length;
  const cov = evidenceCoverage();
  const flags = safetyFlags();

  const next =
    !state.account.consent ? "Complete Account"
    : medsCount===0 ? "Add Medications"
    : symCount===0 ? "Select Symptoms"
    : !state.plan.started ? "Review Results"
    : "Log a Check-in";

  summaryTop.innerHTML = `
    <div class="section" style="padding:0;border:none;background:none">
      <div class="v">
        <strong>Quick status</strong><br>
        Age: <strong>${escapeHtml(state.profile.age||"—")}</strong> • Gender: <strong>${escapeHtml(state.profile.gender||"—")}</strong><br>
        Medications: <strong>${medsCount}</strong> • Symptoms: <strong>${symCount}</strong> • Evidence: <strong>${cov.evidenceCount}/${cov.selectedCount}</strong><br>
        <div class="fineprint" style="margin-top:8px">Safety flags: <strong>${escapeHtml(flags.length?flags.join(", "):"None")}</strong></div>
        <div class="fineprint" style="margin-top:8px">Next suggested step: <strong>${escapeHtml(next)}</strong></div>
        <div class="btns">
          <button class="ghost" data-go="0">Account</button>
          <button class="ghost" data-go="1">Medications</button>
          <button class="ghost" data-go="2">Symptoms</button>
          <button class="ghost" data-go="4">Results</button>
          <button class="ghost" data-go="5">Check-in</button>
          <button class="ghost" data-go="6">Progress</button>
        </div>
      </div>
    </div>
  `;

  summaryTop.querySelectorAll("[data-go]").forEach(b=>{
    b.addEventListener("click", ()=> setStep(parseInt(b.getAttribute("data-go"),10)));
  });
}

function renderSide(){
  const sideEl = document.getElementById("side");
  const meds = state.meds.map(m=>{
    const med = MED_DB.find(x=>x.id===m.medId);
    return med ? med.name : m.medId;
  });

  const last = state.checkins.length ? state.checkins[state.checkins.length-1] : null;
  const lastLine = last ? `Latest: ${fmtDate(last.dateISO)} • Adherence ${last.adherencePct}%` : "No check-ins yet.";
  const flags = safetyFlags();

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