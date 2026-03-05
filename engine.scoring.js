import { clamp } from "./utils.js";
import { MED_DB, SUPPLEMENT_MAP } from "./data.js";

function doseFactor(d){ return d==="low" ? 0.85 : (d==="high" ? 1.25 : 1.0); }
function durationFactor(months){ const m = clamp(months||0, 0, 24); return 0.55 + (m/24)*0.75; }
function severityFactor(sev){ return sev==="severe" ? 1.35 : (sev==="moderate" ? 1.15 : 1.0); }
function qualityWeight(q){ return q==="High" ? 4 : (q==="Moderate" ? 3 : 2); }

export function tierFromScore(score){ if(score >= 70) return "High"; if(score >= 45) return "Moderate"; return "Low"; }

export function computeNutrientScores(state){
  const scores = {};
  const sevF = severityFactor(state.symptoms.severity);

  for(const mi of state.meds){
    const med = MED_DB.find(x => x.id===mi.medId);
    if(!med) continue;
    const f = doseFactor(mi.dose) * durationFactor(mi.durationMonths) * sevF;

    for(const cl of (med.claims||[])){
      const w = qualityWeight(cl.source_quality) * 10 * f;
      scores[cl.nutrient] = (scores[cl.nutrient]||0) + w;
    }
  }

  if(Object.keys(scores).length===0 && state.symptoms.selected.length){
    const burden = state.symptoms.selected.length * 9 * sevF;
    scores["Magnesium"] = (scores["Magnesium"]||0) + burden;
    scores["B vitamins"] = (scores["B vitamins"]||0) + burden * 0.85;
    scores["Vitamin D"] = (scores["Vitamin D"]||0) + burden * 0.60;
  }

  return Object.entries(scores)
    .map(([k,v]) => [k, clamp(Math.round(v), 0, 100)])
    .sort((a,b)=>b[1]-a[1]);
}

export function recommendSupplements(nutrientScores){
  const out = [];
  for(const [nut, score] of nutrientScores.slice(0,10)){
    const tier = tierFromScore(score);
    const sups = (SUPPLEMENT_MAP[nut] || []);
    for(const s of sups){ out.push({ nutrient: nut, tier, supplement: s, score }); }
  }
  const rank = { High:3, Moderate:2, Low:1 };
  const best = new Map();
  for(const item of out){
    const prev = best.get(item.supplement);
    if(!prev || rank[item.tier] > rank[prev.tier]) best.set(item.supplement, item);
  }
  return [...best.values()].sort((a,b)=>{
    if(rank[b.tier] !== rank[a.tier]) return rank[b.tier]-rank[a.tier];
    return (b.score||0) - (a.score||0);
  }).slice(0,10);
}