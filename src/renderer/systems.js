/**
 * Clamp a numeric value between min and max.
 * @param {number} num
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
import { BLACKSMITH_ITEMS } from './data.js';

export function clamp(num, min, max) {
  return Math.max(min, Math.min(max, num));
}

/**
 * Load saved state from localStorage.
 * @param {string} saveKey
 * @returns {object|null}
 */
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

/**
 * Merge a saved state into the current schema.
 * @param {object} base
 * @param {object} saved
 * @returns {object}
 */
export function mergeSave(base, saved) {
  return {
    ...base,
    ...saved,
    resources: { ...base.resources, ...saved.resources },
    clansfolk: { ...base.clansfolk, ...saved.clansfolk },
    jobs: { ...base.jobs, ...saved.jobs },
    buildings: { ...base.buildings, ...saved.buildings },
    upgrades: { ...base.upgrades, ...saved.upgrades },
    inventory: { ...base.inventory, ...saved.inventory },
    equipment: { ...base.equipment, ...saved.equipment },
    unlocks: { ...base.unlocks, ...saved.unlocks },
    world: { ...base.world, ...saved.world },
    perks: { ...base.perks, ...saved.perks },
    tutorial: { ...base.tutorial, ...saved.tutorial, steps: { ...base.tutorial.steps, ...saved.tutorial?.steps } },
    dev: { ...base.dev, ...saved.dev },
    stats: { ...base.stats, ...saved.stats },
    log: saved.log?.slice(-40) || base.log
  };
}

/**
 * Get scaled enemy stats for a zone and index within the zone.
 * @param {number} zone
 * @param {number} [enemyIndex=1]
 * @returns {{hp:number, atk:number}}
 */
export function nextEnemy(zone, enemyIndex = 1) {
  const hp = Math.round(18 + zone * zone * 2.6 + enemyIndex * 2);
  const atk = Math.round(1 + zone * 0.7 + enemyIndex * 0.2);
  return { hp, atk };
}

/**
 * Calculate storage caps for each resource.
 * @param {object} state
 * @returns {Record<string, number>}
 */
export function calcCaps(state) {
  const storehouseLevel = state.buildings.storehouse || 0;
  const storehouseMult = 1 + storehouseLevel * 0.5;
  const baseFood = 200 + (state.buildings.smokehouse || 0) * 200;
  const baseWood = 200 + (state.buildings.woodcuttershed || 0) * 200;
  const baseStone = state.unlocks.stone ? 200 : 0;
  const baseMetal = state.unlocks.metal ? 200 : 0;
  const baseKnowledge = (state.unlocks.knowledge ? 200 : 0) + (state.buildings.skaldhall || 0) * 200;
  return {
    food: Math.round(baseFood * storehouseMult),
    wood: Math.round(baseWood * storehouseMult),
    stone: Math.round(baseStone * storehouseMult),
    metal: Math.round(baseMetal * storehouseMult),
    ash: state.unlocks.ash ? 100 : 0,
    knowledge: Math.round(baseKnowledge)
  };
}

/**
 * Calculate production rates per second for each resource.
 * @param {object} state
 * @returns {Record<string, number>}
 */
export function calcRates(state) {
  const mult = state.perks.prodMult;
  const workMult = 1 + (state.upgrades.workrhythm || 0) * 0.1;
  const foodMult = 1 + (state.upgrades.nets || 0) * 0.1;
  const foodMult2 = 1 + (state.upgrades.steelhooks || 0) * 0.2;
  const foodMult3 = 1 + (state.upgrades.agriculture || 0) * 0.15;
  const woodMult = 1 + (state.upgrades.axes || 0) * 0.1;
  const woodMult2 = 1 + (state.upgrades.fellingaxes || 0) * 0.2;
  const woodMult3 = 1 + (state.upgrades.woodcutting1 || 0) * 0.12;
  const knowMult = 1 + (state.upgrades.scholars || 0) * 0.1;
  const leader = state.ui?.leaderTask;
  const leaderBonus = 2;
  return {
    food: (state.jobs.forager * 1 + (leader === 'food' ? leaderBonus : 0)) * mult * workMult * foodMult * foodMult2 * foodMult3,
    wood: (state.jobs.woodcutter * 1 + (leader === 'wood' ? leaderBonus : 0)) * mult * workMult * woodMult * woodMult2 * woodMult3,
    stone: state.unlocks.stone ? (state.jobs.quarry * 1 + (leader === 'stone' ? leaderBonus : 0)) * mult * workMult : 0,
    metal: state.unlocks.metal ? (state.jobs.smelter * 1 + (leader === 'metal' ? leaderBonus : 0)) * mult * workMult : 0,
    knowledge: state.unlocks.knowledge ? (state.jobs.lorekeeper * 1 + (leader === 'knowledge' ? leaderBonus : 0)) * mult * workMult * knowMult : 0,
    ash: state.unlocks.ash ? (state.jobs.ashwalker * 1 + (leader === 'ash' ? leaderBonus : 0)) * mult * workMult : 0,
    attack: state.jobs.drillmaster * 0.12
  };
}

/**
 * Compute warband attack and health based on army size and upgrades.
 * @param {object} state
 * @returns {{atk:number, hp:number}}
 */
export function getArmyStats(state) {
  const baseAtk = state.clansfolk.army * 2.2;
  const baseHp = state.clansfolk.army * 8;
  let equipAtk = 0;
  let equipHp = 0;
  Object.entries(state.equipment || {}).forEach(([id, count]) => {
    const item = BLACKSMITH_ITEMS[id];
    if (!item || !count) return;
    equipAtk += (item.atk || 0) * count;
    equipHp += (item.hp || 0) * count;
  });
  return {
    atk: Math.max(0, (baseAtk + state.jobs.drillmaster * 1.4 + equipAtk) * state.perks.atkMult),
    hp: Math.max(0, (baseHp + state.jobs.drillmaster * 3 + equipHp))
  };
}

/**
 * Check if the player can afford a cost.
 * @param {object} state
 * @param {Record<string, number>} cost
 * @returns {boolean}
 */
export function canAfford(state, cost) {
  return Object.entries(cost).every(([key, value]) => state.resources[key] >= value);
}

/**
 * Subtract a cost from resources.
 * @param {object} state
 * @param {Record<string, number>} cost
 * @returns {object}
 */
export function applyCost(state, cost) {
  const next = { ...state.resources };
  Object.entries(cost).forEach(([key, value]) => {
    next[key] -= value;
  });
  return next;
}

/**
 * Total assigned workers across all jobs.
 * @param {Record<string, number>} jobs
 * @returns {number}
 */
export function totalJobs(jobs) {
  return Object.values(jobs).reduce((sum, val) => sum + val, 0);
}
