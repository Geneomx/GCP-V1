import { clamp } from "../utils.js";
import { navButtons, showToast } from "../ui.js";

export function renderWellbeing(ctx){
  const { state, saveAndRender, setStep } = ctx;
  const mainEl = document.getElementById("main");

  const s1 = document.createElement("div");
  s1.className="section";
  s1.innerHTML = `
    <div class="fineprint">Set a baseline so Geneomx can clearly show improvement over time.</div>
    <div style="height:10px"></div>

    <div class="row">
      <div class="col"><label>Energy (0–10)</label><input id="energy" type="number" min="0" max="10" value="${state.wellbeingBaseline.energy}" /></div>
      <div class="col"><label>Mood (0–10)</label><input id="mood" type="number" min="0" max="10" value="${state.wellbeingBaseline.mood}" /></div>
      <div class="col"><label>Sleep (0–10)</label><input id="sleep" type="number" min="0" max="10" value="${state.wellbeingBaseline.sleep}" /></div>
      <div class="col"><label>Focus (0–10)</label><input id="focus" type="number" min="0" max="10" value="${state.wellbeingBaseline.focus}" /></div>
    </div>
  `;
  mainEl.appendChild(s1);

  const nav = navButtons(state, setStep, true, true, "Continue");
  nav.querySelector(".primary").addEventListener("click", ()=>{
    state.wellbeingBaseline.energy = clamp(parseInt(s1.querySelector("#energy").value||"0",10),0,10);
    state.wellbeingBaseline.mood = clamp(parseInt(s1.querySelector("#mood").value||"0",10),0,10);
    state.wellbeingBaseline.sleep = clamp(parseInt(s1.querySelector("#sleep").value||"0",10),0,10);
    state.wellbeingBaseline.focus = clamp(parseInt(s1.querySelector("#focus").value||"0",10),0,10);
    saveAndRender(); showToast("Baseline saved ✓");
    setStep(4);
  });
  mainEl.appendChild(nav);
}