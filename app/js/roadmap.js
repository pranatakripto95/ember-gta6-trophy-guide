// Roadmap to the platinum: five stages in the order to earn them, built from the
// official descriptions alone — which story chapters and missions, which
// collectibles and counts, in what order. The missables page is built the same way.
export const ROADMAP_STAGES = [
  {
    stage: 1,
    title: 'Play the story',
    goal: 'Chapters 1–4, the named missions and the finale',
    trophyCount: 12,
    advice:
      'Just play. Every trophy in this stage pops for completing a chapter or a named story mission — Gone Fishing, Breakfast Run, The Cartel Heist, Child\u2019s Play, Headliners, VCIA Takedown and Operation Savage Glory — and the gold for the final mission. Nothing here needs a detour: the story hands you all twelve, in order.',
  },
  {
    stage: 2,
    title: 'Finish the character strands',
    goal: 'Andy, Kenton, Billy, Randy, Tyrone — and 8 stranger strands',
    trophyCount: 6,
    advice:
      'As the story opens each character up, follow their missions to the end. Each strand ends with one trophy for its final mission. Strangers & Freaks is the silver for eight whole stranger strands across Leonida, so talk to every stranger marker you pass and see each strand through — a strand left halfway does not count.',
  },
  {
    stage: 3,
    title: 'Activities and skills',
    goal: '42 range golds, 14 drone races, 20 race wins, 250 stunts, 50 challenges',
    trophyCount: 11,
    advice:
      'Sample all 9 activity types for Master of None, then grind the counters: gold all 42 Shooting Range challenges, win a Top Fun drone race at all 14 locations, win 20 different races, land 250 stunts and finish 50 challenges. Beat Cal at fishing and finish an arcade game along the way. Do the fishing challenge and Bret\u2019s unique-animal hunt while they are in front of you — both are on the watch list.',
  },
  {
    stage: 4,
    title: 'Collectibles and exploration',
    goal: '3 card sets, 100 WAiNK spots, 100 vehicles, 52 areas, 18 meditation spots',
    trophyCount: 7,
    advice:
      'Sweep the map once the whole of Leonida is open: 3 collectible card sets, WAiNK at 100 locations, 100 vehicles discovered, all 52 areas explored, meditation at all 18 spots, all 8 garage properties bought, and 10 vehicles registered to the Scooter Bros app. Use the counters in this guide to keep count — nothing here can be missed, it is just a lot of ground to cover.',
  },
  {
    stage: 5,
    title: 'Money, mayhem and the platinum',
    goal: 'Vaults, gangs, laundering — then 100% and the platinum',
    trophyCount: 19,
    advice:
      'The clean-up: 5 bank vaults, an armored truck, one illegal operation for each of the 9 gangs, 3 shops back-to-back with your partner, a 4-star escape with your partner, 5 takedowns in one Combat Focus, the VCIA departure, the showroom smash and the Ocean Beach cocktail. Launder $250,000 in Marked Bills and spend $100,000 in shops. Then A Long Road — 100% completion — and the platinum, Vice Got a Price!, pops last.',
  },
];

export const MISSABLE_VERDICT =
  'No trophy in the official list is confirmed missable from its description alone: every story trophy pops for completing its mission, and every counter trophy accumulates across the whole game. What the descriptions do show is a watch list — trophies tied to a single event, a named person or a specific place, which are safest done while they are in front of you.';

export function watchReasons(trophy) {
  if (trophy.missable === 'story') {
    return 'Story-locked: only available while its mission or strand is open. It pops for completing the mission, so it cannot be skipped past — but finish the strand when it is offered rather than leaving it for the end.';
  }
  if (trophy.missable === 'watch') {
    return 'Single event: tied to one named person, place or moment in its description. The description does not say it repeats, so do it while it is in front of you.';
  }
  return 'Not missable from its description: the trophy accumulates across the whole game or its target stays available.';
}
