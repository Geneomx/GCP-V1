import { navButtons, showToast, getSymptomUniverse } from "../ui.js";

export function renderSymptoms(ctx){
  const { state, saveAndRender, setStep } = ctx;
  const mainEl = document.getElementById("main");

  const universe = getSymptomUniverse(state);

  const s1 = document.createElement("div");
  s1.className="section";
  s1.innerHTML = `
    <div class="row">
      <div class="col" style="min-width:360px">
        <label>Select symptoms</label>
        <div class="fineprint">Choose what you’ve noticed recently (we’ll use this to personalize results).</div>
        <div class="chips" id="chips"></div>
        <div class="btns"><button class="ghost" id="clear">Clear</button></div>
      </div>

      <div class="col" style="max-width:320px">
        <label>Severity</label>
        <select id="sevSel">
          <option value="mild" ${state.symptoms.severity==="mild"?"selected":""}>Mild</option>
          <option value="moderate" ${state.symptoms.severity==="moderate"?"selected":""}>Moderate</option>
          <option value="severe" ${state.symptoms.severity==="severe"?"selected":""}>Severe</option>
        </select>
      </div>
    </div>
  `;
  mainEl.appendChild(s1);

  const chipsEl = s1.querySelector("#chips");
  function drawChips(){
    chipsEl.innerHTML = "";
    universe.forEach(sym=>{
      const c = document.createElement("div");
      c.className="chip";
      const on = state.symptoms.selected.includes(sym);
      c.setAttribute("aria-pressed", on ? "true":"false");
      c.textContent = sym;
      c.addEventListener("click", ()=>{
        const i = state.symptoms.selected.indexOf(sym);
        if(i>=0) state.symptoms.selected.splice(i,1);
        else state.symptoms.selected.push(sym);
        saveAndRender(); showToast("Saved ✓");
      });
      chipsEl.appendChild(c);
    });
  }
  drawChips();

  s1.querySelector("#clear").addEventListener("click", ()=>{
    state.symptoms.selected = [];
    saveAndRender(); showToast("Cleared ✓");
  });

  const nav = navButtons(state, setStep, true, true, "Continue");
  nav.querySelector(".primary").addEventListener("click", ()=>{
    state.symptoms.severity = s1.querySelector("#sevSel").value;
    saveAndRender(); showToast("Saved ✓");
    setStep(3);
  });
  mainEl.appendChild(nav);
}