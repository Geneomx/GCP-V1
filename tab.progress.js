// js/tabs/tab.progress.js
window.Tabs = window.Tabs || {};
Tabs.progress = function(mainEl, navButtons, setStep){
  const last = state.checkins.length ? state.checkins[state.checkins.length-1] : null;
  const base = state.wellbeingBaseline;

  const s1 = document.createElement("div");
  s1.className="section";

  if(!last){
    s1.innerHTML = `
      <div class="v"><strong>Progress</strong></div>
      <div class="fineprint" style="margin-top:8px">No check-ins yet. Log your first check-in to see trends.</div>
      <div class="btns"><button class="primary" id="goCheckin">Go to Check-in</button></div>
    `;
    mainEl.appendChild(s1);
    document.getElementById("goCheckin").addEventListener("click", ()=> setStep(5));
    mainEl.appendChild(navButtons({prev:true,next:true,nextLabel:"Continue"}));
    return;
  }

  const dEnergy = last.wellbeing.energy - base.energy;
  const dMood = last.wellbeing.mood - base.mood;
  const dSleep = last.wellbeing.sleep - base.sleep;
  const dFocus = last.wellbeing.focus - base.focus;

  const items = last.symptoms?.items || [];
  const best = items.reduce((acc,x)=> (acc===null || (x.changeScore||0)>(acc.changeScore||0)) ? x : acc, null);
  const worst = items.reduce((acc,x)=> (acc===null || (x.changeScore||0)<(acc.changeScore||0)) ? x : acc, null);

  const scores = computeNutrientScores();
  const topDriver = scores.length ? `${scores[0][0]} (${scores[0][1]}%)` : "—";
  const symScore = last.symptoms?.improvementScore ?? 0;

  s1.innerHTML = `
    <div class="v"><strong>Weekly Health Signal</strong></div>
    <div class="fineprint" style="margin-top:8px">This answers: “Is what I’m doing actually helping?”</div>

    <div class="divider"></div>

    <div class="btns">
      <button class="primary" id="btnSnapshot">Generate 30-Second Visit Snapshot</button>
      <button class="ghost" id="btnAnother">Add another check-in</button>
    </div>

    <div class="spacer"></div>

    <div class="list">
      <div class="item">
        <div class="k">What changed (latest check-in)</div>
        <div class="v">
          Most improved: <strong>${escapeHtml(best?.symptom || "—")}</strong> (${escapeHtml(best?.change || "—")})<br>
          Least improved: <strong>${escapeHtml(worst?.symptom || "—")}</strong> (${escapeHtml(worst?.change || "—")})<br>
          Top driver nutrient: <strong>${escapeHtml(topDriver)}</strong>
        </div>
      </div>

      <div class="item">
        <div class="k">Wellbeing change (latest - baseline)</div>
        <div class="v">
          Energy: <strong>${dEnergy>=0?"+":""}${dEnergy}</strong> •
          Mood: <strong>${dMood>=0?"+":""}${dMood}</strong> •
          Sleep: <strong>${dSleep>=0?"+":""}${dSleep}</strong> •
          Focus: <strong>${dFocus>=0?"+":""}${dFocus}</strong>
        </div>
      </div>

      <div class="item">
        <div class="k">Symptom improvement score</div>
        <div class="v"><strong>${symScore}</strong> (sum of symptom change ratings)</div>
      </div>

      <div class="item">
        <div class="k">Adherence</div>
        <div class="v"><strong>${last.adherencePct}%</strong></div>
      </div>
    </div>
  `;

  mainEl.appendChild(s1);

  document.getElementById("btnSnapshot").addEventListener("click", ()=> window.openSnapshotModal());
  document.getElementById("btnAnother").addEventListener("click", ()=> setStep(5));

  mainEl.appendChild(navButtons({prev:true,next:true,nextLabel:"Continue"}));
};