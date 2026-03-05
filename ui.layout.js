// js/ui.layout.js
const STEP_LABELS = ["Account","Medications","Symptoms","Wellbeing","Results","Check-in","Progress","Citations","Feedback"];

function setStep(n){
  state.step = clamp(n, 0, STEP_LABELS.length-1);
  saveState();
  renderAll();
}

function renderSteps(){
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

function renderPills(){
  document.getElementById("pillUser").textContent = state.account.email ? state.account.email : "Guest";
  document.getElementById("pillPlan").textContent = state.plan.started ? `Started ${fmtDate(state.plan.startDate)}` : "Not started";
  document.getElementById("pillChecks").textContent = String(state.checkins.length);
}

function navButtons({prev=true,next=true,nextLabel="Continue"}){
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

function renderMain(){
  const mainEl = document.getElementById("main");
  const mainTitle = document.getElementById("mainTitle");
  const mainSub = document.getElementById("mainSub");
  mainEl.innerHTML = "";

  mainTitle.textContent = STEP_LABELS[state.step];
  const subMap = {
    "Account":"Set basics + consent + safety flags.",
    "Medications":"Pick from list or search + add a custom medication.",
    "Symptoms":"Pick symptoms and severity.",
    "Wellbeing":"Set baseline for tracking improvement.",
    "Results":"Nutrient signals + recommendations + evidence.",
    "Check-in":"Log symptom improvement + adherence + wellbeing.",
    "Progress":"Weekly signal + snapshot for clinician.",
    "Citations":"All sources referenced in this session.",
    "Feedback":"Send feedback to Geneomx."
  };
  mainSub.textContent = subMap[STEP_LABELS[state.step]] || "";

  // Tabs (each is isolated file)
  if(state.step===0) return Tabs.account(mainEl, navButtons, setStep);
  if(state.step===1) return Tabs.medications(mainEl, navButtons, setStep);
  if(state.step===2) return Tabs.symptoms(mainEl, navButtons, setStep);
  if(state.step===3) return Tabs.wellbeing(mainEl, navButtons, setStep);
  if(state.step===4) return Tabs.results(mainEl, navButtons, setStep);
  if(state.step===5) return Tabs.checkin(mainEl, navButtons, setStep);
  if(state.step===6) return Tabs.progress(mainEl, navButtons, setStep);
  if(state.step===7) return Tabs.citations(mainEl, navButtons, setStep);
  if(state.step===8) return Tabs.feedback(mainEl, navButtons, setStep);
}