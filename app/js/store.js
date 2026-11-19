// Progress store: earned trophies, per-trophy counters and settings, saved in localStorage.
// Export writes the whole state as JSON; import reads it back and validates it first.
export const STORE_KEY = 'ember-trophy-guide-v1';
export const SPOILER_KEY = 'ember-trophy-guide-spoilers';

export function blankState() {
  return { version: 1, earned: [], counters: {}, updatedAt: null };
}

export function loadProgress() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return blankState();
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.earned)) return blankState();
    return {
      version: 1,
      earned: [...new Set(parsed.earned.filter((n) => typeof n === 'string'))],
      counters: typeof parsed.counters === 'object' && parsed.counters !== null ? parsed.counters : {},
      updatedAt: parsed.updatedAt ?? null,
    };
  } catch {
    return blankState();
  }
}

export function saveProgress(state) {
  const clean = {
    version: 1,
    earned: [...new Set(state.earned)],
    counters: state.counters,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(STORE_KEY, JSON.stringify(clean));
  return clean;
}

export function isEarned(state, trophy) {
  return state.earned.includes(trophy.name);
}

export function setEarned(state, trophy, earned) {
  const names = new Set(state.earned);
  if (earned) names.add(trophy.name);
  else names.delete(trophy.name);
  state.earned = [...names];
  if (trophy.target && earned) state.counters[trophy.id] = trophy.target;
  if (trophy.target && !earned && state.counters[trophy.id] >= trophy.target) {
    state.counters[trophy.id] = 0;
  }
  return saveProgress(state);
}

export function setCounter(state, trophy, value) {
  const clamped = Math.max(0, Math.min(trophy.target || 0, Math.floor(value) || 0));
  state.counters[trophy.id] = clamped;
  if (clamped >= (trophy.target || 0) && trophy.target) {
    if (!state.earned.includes(trophy.name)) state.earned.push(trophy.name);
  } else if (clamped < (trophy.target || 0)) {
    state.earned = state.earned.filter((n) => n !== trophy.name);
  }
  return saveProgress(state);
}

export function counterOf(state, trophy) {
  if (!trophy.target) return null;
  return state.counters[trophy.id] ?? 0;
}

export function exportProgress(state) {
  return JSON.stringify(saveProgress(state), null, 2);
}

export function parseImportedProgress(text, knownNames) {
  const parsed = JSON.parse(text);
  if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.earned)) {
    throw new Error('That file is not a trophy-progress export: it needs an earned list.');
  }
  const known = new Set(knownNames);
  const earned = [...new Set(parsed.earned.filter((n) => typeof n === 'string' && known.has(n)))];
  const counters = {};
  if (parsed.counters && typeof parsed.counters === 'object') {
    for (const [key, value] of Object.entries(parsed.counters)) {
      const num = Number(value);
      if (Number.isFinite(num) && num >= 0) counters[key] = Math.floor(num);
    }
  }
  return { version: 1, earned, counters, updatedAt: new Date().toISOString() };
}

export function loadSpoilersOn() {
  return localStorage.getItem(SPOILER_KEY) !== 'off';
}

export function saveSpoilersOn(on) {
  localStorage.setItem(SPOILER_KEY, on ? 'on' : 'off');
}
