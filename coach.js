import { computeNutrientScores, tierFromScore } from "./scoring.js";
import { fmtDate } from "./utils.js";

export function latestCheckin(state){
  if(!state.checkins.length) return null;
  return state.checkins[state.checkins.length-1];
}

export function computeWeeklyCoachMessage(state){
  const last = latestCheckin(state);
  const base = state.wellbeingBaseline || {energy:5,mood:5,sleep:5,focus:5};
  const scores = computeNutrientScores(state);
  const topDriver = scores.length ? `${scores[0][0]} (${scores[0][1]}%)` : "—";

  if(!last){
    return {
      headline: "Your coach is ready.",
      bullets: [
        "Add medications + symptoms to personalize results.",
        "Start your plan to track real improvement over time.",
        "Log a weekly check-in to generate your Health Signal."
      ],
      nextBestAction: "Go to Results → Start plan."
    };
  }

  const dE = last.wellbeing.energy - base.energy;
  const dM = last.wellbeing.mood - base.mood;
  const dS = last.wellbeing.sleep - base.sleep;
  const dF = last.wellbeing.focus - base.focus;

  const items = last.symptoms?.items || [];
  const best = items.reduce((acc,x)=> (acc===null || (x.changeScore||0)>(acc.changeScore||0)) ? x : acc, null);
  const worst = items.reduce((acc,x)=> (acc===null || (x.changeScore||0)<(acc.changeScore||0)) ? x : acc, null);

  let next = "Keep the routine consistent for 7 days and log another check-in.";
  if(last.adherencePct < 60) next = "Try one reminder and aim for 70–80% adherence this week.";
  else if((worst?.change||"") === "Worse") next = `Adjust timing/with-food strategy and reassess ${worst.symptom} next week.`;
  else if(dE <= 0 && dS <= 0) next = "Try hydration + protein at breakfast for 7 days, then reassess energy/sleep.";
  else if(dE > 0 || dS > 0) next = "Nice trend—keep the same plan for one more week to confirm the signal.";

  const bullets = [
    `Wellbeing deltas: Energy ${dE>=0?"+":""}${dE}, Mood ${dM>=0?"+":""}${dM}, Sleep ${dS>=0?"+":""}${dS}, Focus ${dF>=0?"+":""}${dF}.`,
    `Most improved symptom: ${best?.symptom ? `${best.symptom} (${best.change})` : "—"}.`,
    `Least improved symptom: ${worst?.symptom ? `${worst.symptom} (${worst.change})` : "—"}.`,
    `Top driver nutrient: ${topDriver}.`
  ];

  const headline =
    (dE + dS + dM + dF) > 0 ? "You’re trending in the right direction." :
    (dE + dS + dM + dF) < 0 ? "Let’s stabilize this week." :
    "Let’s get a clearer signal.";

  return { headline, bullets, nextBestAction: next };
}