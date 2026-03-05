import { MED_DB } from "../data.js";
import { clamp, escapeHtml } from "../utils.js";
import { navButtons, showToast, evidenceCoverage } from "../ui.js";

export function renderMeds(ctx){
  const { state, saveAndRender, setStep } = ctx;
  const mainEl = document.getElementById("main");

  const s1 = document.createElement("div");
  s1.className="section";
  s1.innerHTML = `
    <div class="tagline">
      <strong>Medications</strong><br>
      Pick from common medications, or search + add your own if it’s not listed.
    </div>

    <div id="covWrap"></div>

    <div style="height:12px"></div>

    <div class="medRow">
      <div class="col">
        <label>Search medications</label>
        <input id="medSearch" placeholder="Type to filter (e.g., metformin, semaglutide…)" />
      </div>

      <div class="col">
        <label>Medication list</label>
        <select id="medPick">
          <option value="">Select…</option>
        </select>
      </div>

      <div class="col">
        <label>Dose</label>
        <select id="dosePick">
          <option value="low">Low</option>
          <option value="medium" selected>Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      <div class="col">
        <label>Duration (months)</label>
        <input id="durPick" type="number" min="0" max="360" placeholder="e.g., 18" value="12" />
      </div>
    </div>

    <div class="hint">
      Not seeing your medication? Type it below and add it as a custom medication (evidence will be “Pending” until mapped).
    </div>

    <div class="row" style="margin-top:10px">
      <div class="col">
        <label>Add custom medication</label>
        <input id="medCustom" placeholder="Type medication name (e.g., 'Spironolactone')" />
      </div>
      <div class="col" style="max-width:260px">
        <label>&nbsp;</label>
        <button class="ghost" id="btnAddCustom" style="width:100%">Add custom + add to my list</button>
      </div>
    </div>

    <div class="btns">
      <button class="primary" id="btnAddMed">Add medication</button>
    </div>

    <div class="fineprint" style="margin-top:10px">
      Tip: If you selected a medication but forgot “Add”, clicking Continue will still move you forward — so just hit Add if you want it saved.
    </div>
  `;
  mainEl.appendChild(s1);

  const s2 = document.createElement("div");
  s2.className="section";
  s2.innerHTML = `<div class="list" id="medList"></div>`;
  mainEl.appendChild(s2);

  const covWrap = s1.querySelector("#covWrap");
  const medPick = s1.querySelector("#medPick");
  const medSearch = s1.querySelector("#medSearch");
  const medCustom = s1.querySelector("#medCustom");
  const medList = s2.querySelector("#medList");

  function sortedMedList(){ return MED_DB.slice().sort((a,b)=>a.name.localeCompare(b.name)); }

  function populateSelect(filterText=""){
    const f = (filterText||"").trim().toLowerCase();
    const list = sortedMedList().filter(m => !f || m.name.toLowerCase().includes(f) || m.id.toLowerCase().includes(f));
    const current = medPick.value;
    medPick.innerHTML = `<option value="">Select…</option>` + list.map(m=>(
      `<option value="${m.id}">${escapeHtml(m.name)}</option>`
    )).join("");
    if(current && list.some(m=>m.id===current)) medPick.value = current;
  }

  function drawCoverage(){
    const cov = evidenceCoverage(state);
    covWrap.innerHTML = `
      <div class="covPill">
        Evidence coverage: <strong>${cov.evidenceCount}/${cov.selectedCount}</strong>
        <span style="opacity:.9">(${cov.selectedCount ? "mapped meds show citations" : "add meds to see coverage"})</span>
      </div>
    `;
  }

  function drawList(){
    medList.innerHTML = "";
    if(!state.meds.length){
      medList.innerHTML = `<div class="fineprint">No medications added yet.</div>`;
      drawCoverage();
      return;
    }
    state.meds.forEach((m,idx)=>{
      const med = MED_DB.find(x=>x.id===m.medId);
      const div = document.createElement("div");
      div.className="item";
      div.innerHTML = `
        <div class="k">${escapeHtml(med?med.name:m.medId)}</div>
        <div class="v">Dose: <strong>${escapeHtml(m.dose)}</strong> • Duration: <strong>${escapeHtml(String(m.durationMonths||0))} months</strong></div>
        <div class="btns"><button class="danger" data-del="${idx}">Remove</button></div>
      `;
      div.querySelector("[data-del]").addEventListener("click", ()=>{
        state.meds.splice(idx,1);
        saveAndRender(); showToast("Removed ✓");
      });
      medList.appendChild(div);
    });
    drawCoverage();
  }

  function addMedicationToUserList(medId, dose, durationMonths){
    if(!medId) return false;
    if(state.meds.some(x => x.medId === medId)) return true;
    state.meds.push({medId, dose, durationMonths});
    return true;
  }

  function addFromPickerIfValid(){
    const medId = medPick.value;
    if(!medId) return false;
    const dose = s1.querySelector("#dosePick").value;
    const dur = parseInt(s1.querySelector("#durPick").value||"0",10);
    return addMedicationToUserList(medId, dose, clamp(isNaN(dur)?0:dur, 0, 360));
  }

  function slugifyMedicationName(name){
    return "custom_" + name.toLowerCase().replace(/[^a-z0-9]+/g,"_").replace(/^_+|_+$/g,"").slice(0,50);
  }

  s1.querySelector("#btnAddCustom").addEventListener("click", ()=>{
    const name = (medCustom.value||"").trim();
    if(!name) return alert("Please type a medication name first.");
    const id = slugifyMedicationName(name);

    const existing = MED_DB.find(m =>
      m.id===id || m.name.toLowerCase()===name.toLowerCase() || m.name.toLowerCase()===`${name.toLowerCase()} (custom)`
    );
    const useId = existing ? existing.id : id;

    if(!existing){
      MED_DB.push({
        id: useId,
        name: `${name} (custom)`,
        symptomChips:["Fatigue","Dizziness","Brain fog","GI discomfort","Mood changes","Sleep changes"],
        claims: []
      });
    }

    const dose = s1.querySelector("#dosePick").value;
    const dur = parseInt(s1.querySelector("#durPick").value||"0",10);
    addMedicationToUserList(useId, dose, clamp(isNaN(dur)?0:dur, 0, 360));

    populateSelect(medSearch.value);
    medPick.value = useId;
    medCustom.value = "";
    saveAndRender(); showToast("Added custom ✓");
  });

  s1.querySelector("#btnAddMed").addEventListener("click", ()=>{
    const ok = addFromPickerIfValid();
    if(!ok) return alert("Please select a medication (or add a custom one) first.");
    saveAndRender(); showToast("Added ✓");
  });

  medSearch.addEventListener("input", ()=> populateSelect(medSearch.value));
  populateSelect(""); drawList(); drawCoverage();

  const nav = navButtons(state, setStep, true, true, "Continue");
  nav.querySelector(".primary").addEventListener("click", ()=>{
    saveAndRender();
    setStep(2);
  });
  mainEl.appendChild(nav);
}