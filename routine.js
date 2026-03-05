export function buildRoutineFromSupplements(supps){
  const routine = { morning:[], midday:[], night:[], notes:[] };
  const s = (supps||[]).map(x=>String(x).toLowerCase());
  const hasMg = s.some(x=>x.includes("magnesium"));
  const hasB12 = s.some(x=>x.includes("b12"));
  const hasCoq10 = s.some(x=>x.includes("coq10"));
  const hasD = s.some(x=>x.includes("vitamin d"));

  if(hasB12) routine.morning.push("Methyl B12 — morning (often energizing)");
  if(hasD) routine.morning.push("Vitamin D3 — with a meal that includes fat");
  if(hasCoq10) routine.midday.push("CoQ10 — with lunch (with food)");
  if(hasMg) routine.night.push("Magnesium glycinate — evening/night (often calming)");

  routine.notes.push("If nausea occurs, take supplements with food and reduce dose temporarily.");
  routine.notes.push("Avoid stacking new supplements all at once—phase in over 3–7 days.");
  routine.notes.push("Educational only; confirm timing/dose with clinician.");

  return routine;
}