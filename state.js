export const STORAGE_KEY = "geneomx_consumer_portal_v1_split";

export const defaultState = () => ({
  step: 0,
  account: { email:"", consent:false },
  profile: { age:"", gender:"", pregnant:false, kidneyDisease:false, anticoagulants:false },
  meds: [],
  symptoms: { selected:[], severity:"mild" },
  wellbeingBaseline: { energy:5, mood:5, sleep:5, focus:5 },
  plan: { started:false, startDate:null, recommendedSupplements:[], routine:{} },
  checkins: [],
  feedback: []
});

export function loadState(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : defaultState();
  }catch(e){
    return defaultState();
  }
}

export function saveState(state){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function resetState(){
  localStorage.removeItem(STORAGE_KEY);
}