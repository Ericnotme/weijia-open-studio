import { notes } from './data.js';
import { findNotes, nextNote } from './engine.js';

const $ = id => document.getElementById(id);
const escapeHTML = value => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const state = { mode:'home', query:'', activeId:null, featuredId:notes[0].id, visited:new Set() };
const detailDialog = $('detail-dialog');
const aboutDialog = $('about-dialog');
let priorFocus = null;
let syncingURL = false;
const homeTitle = '偶然 · 先遇见，再追问';

function updateProgress() {
  const complete = state.visited.size === notes.length;
  $('discovery-progress').textContent = complete ? `本轮 ${notes.length} 条都遇见了。带走一个想法就好。` : `本轮遇见 ${state.visited.size} / ${notes.length} 条`;
  $('refresh-feature').textContent = complete ? '重新开始一轮 ↗' : '换一个发现 ↗';
  $('lucky-label').textContent = complete ? '重新随逛' : '手气不错';
}

function tags(note) {
  return `<div class="result-topline"><span>${escapeHTML(note.topics[0])}</span><b aria-hidden="true">×</b><span>${escapeHTML(note.topics[1])}</span></div>`;
}

function renderFeature(note) {
  state.featuredId = note.id;
  state.visited.add(note.id);
  $('featured-card').innerHTML = `<article class="feature-card"><div class="feature-main"><div class="field-label">FIELD NOTE / ${note.number}<span class="pill">${escapeHTML(note.type)}</span></div><h3>${escapeHTML(note.title)}</h3><p class="feature-fact">${escapeHTML(note.paragraphs[0])}</p><div class="feature-actions"><button class="feature-read" data-open="${note.id}">读完整解释 <span aria-hidden="true">↗</span></button><a href="${escapeHTML(note.sources[0].url)}" target="_blank" rel="noopener noreferrer">查看原始来源 ↗<span class="sr-only">（在新标签页打开）</span></a></div><p class="feature-citation">${escapeHTML(note.sources[0].by)}</p></div><aside class="feature-question"><span class="question-label">带走一个问题</span><p>${escapeHTML(note.question)}</p><span class="question-topics">${escapeHTML(note.topics.join(' × '))}</span></aside></article>`;
  updateProgress();
}

function renderResults(items) {
  if (!items.length) {
    const searchURL = 'https://www.google.com/search?q=' + encodeURIComponent(state.query);
    $('results-list').innerHTML = `<div class="empty-state"><h3>本站还没有「${escapeHTML(state.query)}」的线索。</h3><p>搜索只覆盖这 ${notes.length} 条精选内容。你可以直接挑一条，或去全网继续找。</p><div class="empty-actions"><button data-search="">查看全部 ${notes.length} 条</button><a href="${escapeHTML(searchURL)}" target="_blank" rel="noopener noreferrer">去 Google 搜索 ↗</a></div></div>`;
    return;
  }
  $('results-list').innerHTML = items.map(note => `<article class="result-card">${tags(note)}<button class="result-title" data-open="${note.id}"><h3>${escapeHTML(note.title)}</h3></button><p>${escapeHTML(note.deck)}</p><div class="result-foot"><span>${escapeHTML(note.type)} · ${note.year}</span><button class="text-button" data-open="${note.id}" aria-label="阅读：${escapeHTML(note.title)}">顺着想下去 ↗</button></div></article>`).join('');
}

function writeURL(replace = false) {
  const url = new URL(window.location.href);
  url.searchParams.delete('q');
  url.searchParams.delete('all');
  url.searchParams.delete('note');
  if (state.mode === 'search') url.searchParams.set('q', state.query);
  if (state.mode === 'all') url.searchParams.set('all','1');
  if (state.activeId) url.searchParams.set('note',state.activeId);
  if (url.href !== window.location.href) history[replace ? 'replaceState' : 'pushState']({},'',url);
}

function showResults(value, {all = false, updateURL = true, focus = true} = {}) {
  state.query = String(value).normalize('NFKC').trim().slice(0,120);
  state.mode = all || !state.query ? 'all' : 'search';
  state.activeId = null;
  if (detailDialog.open) detailDialog.close();
  if (aboutDialog.open) aboutDialog.close();
  $('search-input').value = state.query;
  const matches = findNotes(state.query);
  document.body.classList.add('results-mode');
  $('discovery').hidden = true;
  $('intro-strip').hidden = true;
  $('results-section').hidden = false;
  $('back-home').hidden = false;
  $('results-title').textContent = state.mode === 'all' ? '全部 12 条，直接挑一条。' : `与「${state.query}」有关的线索`;
  $('result-count').textContent = state.mode === 'all' ? `${notes.length} 条精选线索 · 挑一个念头，顺着走。` : `${matches.length} 条相关线索 · 在 ${notes.length} 条精选内容中匹配`;
  renderResults(matches);
  document.title = (state.mode === 'all' ? '所有线索' : state.query) + ' · 偶然';
  if (updateURL) writeURL();
  if (focus) {
    $('search-input').blur();
    $('results-title').focus({preventScroll:true});
    window.scrollTo({top:0,behavior:'instant'});
  }
  return matches;
}

function home({updateURL = true} = {}) {
  state.mode = 'home'; state.query = ''; state.activeId = null;
  if (detailDialog.open) detailDialog.close();
  if (aboutDialog.open) aboutDialog.close();
  $('search-input').value = '';
  $('discovery').hidden = false;
  $('intro-strip').hidden = false;
  $('results-section').hidden = false;
  $('back-home').hidden = true;
  $('results-title').textContent = '挑一个你没想过的问题。';
  $('result-count').textContent = `${notes.length} 条精选线索 · 均附解释与原始来源`;
  renderResults(notes);
  document.body.classList.remove('results-mode');
  document.title = homeTitle;
  if (updateURL) writeURL();
}

function openNote(id, {updateURL = true} = {}) {
  const note = notes.find(item => item.id === id);
  if (!note) throw new Error('这条线索不存在。');
  if (aboutDialog.open) aboutDialog.close();
  if (!detailDialog.open) priorFocus = document.activeElement;
  state.activeId = id;
  state.visited.add(id);
  updateProgress();
  const next = nextNote(id,state.visited,true);
  const continuation = next ? `<div class="next-connection"><div><span>${note.related.includes(next.id) ? '下一条相关线索' : '换个还没看过的方向'}</span><button class="next-title" data-open="${next.id}">${escapeHTML(next.title)}</button></div><button data-open="${next.id}" aria-label="继续阅读：${escapeHTML(next.title)}">继续 ↗</button></div>` : `<div class="round-complete"><span class="eyebrow">${notes.length} / ${notes.length} CONNECTIONS</span><h3>这一轮，已经走完了。</h3><p>选一个值得记住的想法，带回自己的生活。</p><div><button data-restart>重新逛一轮</button><button data-search="">回到全部线索</button></div></div>`;
  $('detail-content').innerHTML = `<article class="detail-body">${tags(note)}<h2 id="detail-title" tabindex="-1">${escapeHTML(note.title)}</h2><p class="detail-deck">${escapeHTML(note.deck)}</p><div class="detail-copy">${note.paragraphs.map(p => `<p>${escapeHTML(p)}</p>`).join('')}</div><aside class="detail-boundary"><h3>别推太远 / ${escapeHTML(note.type)}</h3><p>${escapeHTML(note.boundary)}</p></aside><p class="detail-question">${escapeHTML(note.question)}</p><div class="sources-label">回到来源 / ${escapeHTML(note.date)}</div>${note.sources.map(source => `<a class="source-link" href="${escapeHTML(source.url)}" target="_blank" rel="noopener noreferrer"><span>${escapeHTML(source.title)}<small>${escapeHTML(source.by)}</small></span><span aria-hidden="true">↗</span><span class="sr-only">（在新标签页打开）</span></a>`).join('')}${continuation}</article>`;
  if (!detailDialog.open) detailDialog.showModal();
  detailDialog.scrollTop = 0;
  $('detail-title').focus({preventScroll:true});
  document.title = note.title + ' · 偶然';
  if (updateURL) writeURL();
  return note;
}

function closeNote() {
  if (!detailDialog.open) return;
  detailDialog.close();
}

detailDialog.addEventListener('close', () => {
  if (syncingURL || detailDialog.open) return;
  state.activeId = null;
  writeURL(true);
  document.title = state.mode === 'home' ? homeTitle : (state.mode === 'all' ? '所有线索' : state.query) + ' · 偶然';
  if (priorFocus?.isConnected) priorFocus.focus({preventScroll:true});
});

function syncFromURL() {
  syncingURL = true;
  const url = new URL(window.location.href);
  const noteId = url.searchParams.get('note');
  const query = url.searchParams.get('q');
  if (query !== null || url.searchParams.get('all') === '1') showResults(query || '',{all:query === null,updateURL:false,focus:false});
  else home({updateURL:false});
  if (noteId && notes.some(note => note.id === noteId)) openNote(noteId,{updateURL:false});
  else if (noteId) writeURL(true);
  syncingURL = false;
}

document.addEventListener('click',event => {
  const target = event.target instanceof Element ? event.target : null;
  if (target?.closest('[data-restart]')) { state.visited.clear(); openNote(notes[0].id); return; }
  const open = target?.closest('[data-open]');
  if (open) { openNote(open.dataset.open); return; }
  const search = target?.closest('[data-search]');
  if (search) showResults(search.dataset.search);
});

$('search-form').addEventListener('submit',event => {event.preventDefault();showResults($('search-input').value);});
$('browse-all').addEventListener('click',() => showResults('',{all:true}));
$('back-home').addEventListener('click',() => {home();window.scrollTo({top:0,behavior:'instant'});$('refresh-feature').focus({preventScroll:true});});
$('lucky').addEventListener('click',() => {
  if (state.visited.size === notes.length) state.visited.clear();
  const next = nextNote(state.featuredId,state.visited);
  if (next) openNote(next.id);
});
$('refresh-feature').addEventListener('click',() => {
  if (state.visited.size === notes.length) state.visited.clear();
  const next = nextNote(state.featuredId,state.visited);
  if (next) renderFeature(next);
});
$('detail-close').addEventListener('click',closeNote);
$('about-close').addEventListener('click',() => aboutDialog.close());
for (const id of ['about-open','colophon-open']) $(id).addEventListener('click',() => aboutDialog.showModal());
for (const dialog of [detailDialog,aboutDialog]) dialog.addEventListener('click',event => {
  if (event.target !== dialog) return;
  const r = dialog.getBoundingClientRect();
  if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close();
});
document.addEventListener('keydown',event => {
  if (event.key !== '/' || event.ctrlKey || event.metaKey || event.altKey || detailDialog.open || aboutDialog.open) return;
  const target = event.target;
  if (target instanceof Element && (target.matches('input,textarea,select') || target.closest('[contenteditable="true"]'))) return;
  event.preventDefault();$('search-input').focus();
});
window.addEventListener('popstate',syncFromURL);
renderFeature(notes[0]);
syncFromURL();

// Progressive enhancement: the same visible journeys are available to supporting agents.
const modelContext = document.modelContext;
if (modelContext?.registerTool) {
  const lifecycle = new AbortController();
  const register = tool => {
    try { Promise.resolve(modelContext.registerTool(tool,{signal:lifecycle.signal})).catch(() => {}); }
    catch { /* Optional browser API; normal interactions remain available. */ }
  };
  register({
    name:'search_serendipity_notes',title:'搜索偶然线索',
    description:'在本站精选线索中搜索，并在页面显示结果。空字符串显示全部；不会搜索全网。',
    inputSchema:{type:'object',properties:{query:{type:'string',maxLength:120}},required:['query'],additionalProperties:false},
    annotations:{readOnlyHint:false,untrustedContentHint:false},
    execute(input) {
      if (!input || typeof input.query !== 'string' || input.query.length > 120 || Object.keys(input).some(key => key !== 'query')) throw new Error('query 必须是至多 120 字符的字符串。');
      return {results:showResults(input.query).map(note => ({id:note.id,title:note.title,topics:note.topics})),scope:'curated_library'};
    }
  });
  register({
    name:'open_serendipity_note',title:'打开偶然线索',
    description:'在页面打开指定线索，包含解释、推论边界和原始来源。',
    inputSchema:{type:'object',properties:{id:{type:'string',enum:notes.map(note => note.id)}},required:['id'],additionalProperties:false},
    annotations:{readOnlyHint:false,untrustedContentHint:false},
    execute(input) {
      if (!input || typeof input.id !== 'string' || Object.keys(input).some(key => key !== 'id')) throw new Error('需要有效的线索 id。');
      const note = openNote(input.id);
      return {id:note.id,title:note.title,paragraphs:note.paragraphs,boundary:note.boundary,sources:note.sources};
    }
  });
  window.addEventListener('pagehide',() => lifecycle.abort(),{once:true});
}
