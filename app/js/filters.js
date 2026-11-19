// Filters: kind, grade, search text, earned-only and the spoiler rule.
// The spoiler rule hides a story trophy's name and description until it is earned.
export const KIND_FILTERS = [
  { id: 'all', label: 'All trophies' },
  { id: 'story', label: 'Story' },
  { id: 'missable', label: 'Missable watch' },
  { id: 'collectible', label: 'Collectibles' },
  { id: 'activity', label: 'Activities' },
  { id: 'online', label: 'Online' },
];

export const GRADE_FILTERS = ['all', 'platinum', 'gold', 'silver', 'bronze'];

export function isStoryTrophy(trophy) {
  return trophy.kinds.includes('story');
}

export function isOnWatchList(trophy) {
  return trophy.missable === 'watch' || trophy.missable === 'story';
}

export function matchesKind(trophy, kind) {
  if (kind === 'all') return true;
  if (kind === 'missable') return isOnWatchList(trophy);
  if (kind === 'online') return trophy.kinds.includes('online');
  return trophy.kinds.includes(kind);
}

export function matchesSearch(trophy, query) {
  if (!query) return true;
  const hay = `${trophy.name} ${trophy.description} ${trophy.guide}`.toLowerCase();
  return query.toLowerCase().split(/\s+/).every((word) => hay.includes(word));
}

export function applyFilters(trophies, state, filters) {
  return trophies.filter((trophy) => {
    if (!matchesKind(trophy, filters.kind)) return false;
    if (filters.grade !== 'all' && trophy.grade !== filters.grade) return false;
    if (filters.earnedOnly && !state.earned.includes(trophy.name)) return false;
    if (!matchesSearch(trophy, filters.query)) return false;
    return true;
  });
}

export function spoilerHides(trophy, state, spoilersOn) {
  return spoilersOn && isStoryTrophy(trophy) && !state.earned.includes(trophy.name);
}

export function gradeLabel(grade) {
  return grade.charAt(0).toUpperCase() + grade.slice(1);
}

export function missableLabel(trophy) {
  if (trophy.missable === 'story') return 'Story-locked';
  if (trophy.missable === 'watch') return 'Do it while you are there';
  return 'Not missable';
}

export function formatTarget(trophy) {
  if (!trophy.target) return '';
  return trophy.target.toLocaleString('en-US');
}
