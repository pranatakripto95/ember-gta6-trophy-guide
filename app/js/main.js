// Boot: load the trophy list, wire the toolbar, tabs and detail pane, and keep
// the checklist, roadmap and missables views in step with saved progress.
import {
  loadProgress,
  saveProgress,
  setCounter,
  setEarned,
  exportProgress,
  parseImportedProgress,
  loadSpoilersOn,
  saveSpoilersOn,
} from './store.js';
import { KIND_FILTERS, GRADE_FILTERS, applyFilters } from './filters.js';
import { trophyRow, detailPane, roadmapView, missablesView, sourcesView, el } from './views.js';

const DATA_URL = 'data/trophies.json';
const state = loadProgress();
let trophies = [];
let selectedName = null;
let spoilersOn = loadSpoilersOn();
const filters = { kind: 'all', grade: 'all', query: '', earnedOnly: false };
let currentView = 'checklist';

const $ = (id) => document.getElementById(id);

function countsLine() {
  const total = trophies.length;
  const earned = state.earned.length;
  const byGrade = {};
  for (const trophy of trophies) {
    if (state.earned.includes(trophy.name)) byGrade[trophy.grade] = (byGrade[trophy.grade] || 0) + 1;
  }
  $('progress').textContent = `${earned} of ${total} earned`;
  $('progress-detail').textContent =
    `Platinum ${byGrade.platinum || 0}/1 · Gold ${byGrade.gold || 0}/2 · Silver ${byGrade.silver || 0}/6 · Bronze ${byGrade.bronze || 0}/46`;
  $('progress-fill').style.width = `${total ? Math.round((100 * earned) / total) : 0}%`;
}

function visibleTrophies() {
  return applyFilters(trophies, state, filters);
}

function selectedTrophy() {
  return trophies.find((t) => t.name === selectedName) ?? visibleTrophies()[0] ?? null;
}

function renderChecklist() {
  const list = $('rows');
  list.replaceChildren();
  const visible = visibleTrophies();
  if (visible.length === 0) {
    const empty = el('p', 'empty', filters.kind === 'online'
      ? 'No online trophies: the official list has none — every one of the 55 is earned in single-player.'
      : 'No trophies match these filters. Clear the search or pick another kind.');
    list.append(empty);
  }
  for (const trophy of visible) {
    list.append(trophyRow(trophy, state, spoilersOn, trophy.name === selectedName, selectTrophy, toggleEarned));
  }
  $('result-count').textContent = `Showing ${visible.length} of ${trophies.length} trophies`;
  $('detail').replaceChildren(detailPane(selectedTrophy(), state, spoilersOn, toggleEarned, changeCounter));
}

function selectTrophy(trophy) {
  selectedName = trophy.name;
  renderChecklist();
}

function toggleEarned(trophy, earned) {
  setEarned(state, trophy, earned);
  countsLine();
  renderCurrentView();
}

function changeCounter(trophy, value) {
  setCounter(state, trophy, value);
  countsLine();
  renderCurrentView();
}

function renderCurrentView() {
  document.querySelectorAll('.tab').forEach((tab) => {
    tab.classList.toggle('active', tab.dataset.view === currentView);
  });
  $('toolbar').style.display = currentView === 'checklist' ? '' : 'none';
  $('result-count').style.display = currentView === 'checklist' ? '' : 'none';
  const main = $('view');
  main.replaceChildren();
  if (currentView === 'checklist') {
    const layout = el('div', 'checklist-layout');
    const list = el('div', 'trophy-list');
    list.id = 'rows';
    const detail = el('div', 'detail-wrap');
    detail.id = 'detail';
    layout.append(list, detail);
    main.append(layout);
    renderChecklist();
  } else if (currentView === 'roadmap') {
    main.append(roadmapView(trophies, state, spoilersOn));
  } else if (currentView === 'missables') {
    main.append(missablesView(trophies, state, spoilersOn));
  } else {
    main.append(sourcesView());
  }
  countsLine();
}

function switchView(view) {
  currentView = view;
  renderCurrentView();
}

function download(filename, text) {
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function buildToolbar() {
  const kindSelect = $('kind');
  for (const kind of KIND_FILTERS) {
    const option = document.createElement('option');
    option.value = kind.id;
    option.textContent = kind.label;
    kindSelect.append(option);
  }
  const gradeSelect = $('grade');
  for (const grade of GRADE_FILTERS) {
    const option = document.createElement('option');
    option.value = grade;
    option.textContent = grade === 'all' ? 'All grades' : grade.charAt(0).toUpperCase() + grade.slice(1);
    gradeSelect.append(option);
  }
  $('search').addEventListener('input', (event) => {
    filters.query = event.target.value;
    renderChecklist();
  });
  kindSelect.addEventListener('change', (event) => {
    filters.kind = event.target.value;
    renderChecklist();
  });
  gradeSelect.addEventListener('change', (event) => {
    filters.grade = event.target.value;
    renderChecklist();
  });
  $('earned-only').addEventListener('change', (event) => {
    filters.earnedOnly = event.target.checked;
    renderChecklist();
  });
  const spoilerBox = $('spoilers');
  spoilerBox.checked = spoilersOn;
  spoilerBox.addEventListener('change', (event) => {
    spoilersOn = event.target.checked;
    saveSpoilersOn(spoilersOn);
    renderChecklist();
  });
  $('export').addEventListener('click', () => {
    download('gta6-trophy-progress.json', exportProgress(state));
  });
  $('import').addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      const imported = parseImportedProgress(await file.text(), trophies.map((t) => t.name));
      state.earned = imported.earned;
      state.counters = imported.counters;
      saveProgress(state);
      selectedName = null;
      renderCurrentView();
    } catch (error) {
      alert(`Could not import that file: ${error.message}`);
    }
    event.target.value = '';
  });
  $('reset').addEventListener('click', () => {
    if (!confirm('Clear all earned ticks and counters in this browser?')) return;
    state.earned = [];
    state.counters = {};
    saveProgress(state);
    selectedName = null;
    renderCurrentView();
  });
  document.querySelectorAll('.tab').forEach((tab) => {
    tab.addEventListener('click', () => switchView(tab.dataset.view));
  });
}

async function boot() {
  const response = await fetch(DATA_URL);
  const doc = await response.json();
  trophies = doc.trophies;
  buildToolbar();
  const viewFromHash = new URLSearchParams(location.hash.slice(1)).get('view');
  if (['checklist', 'roadmap', 'missables', 'sources'].includes(viewFromHash)) currentView = viewFromHash;
  renderCurrentView();
}

boot();
