import { escapeHtml } from "./utils.js";

export function citationToLink(token){
  const t = String(token||"").trim();
  if(/^PMID:\d+$/i.test(t)){
    const id = t.split(":")[1];
    return `https://pubmed.ncbi.nlm.nih.gov/${id}/`;
  }
  if(/^PMCID:PMC\d+$/i.test(t)){
    const id = t.split(":")[1].toUpperCase();
    return `https://pmc.ncbi.nlm.nih.gov/articles/${id}/`;
  }
  return "";
}

export function renderCitationChip(token){
  const url = citationToLink(token);
  const safeTok = escapeHtml(token);
  if(url){
    return `<a class="cite" href="${url}" target="_blank" rel="noopener noreferrer">${safeTok}</a>`;
  }
  return `<span class="cite">${safeTok}</span>`;
}