/**
 * Clamp a numeric value between min and max.
 * @param {number} num
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
import { BLACKSMITH_ITEMS, PATRONS, RITES_BUILDINGS } from './data.js';

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
    runes: { ...base.runes, ...saved.runes },
    religion: { ...base.religion, ...saved.religion, buildings: { ...base.religion?.buildings, ...saved.religion?.buildings } },
    world: { ...base.world, ...saved.world },
    perks: { ...base.perks, ...saved.perks },
    tutorial: { ...base.tutorial, ...saved.tutorial, steps: { ...base.tutorial.steps, ...saved.tutorial?.steps } },
    dev: { ...base.dev, ...saved.dev },
    stats: { ...base.stats, ...saved.stats },
    log: saved.log?.slice(-40) || base.log
  };
}

/**
 * Get religion bonuses based on patron and rites buildings.
 * @param {object} state
 * @returns {object}
 */
export function getReligionBonuses(state) {
  const religion = state.religion || { buildings: {}, blessing: { patron: null, expiresAt: 0 } };
  const activePatron = religion.blessing?.patron && (state.time || 0) < (religion.blessing?.expiresAt || 0)
    ? religion.blessing.patron
    : null;
  const patronDef = activePatron ? PATRONS.find(entry => entry.id === activePatron) : null;
  const base = patronDef?.effects || {};
  const shrineLevel = religion.buildings?.ashshrine || 0;
  const patronMult = 1 + shrineLevel * 0.06;
  const growthMult = (religion.buildings?.hymnhall || 0) * 0.08;
  const ashCapBonus = (religion.buildings?.embercairn || 0) * 50;
  return {
    foodMult: (base.foodMult || 0) * patronMult,
    woodMult: (base.woodMult || 0) * patronMult,
    knowledgeMult: (base.knowledgeMult || 0) * patronMult,
    ashGainMult: (base.ashGainMult || 0) * patronMult,
    atkMult: (base.atkMult || 0) * patronMult,
    hpMult: (base.hpMult || 0) * patronMult,
    growthMult,
    ashCapBonus
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
  const religion = getReligionBonuses(state);
  const storehouseLevel = state.buildings.storehouse || 0;
  const storehouseMult = 1 + storehouseLevel * 0.5;
  const baseFood = 200 + (state.buildings.smokehouse || 0) * 200;
  const baseWood = 200 + (state.buildings.woodcuttershed || 0) * 200;
  const baseStone = state.unlocks.stone ? 200 : 0;
  const baseMetal = state.unlocks.metal ? 200 : 0;
  const baseKnowledge = (state.unlocks.knowledge ? 200 : 0) + (state.buildings.skaldhall || 0) * 200;
  const baseAsh = state.unlocks.ash ? 100 : 0;
  return {
    food: Math.round(baseFood * storehouseMult),
    wood: Math.round(baseWood * storehouseMult),
    stone: Math.round(baseStone * storehouseMult),
    metal: Math.round(baseMetal * storehouseMult),
    ash: Math.round(baseAsh + religion.ashCapBonus),
    knowledge: Math.round(baseKnowledge)
  };
}

/**
 * Calculate production rates per second for each resource.
 * @param {object} state
 * @returns {Record<string, number>}
 */
export function calcRates(state) {
  const religion = getReligionBonuses(state);
  const runeProd = 1 + (state.runes?.ember || 0) * 0.02;
  const mult = state.perks.prodMult * runeProd;
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
    food: (state.jobs.forager * 1 + (leader === 'food' ? leaderBonus : 0)) * mult * workMult * foodMult * foodMult2 * foodMult3 * (1 + religion.foodMult),
    wood: (state.jobs.woodcutter * 1 + (leader === 'wood' ? leaderBonus : 0)) * mult * workMult * woodMult * woodMult2 * woodMult3 * (1 + religion.woodMult),
    stone: state.unlocks.stone ? (state.jobs.quarry * 1 + (leader === 'stone' ? leaderBonus : 0)) * mult * workMult : 0,
    metal: state.unlocks.metal ? (state.jobs.smelter * 1 + (leader === 'metal' ? leaderBonus : 0)) * mult * workMult : 0,
    knowledge: state.unlocks.knowledge ? (state.jobs.lorekeeper * 0.5 + (leader === 'knowledge' ? leaderBonus : 0)) * mult * workMult * knowMult * (1 + religion.knowledgeMult) : 0,
    ash: state.unlocks.ash ? (state.jobs.ashwalker * 1 + (leader === 'ash' ? leaderBonus : 0)) * mult * workMult : 0,
    attack: state.jobs.drillmaster * 0.06
  };
}

/**
 * Compute warband attack and health based on army size and upgrades.
 * @param {object} state
 * @returns {{atk:number, hp:number}}
 */
export function getArmyStats(state) {
  const religion = getReligionBonuses(state);
  const stance = state.ui?.combatStance || 'balanced';
  const stanceAtk = stance === 'aggressive' ? 1.25 : stance === 'defensive' ? 0.85 : 1;
  const runeAtk = 1 + (state.runes?.frost || 0) * 0.01;
  const baseAtk = state.clansfolk.army * 2.2;
  const baseHp = state.clansfolk.army * 8;
  let equipAtk = 0;
  let equipHp = 0;
  const slots = ['weapon', 'shield', 'armor'];
  slots.forEach(slot => {
    let remaining = state.clansfolk.army;
    Object.entries(state.equipment || {})
      .filter(([id, count]) => {
        const item = BLACKSMITH_ITEMS[id];
        return item && item.slot === slot && count > 0;
      })
      .sort((a, b) => {
        const itemA = BLACKSMITH_ITEMS[a[0]];
        const itemB = BLACKSMITH_ITEMS[b[0]];
        const scoreA = (itemA.atk || 0) + (itemA.hp || 0);
        const scoreB = (itemB.atk || 0) + (itemB.hp || 0);
        return scoreB - scoreA;
      })
      .forEach(([id, count]) => {
        if (remaining <= 0) return;
        const item = BLACKSMITH_ITEMS[id];
        const applied = Math.min(remaining, count);
        equipAtk += (item.atk || 0) * applied;
        equipHp += (item.hp || 0) * applied;
        remaining -= applied;
      });
  });
  return {
    atk: Math.max(0, (baseAtk + state.jobs.drillmaster * 0.8 + equipAtk) * state.perks.atkMult * stanceAtk * runeAtk * (1 + religion.atkMult)),
    hp: Math.max(0, (baseHp + state.jobs.drillmaster * 1.5 + equipHp) * (1 + religion.hpMult))
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
