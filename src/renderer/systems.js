export function clamp(num, min, max) {
  return Math.max(min, Math.min(max, num));
}

export function loadSave(saveKey) {
  try {
    const raw = localStorage.getItem(saveKey);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Failed to load save', err);
    return null;
  }
}

export function mergeSave(base, saved) {
  return {
    ...base,
    ...saved,
    resources: { ...base.resources, ...saved.resources },
    clansfolk: { ...base.clansfolk, ...saved.clansfolk },
    jobs: { ...base.jobs, ...saved.jobs },
    buildings: { ...base.buildings, ...saved.buildings },
    upgrades: { ...base.upgrades, ...saved.upgrades },
    unlocks: { ...base.unlocks, ...saved.unlocks },
    world: { ...base.world, ...saved.world },
    perks: { ...base.perks, ...saved.perks },
    tutorial: { ...base.tutorial, ...saved.tutorial, steps: { ...base.tutorial.steps, ...saved.tutorial?.steps } },
    stats: { ...base.stats, ...saved.stats },
    log: saved.log?.slice(-40) || base.log
  };
}

export function nextEnemy(zone, enemyIndex = 1) {
  const hp = Math.round(18 + zone * zone * 2.6 + enemyIndex * 2);
  const atk = Math.round(1 + zone * 0.7 + enemyIndex * 0.2);
  return { hp, atk };
}

export function calcCaps(state) {
  const storehouseBonus = (state.buildings.storehouse || 0) * 150;
  return {
    food: 200 + (state.buildings.smokehouse || 0) * 200 + storehouseBonus,
    wood: 200 + storehouseBonus,
    stone: state.unlocks.stone ? 200 + storehouseBonus : 0,
    metal: state.unlocks.metal ? 200 + storehouseBonus : 0,
    ash: state.unlocks.ash ? 100 : 0,
    knowledge: state.unlocks.knowledge ? 200 : 0
  };
}

export function calcRates(state) {
  const mult = state.perks.prodMult;
  const workMult = 1 + (state.upgrades.workrhythm || 0) * 0.1;
  const foodMult = 1 + (state.upgrades.nets || 0) * 0.1;
  const foodMult2 = 1 + (state.upgrades.steelhooks || 0) * 0.2;
  const woodMult = 1 + (state.upgrades.axes || 0) * 0.1;
  const woodMult2 = 1 + (state.upgrades.fellingaxes || 0) * 0.2;
  const knowMult = 1 + (state.upgrades.scholars || 0) * 0.1;
  const leader = state.ui?.leaderTask;
  const leaderBonus = 2;
  return {
    food: (state.jobs.forager * 1 + (leader === 'food' ? leaderBonus : 0)) * mult * workMult * foodMult * foodMult2,
    wood: (state.jobs.woodcutter * 1 + (leader === 'wood' ? leaderBonus : 0)) * mult * workMult * woodMult * woodMult2,
    stone: state.unlocks.stone ? (state.jobs.quarry * 1 + (leader === 'stone' ? leaderBonus : 0)) * mult * workMult : 0,
    metal: state.unlocks.metal ? (state.jobs.smelter * 1 + (leader === 'metal' ? leaderBonus : 0)) * mult * workMult : 0,
    knowledge: state.unlocks.knowledge ? (state.jobs.lorekeeper * 1 + (leader === 'knowledge' ? leaderBonus : 0)) * mult * workMult * knowMult : 0,
    ash: state.unlocks.ash ? (state.jobs.ashwalker * 1 + (leader === 'ash' ? leaderBonus : 0)) * mult * workMult : 0,
    attack: state.jobs.drillmaster * 0.12
  };
}

export function getArmyStats(state) {
  const baseAtk = state.clansfolk.army * 2.2;
  const baseHp = state.clansfolk.army * 8;
  const dmgMult = 1 + (state.upgrades.woodsword || 0) * 0.05;
  const dmgMult2 = 1 + (state.upgrades.steelsword || 0) * 0.15;
  const hpMult = 1 + (state.upgrades.woodshield || 0) * 0.05;
  const hpMult2 = 1 + (state.upgrades.ironshield || 0) * 0.15;
  const hpMult3 = 1 + (state.upgrades.woolarmor || 0) * 0.05;
  return {
    atk: Math.max(0, (baseAtk + state.jobs.drillmaster * 1.4) * state.perks.atkMult * dmgMult * dmgMult2),
    hp: Math.max(0, (baseHp + state.jobs.drillmaster * 3) * hpMult * hpMult2 * hpMult3)
  };
}

export function canAfford(state, cost) {
  return Object.entries(cost).every(([key, value]) => state.resources[key] >= value);
}

export function applyCost(state, cost) {
  const next = { ...state.resources };
  Object.entries(cost).forEach(([key, value]) => {
    next[key] -= value;
  });
  return next;
}

export function totalJobs(jobs) {
  return Object.values(jobs).reduce((sum, val) => sum + val, 0);
}
