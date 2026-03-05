import { escapeHtml } from "../utils.js";
import { navButtons, showToast } from "../ui.js";
import { safetyFlags } from "../snapshot.js";

export function renderAccount(ctx){
  const { state, saveAndRender, setStep } = ctx;
  const mainEl = document.getElementById("main");

  const flags = safetyFlags(state);

  const s1 = document.createElement("div");
  s1.className="section";
  s1.innerHTML = `
    <div class="tagline">
      <strong>Welcome</strong> — personalized guidance based on medications, symptoms, and outcomes.
    </div>

    <div style="height:12px"></div>

    <div class="row">
      <div class="col">
        <label>Email</label>
        <input id="email" placeholder="name@email.com" value="${escapeHtml(state.account.email||"")}" />
      </div>
      <div class="col">
        <label>Consent</label>
        <select id="consent">
          <option value="no" ${state.account.consent? "": "selected"}>Not yet</option>
          <option value="yes" ${state.account.consent? "selected": ""}>I agree</option>
        </select>
      </div>
    </div>

    <div style="height:12px"></div>

    <div class="row">
      <div class="col">
        <label>Age</label>
        <input id="age" type="number" min="0" max="120" placeholder="e.g., 42" value="${escapeHtml(state.profile.age || "")}" />
      </div>
      <div class="col">
        <label>Gender</label>
        <select id="gender">
          <option value="">Select…</option>
          <option value="Female" ${state.profile.gender==="Female"?"selected":""}>Female</option>
          <option value="Male" ${state.profile.gender==="Male"?"selected":""}>Male</option>
          <option value="Non-binary" ${state.profile.gender==="Non-binary"?"selected":""}>Non-binary</option>
          <option value="Prefer not to say" ${state.profile.gender==="Prefer not to say"?"selected":""}>Prefer not to say</option>
        </select>
      </div>
      <div class="col">
        <label>Pregnant / breastfeeding</label>
        <select id="preg">
          <option value="no" ${!state.profile.pregnant?"selected":""}>No</option>
          <option value="yes" ${state.profile.pregnant?"selected":""}>Yes</option>
        </select>
      </div>
    </div>

    <div style="height:12px"></div>

    <div class="row">
      <div class="col">
        <label>Safety flags (optional)</label>
        <div class="fineprint">These trigger extra safety notes on Results.</div>
        <div class="chips" style="margin-top:10px">
          <div class="chip" id="kidneyChip" aria-pressed="${state.profile.kidneyDisease?"true":"false"}">Kidney disease</div>
          <div class="chip" id="antiChip" aria-pressed="${state.profile.anticoagulants?"true":"false"}">Anticoagulants / blood thinners</div>
        </div>
      </div>
    </div>

    ${flags.length ? `
      <div class="banner">
        <strong>Safety note:</strong> You selected ${escapeHtml(flags.join(", "))}.
        Recommendations are educational and should be confirmed with a clinician.
      </div>
    ` : ``}

    <div class="fineprint" style="margin-top:10px">
      Prototype note: stores data in your browser (localStorage) for now.
    </div>
  `;

  function commit(){
    state.account.email = s1.querySelector("#email").value.trim();
    state.account.consent = s1.querySelector("#consent").value==="yes";
    const ageVal = parseInt(s1.querySelector("#age").value || "", 10);
    state.profile.age = Number.isFinite(ageVal) ? String(ageVal) : "";
    state.profile.gender = s1.querySelector("#gender").value || "";
    state.profile.pregnant = s1.querySelector("#preg").value==="yes";
    saveAndRender();
  }

  ["#email","#consent","#age","#gender","#preg"].forEach(sel=>{
    const el = s1.querySelector(sel);
    const ev = (sel==="#email" || sel==="#age") ? "input" : "change";
    el.addEventListener(ev, commit);
    el.addEventListener("blur", commit);
  });

  s1.querySelector("#kidneyChip").addEventListener("click", ()=>{
    state.profile.kidneyDisease = !state.profile.kidneyDisease; saveAndRender(); showToast("Saved ✓");
  });
  s1.querySelector("#antiChip").addEventListener("click", ()=>{
    state.profile.anticoagulants = !state.profile.anticoagulants; saveAndRender(); showToast("Saved ✓");
  });

  mainEl.appendChild(s1);
  mainEl.appendChild(navButtons(state, setStep, false, true, "Continue"));
}