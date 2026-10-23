import { notes } from './data.js';

export const normalize = value => String(value).normalize('NFKC').trim().toLowerCase();
const escapeRegex = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
function contains(text, term) {
  if (!term) return false;
  if (/^[a-z0-9 ]+$/.test(term)) return new RegExp('(^|[^a-z0-9])' + escapeRegex(term) + '($|[^a-z0-9])', 'i').test(text);
  return text.includes(term);
}
export function findNotes(value) {
  const query = normalize(value).slice(0, 120);
  if (!query) return [...notes];
  const terms = [...new Set([query, ...query.split(/[^\p{L}\p{N}]+/u).filter(term => term.length > 1)])];
  return notes.map(note => {
    let score = 0;
    for (const term of terms) {
      for (const topic of note.topics) if (normalize(topic) === term) score += 18;
      for (const keyword of note.keywords) {
        const key = normalize(keyword);
        if (key === term) score += 12;
        else if (contains(term, key) || (term.length > 1 && contains(key, term))) score += 5;
      }
      if (contains(normalize(note.title), term)) score += 10;
      if (contains(normalize(note.deck), term)) score += 3;
      if (contains(normalize(note.paragraphs.join(' ')), term)) score += 1;
    }
    return { note, score };
  }).filter(result => result.score > 0).sort((a, b) => b.score - a.score).map(result => result.note);
}

export function nextNote(currentId, visited = new Set(), related = false, random = Math.random) {
  const current = notes.find(note => note.id === currentId);
  const unseen = notes.filter(note => note.id !== currentId && !visited.has(note.id));
  if (!unseen.length) return undefined;
  const relatedUnseen = related && current ? unseen.filter(note => current.related.includes(note.id)) : [];
  const pool = relatedUnseen.length ? relatedUnseen : unseen;
  return pool[Math.min(pool.length - 1, Math.floor(random() * pool.length))];
}
