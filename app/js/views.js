// Views: the checklist with its detail pane, the roadmap, the missables watch
// list and the sources page. Every trophy's guide is shown with its sources.
import { ROADMAP_STAGES, MISSABLE_VERDICT, watchReasons } from './roadmap.js';
import {
  KIND_FILTERS,
  applyFilters,
  formatTarget,
  gradeLabel,
  isOnWatchList,
  missableLabel,
  spoilerHides,
} from './filters.js';
import { counterOf, isEarned as storeIsEarned } from './store.js';

export function sourcesFor(trophy) {
  const parts = ['the official list on Exophase for its name, description and grade'];
  if (trophy.target) parts.push(`PSNProfiles for PSN's progress target (0/${formatTarget(trophy)})`);
  parts.push('our own advice from the official description, not yet checked in the game');
  return parts;
}

export function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined && text !== null) node.textContent = text;
  return node;
}

export function gradeBadge(grade) {
  const badge = el('span', `grade grade-${grade}`, gradeLabel(grade));
  return badge;
}

export function trophyRow(trophy, state, spoilersOn, selected, onSelect, onToggle) {
  const hidden = spoilerHides(trophy, state, spoilersOn);
  const row = el('article', 'trophy-row' + (selected ? ' selected' : '') + (storeIsEarned(state, trophy) ? ' earned' : ''));
  row.tabIndex = 0;
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = storeIsEarned(state, trophy);
  box.setAttribute('aria-label', `Earned: ${hidden ? 'hidden story trophy' : trophy.name}`);
  box.addEventListener('click', (event) => {
    event.stopPropagation();
    onToggle(trophy, box.checked);
  });
  const body = el('div', 'row-body');
  const title = el('h3', 'row-name', hidden ? 'Hidden story trophy' : trophy.name);
  const desc = el('p', 'row-desc', hidden ? 'Hidden on PlayStation until earned — turn spoilers off to see it.' : trophy.description);
  const meta = el('div', 'row-meta');
  meta.append(gradeBadge(trophy.grade));
  if (trophy.hidden) meta.append(el('span', 'tag tag-hidden', 'Hidden on PSN'));
  if (trophy.missable !== 'no') meta.append(el('span', 'tag tag-watch', missableLabel(trophy)));
  if (trophy.target) {
    const count = counterOf(state, trophy) ?? 0;
    meta.append(el('span', 'tag tag-count', `${count.toLocaleString('en-US')} / ${formatTarget(trophy)}`));
  }
  body.append(title, desc, meta);
  row.append(box, body);
  row.addEventListener('click', () => onSelect(trophy));
  row.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') onSelect(trophy);
  });
  return row;
}

export function detailPane(trophy, state, spoilersOn, onToggle, onCounter) {
  const pane = el('aside', 'detail');
  if (!trophy) {
    pane.append(el('p', 'detail-empty', 'Pick a trophy to see its guide, its sources and its progress counter.'));
    return pane;
  }
  const hidden = spoilerHides(trophy, state, spoilersOn);
  const earned = storeIsEarned(state, trophy);
  const head = el('div', 'detail-head');
  head.append(gradeBadge(trophy.grade));
  if (trophy.hidden) head.append(el('span', 'tag tag-hidden', 'Hidden on PSN'));
  head.append(el('span', 'tag tag-watch', missableLabel(trophy)));
  pane.append(head);
  pane.append(el('h2', 'detail-name', hidden ? 'Hidden story trophy' : trophy.name));
  pane.append(el('p', 'detail-desc-label', 'Official description'));
  pane.append(el('p', 'detail-desc', hidden ? 'Hidden on PlayStation until earned.' : trophy.description));
  const toggle = el('label', 'detail-earned');
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned;
  box.addEventListener('change', () => onToggle(trophy, box.checked));
  toggle.append(box, document.createTextNode(earned ? ' Earned — ticked off' : ' Mark as earned'));
  pane.append(toggle);
  if (trophy.target) {
    const count = counterOf(state, trophy) ?? 0;
    const counter = el('div', 'counter');
    counter.append(el('label', 'counter-label', `Your progress: ${count.toLocaleString('en-US')} of ${formatTarget(trophy)}`));
    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = '0';
    slider.max = String(trophy.target);
    slider.step = trophy.target > 1000 ? '1000' : '1';
    slider.value = String(count);
    slider.setAttribute('aria-label', `Progress toward ${trophy.name}`);
    slider.addEventListener('input', () => onCounter(trophy, Number(slider.value)));
    const bar = el('div', 'bar');
    bar.append(el('div', 'bar-fill'));
    bar.firstChild.style.width = `${Math.round((100 * count) / trophy.target)}%`;
    counter.append(slider, bar);
    pane.append(counter);
  }
  pane.append(el('h3', 'detail-guide-label', 'How to earn it'));
  pane.append(el('p', 'detail-guide', trophy.guide));
  pane.append(el('h3', 'detail-sources-label', 'Sources'));
  const sources = el('p', 'detail-sources');
  const exophase = document.createElement('a');
  exophase.href = 'https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/';
  exophase.textContent = 'Exophase';
  exophase.rel = 'noopener';
  const psnprofiles = document.createElement('a');
  psnprofiles.href = 'https://psnprofiles.com/trophies/43531-grand-theft-auto-vi';
  psnprofiles.textContent = 'PSNProfiles';
  psnprofiles.rel = 'noopener';
  sources.append(document.createTextNode('Name, description and grade: '), exophase);
  if (trophy.target) {
    sources.append(document.createTextNode(` — progress target 0/${formatTarget(trophy)}: `), psnprofiles);
  }
  sources.append(document.createTextNode('. Guide: our own advice from the official description, not yet checked in the game.'));
  pane.append(sources);
  pane.append(el('p', 'detail-kinds', `Kind: ${trophy.kinds.join(', ')} · Roadmap stage ${trophy.stage} · ${trophy.hidden ? 'Hidden on PlayStation' : 'Shown on PlayStation'}`));
  return pane;
}

export function roadmapView(trophies, state, spoilersOn) {
  const wrap = el('section', 'roadmap');
  wrap.append(el('h2', 'view-title', 'Roadmap to the platinum'));
  wrap.append(el('p', 'view-intro', 'Five stages, in the order to earn them — built from the official descriptions: which story chapters and missions, which collectibles and counts. Finish a stage, then move on; the platinum pops at the end of stage 5.'));
  for (const stage of ROADMAP_STAGES) {
    const earned = trophies.filter((t) => t.stage === stage.stage && state.earned.includes(t.name)).length;
    const card = el('article', 'stage-card');
    const head = el('div', 'stage-head');
    head.append(el('span', 'stage-num', `Stage ${stage.stage}`));
    head.append(el('h3', 'stage-title', stage.title));
    head.append(el('span', 'stage-count', `${earned} / ${stage.trophyCount} earned`));
    const bar = el('div', 'bar');
    bar.append(el('div', 'bar-fill'));
    bar.firstChild.style.width = `${Math.round((100 * earned) / stage.trophyCount)}%`;
    card.append(head, bar, el('p', 'stage-goal', stage.goal), el('p', 'stage-advice', stage.advice));
    const names = el('p', 'stage-trophies', trophies.filter((t) => t.stage === stage.stage).map((t) => (spoilerHides(t, state, spoilersOn) ? 'Hidden story trophy' : t.name)).join(' · '));
    card.append(names);
    wrap.append(card);
  }
  return wrap;
}

export function missablesView(trophies, state, spoilersOn) {
  const wrap = el('section', 'missables');
  wrap.append(el('h2', 'view-title', 'Missables — the watch list'));
  wrap.append(el('p', 'view-intro', MISSABLE_VERDICT));
  const groups = [
    { title: 'Story-locked (18)', note: 'Only available while their mission or strand is open. They pop for completing it — finish the strand when it is offered.', list: trophies.filter((t) => t.missable === 'story') },
    { title: 'Single-event watch (12)', note: 'Tied to one named person, place or moment. The description does not say it repeats — do it while it is in front of you.', list: trophies.filter((t) => t.missable === 'watch') },
  ];
  for (const group of groups) {
    wrap.append(el('h3', 'group-title', group.title));
    wrap.append(el('p', 'group-note', group.note));
    for (const trophy of group.list) {
      const hidden = spoilerHides(trophy, state, spoilersOn);
      const card = el('article', 'watch-card');
      card.append(gradeBadge(trophy.grade));
      const body = el('div', 'watch-body');
      body.append(el('h4', 'watch-name', hidden ? 'Hidden story trophy' : trophy.name));
      body.append(el('p', 'watch-desc', hidden ? 'Hidden on PlayStation until earned.' : trophy.description));
      body.append(el('p', 'watch-reason', watchReasons(trophy)));
      card.append(body);
      wrap.append(card);
    }
  }
  const safe = trophies.filter((t) => t.missable === 'no').length;
  wrap.append(el('p', 'view-intro', `${safe} trophies are not missable from their descriptions: counters that accumulate across the whole game, targets that stay available, and the platinum itself.`));
  return wrap;
}

export function sourcesView() {
  const wrap = el('section', 'sources');
  wrap.append(el('h2', 'view-title', 'Sources & honesty'));
  wrap.append(el('p', 'view-intro', 'Where every fact in this guide comes from — and what this guide does not claim.'));
  const items = [
    ['The trophy list', 'Every name, description and grade is the official PlayStation 5 list as Exophase lists it (exophase.com/game/grand-theft-auto-vi-psn/trophies), agreeing with PSNProfiles on every name, description and grade: 55 trophies, 1 platinum, 2 gold, 6 silver, 46 bronze, 28 hidden.'],
    ['The counts', 'Every progress target (42 Shooting Range challenges, 14 drone race locations, 250 stunts, 100 WAiNK locations and the rest) is PSN\u2019s target as PSNProfiles lists it (psnprofiles.com/trophies/43531-grand-theft-auto-vi).'],
    ['The guides', 'Each guide is this entry\u2019s own words, drawn from the official description alone. Where a description names no place, no step is invented — the guide says so. Nothing here is copied from another guide, wiki, video or forum post.'],
    ['No online trophies', 'The official list has no online trophy: every one of the 55 is earned in single-player. The Online filter is kept so the empty result is visible, not hidden.'],
    ['Hidden trophies', '28 trophies are hidden on PlayStation until earned: the story trophies after the opening mission, and the secret ones with vague descriptions. The spoiler setting hides story trophies until you earn them.'],
    ['Offline', 'This guide is static files only. It fetches nothing at run time, stores your progress in your own browser, and works with the network off. No Rockstar logo or official artwork is used anywhere.'],
  ];
  for (const [title, text] of items) {
    const card = el('article', 'source-card');
    card.append(el('h3', 'source-title', title));
    card.append(el('p', 'source-text', text));
    wrap.append(card);
  }
  return wrap;
}

export { KIND_FILTERS, applyFilters, isOnWatchList };
