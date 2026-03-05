import { loadState, saveState, resetState } from "./state.js";
import { clamp } from "./utils.js";
import { renderSteps, renderPills, renderSummaryTop, renderSide, renderContactBox, setMainHeader, STEP_LABELS, showToast } from "./ui.js";
import { wireSnapshotModal } from "./snapshot.js";
import { copyToClipboard, downloadJson } from "./share.js";

// Tabs
import { renderAccount } from "./tabs/account.js";
import { renderMeds } from "./tabs/medications.js";
import { renderSymptoms } from "./tabs/symptoms.js";
import { renderWellbeing } from "./tabs/wellbeing.js";

// (We’ll add tabs 4–8 next message)
let state = loadState();

// State ref for snapshot module
const stateRef = { get: ()=>state };

const snapshot = wireSnapshotModal(stateRef);

function saveAndRender(){
  saveState(state);
  renderAll();
}

function setStep(n){
  state.step = clamp(n, 0, STEP_LABELS.length-1);
  saveAndRender();
}

function resetDemo(){
  resetState();
  state = loadState();
  renderAll();
  showToast("Reset ✓");
}

// Buttons
document.getElementById("btnReset").addEventListener("click", resetDemo);

document.getElementById("btnShare").addEventListener("click", async ()=>{
  const url = window.location.href;
  await copyToClipboard(url);
  downloadJson("geneomx_review_packet.json", { meta:{createdISO:new Date().toISOString()}, state });
  showToast("Link copied + packet exported ✓");
});

// Render main switch
function renderMain(){
  const mainEl = document.getElementById("main");
  mainEl.innerHTML = "";
  setMainHeader(state);

  const ctx = { state, saveAndRender, setStep, snapshot };

  if(state.step===0) return renderAccount(ctx);
  if(state.step===1) return renderMeds(ctx);
  if(state.step===2) return renderSymptoms(ctx);
  if(state.step===3) return renderWellbeing(ctx);

  // Tabs 4–8 will be wired in next message
  mainEl.innerHTML = `<div class="section"><div class="fineprint">Tabs 4–8 not pasted yet. Say: “Send tabs 4–8”</div></div>`;
}

function renderAll(){
  renderSteps(state, setStep);
  renderPills(state);
  renderSummaryTop(state, setStep);
  renderSide(state);
  renderContactBox();
  renderMain();
}

renderAll();