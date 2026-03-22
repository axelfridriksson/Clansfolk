/**
 * Clamp a numeric value between min and max.
 * @param {number} num
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
import { BLACKSMITH_ITEMS, PATRONS, RITES_BUILDINGS } from './data.js';
import { getEnemyArchetypePool } from './combat/enemies.js';
import { createEmptyWarbandHealth, createEmptyWarbandRoles, ROLE_ORDER } from './combat/roles.js';

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
    warband: {
      ...base.warband,
      ...saved.warband,
      roles: { ...base.warband?.roles, ...saved.warband?.roles },
      health: { ...base.warband?.health, ...saved.warband?.health }
    },
    command: { ...base.command, ...saved.command },
    unlocks: { ...base.unlocks, ...saved.unlocks },
    runes: { ...base.runes, ...saved.runes },
    religion: { ...base.religion, ...saved.religion, buildings: { ...base.religion?.buildings, ...saved.religion?.buildings } },
    world: { ...base.world, ...saved.world },
    perks: { ...base.perks, ...saved.perks },
    tutorial: { ...base.tutorial, ...saved.tutorial, steps: { ...base.tutorial.steps, ...saved.tutorial?.steps } },
    dev: { ...base.dev, ...saved.dev },
    stats: { ...base.stats, ...saved.stats },
    ui: { ...base.ui, ...saved.ui },
    log: saved.log?.slice(-40) || base.log
  };
}

/**
 * Normalize warband role counts to the current deployed army size.
 * For now all deployed units collapse into melee until other roles unlock.
 * @param {number} armySize
 * @param {Record<string, number>} [roles]
 * @returns {{melee:number, bowmen:number, horsemen:number, spearmen:number, heavy:number}}
 */
export function normalizeWarbandRoles(armySize, roles = {}) {
  const total = Math.max(0, Math.floor(armySize || 0));
  const normalized = createEmptyWarbandRoles();
  ROLE_ORDER.forEach((id) => {
    normalized[id] = Math.max(0, Math.floor(roles[id] || 0));
  });
  const allocated = Object.values(normalized).reduce((sum, count) => sum + count, 0);
  if (allocated !== total) {
    normalized.melee = total;
    normalized.bowmen = 0;
    normalized.horsemen = 0;
    normalized.spearmen = 0;
    normalized.heavy = 0;
  }
  return normalized;
}

export function reconcileWarbandHealth(existingHealth = {}, roleStats = {}, resetToFull = false) {
  const next = createEmptyWarbandHealth();
  ROLE_ORDER.forEach((roleId) => {
    const hpMax = Math.max(0, roleStats[roleId]?.hpMax || 0);
    const prev = existingHealth?.[roleId];
    const ratio = !resetToFull && prev && prev.hpMax > 0 ? prev.hp / prev.hpMax : 1;
    next[roleId] = {
      hpMax,
      hp: hpMax <= 0 ? 0 : Math.min(hpMax, Math.max(0, hpMax * ratio))
    };
  });
  return next;
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
 * @param {number} [enemiesPerZone=5]
 * @returns {{hp:number, atk:number, archetype:string, name:string, traits:string[], count:number, forceLabel:string}}
 */
export function nextEnemy(zone, enemyIndex = 1, enemiesPerZone = 5) {
  const isCaptain = enemyIndex >= enemiesPerZone;
  const pool = getEnemyArchetypePool(isCaptain);
  const archetype = pool[(zone + enemyIndex - 1) % pool.length];
  const baseHp = 18 + zone * zone * 2.6 + enemyIndex * 2;
  const baseAtk = 1 + zone * 0.7 + enemyIndex * 0.2;
  const name = archetype.names[(zone * 3 + enemyIndex) % archetype.names.length];
  const count = getEncounterCount(archetype.id, zone, enemyIndex, enemiesPerZone);
  return {
    hp: Math.round(baseHp * archetype.hpMult * Math.max(1, 0.8 + count * 0.18)),
    atk: Math.round(baseAtk * archetype.atkMult * Math.max(1, 0.75 + count * 0.07)),
    archetype: archetype.id,
    name,
    traits: archetype.traits,
    count,
    forceLabel: getForceLabel(archetype.id, count, isCaptain)
  };
}

function getEncounterCount(archetypeId, zone, enemyIndex, enemiesPerZone) {
  if (enemyIndex >= enemiesPerZone) return 1;
  if (archetypeId === 'brute') return 1 + ((zone + enemyIndex) % 2);
  if (archetypeId === 'shield') return 3 + ((zone + enemyIndex) % 3);
  if (archetypeId === 'skirmish') return 4 + ((zone + enemyIndex) % 3);
  if (archetypeId === 'beast') return 2 + ((zone + enemyIndex) % 3);
  return 3 + ((zone + enemyIndex) % 4);
}

function getForceLabel(archetypeId, count, isCaptain) {
  if (isCaptain) return 'command group';
  if (archetypeId === 'shield') return count >= 5 ? 'shield knot' : 'shield patrol';
  if (archetypeId === 'skirmish') return count >= 5 ? 'harrier pack' : 'scout knot';
  if (archetypeId === 'beast') return count >= 4 ? 'beast pack' : 'beast pair';
  if (archetypeId === 'brute') return count > 1 ? 'breaker pair' : 'breaker';
  return count >= 5 ? 'raiding band' : 'raider knot';
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
  const baseStone = state.unlocks.stone ? 200 + (state.buildings.masonryard || 0) * 150 : 0;
  const baseMetal = state.unlocks.metal ? 200 + (state.buildings.smeltery || 0) * 150 : 0;
  const baseKnowledge = (state.unlocks.knowledge ? 200 : 0) + (state.buildings.skaldhall || 0) * 200;
  const baseAsh = state.unlocks.ash ? 100 + (state.buildings.ashaltar || 0) * 60 : 0;
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
  const logisticsPressure = clamp(state.world?.logisticsPressure || 0, 0, 1);
  const overcrowdingOutputPenalty = clamp(state.world?.overcrowdingOutputPenalty || 0, 0, 0.85);
  const logisticsMitigation = 1 - (state.upgrades.packdiscipline || 0) * 0.25;
  const effectivePressure = logisticsPressure * Math.max(0.4, logisticsMitigation);
  const logisticsFactor = Math.max(0.4, 1 - effectivePressure * 0.6);
  const overcrowdingFactor = Math.max(0.2, 1 - overcrowdingOutputPenalty);
  const runeProd = 1 + (state.runes?.ember || 0) * 0.02;
  const mult = state.perks.prodMult * runeProd;
  const workMult = 1 + (state.upgrades.workrhythm || 0) * 0.1;
  const foodMult = 1 + (state.upgrades.nets || 0) * 0.1;
  const foodMult2 = 1 + (state.upgrades.steelhooks || 0) * 0.2;
  const foodMult3 = 1 + (state.upgrades.agriculture || 0) * 0.15;
  const foodMult4 = 1 + (state.upgrades.croprotation || 0) * 0.08;
  const woodMult = 1 + (state.upgrades.axes || 0) * 0.1;
  const woodMult2 = 1 + (state.upgrades.fellingaxes || 0) * 0.2;
  const woodMult3 = 1 + (state.upgrades.woodcutting1 || 0) * 0.12;
  const woodMult4 = 1 + (state.upgrades.lumbergrading || 0) * 0.08;
  const stoneUpgradeMult = 1 + (state.upgrades.stonesurveying || 0) * 0.08;
  const metalUpgradeMult = 1 + (state.upgrades.bloomerymethods || 0) * 0.08;
  const knowMult = (1 + (state.upgrades.scholars || 0) * 0.1) * (1 + (state.upgrades.skaldcodex || 0) * 0.15);
  const ashAltarMult = 1 + (state.buildings.ashaltar || 0) * 0.15;
  const leader = state.ui?.leaderTask;
  const leaderBonus = 2;
  return {
    food: (state.jobs.forager * 1 + (leader === 'food' ? leaderBonus : 0)) * mult * workMult * foodMult * foodMult2 * foodMult3 * foodMult4 * (1 + religion.foodMult) * logisticsFactor * overcrowdingFactor,
    wood: (state.jobs.woodcutter * 1 + (leader === 'wood' ? leaderBonus : 0)) * mult * workMult * woodMult * woodMult2 * woodMult3 * woodMult4 * (1 + religion.woodMult) * logisticsFactor * overcrowdingFactor,
    stone: state.unlocks.stone ? (state.jobs.quarry * 1 + (leader === 'stone' ? leaderBonus : 0)) * mult * workMult * stoneUpgradeMult * logisticsFactor * overcrowdingFactor : 0,
    metal: state.unlocks.metal ? (state.jobs.smelter * 1 + (leader === 'metal' ? leaderBonus : 0)) * mult * workMult * metalUpgradeMult * logisticsFactor * overcrowdingFactor : 0,
    knowledge: state.unlocks.knowledge ? (state.jobs.lorekeeper * 0.5 + (leader === 'knowledge' ? leaderBonus : 0)) * mult * workMult * knowMult * (1 + religion.knowledgeMult) * logisticsFactor * overcrowdingFactor : 0,
    ash: state.unlocks.ash ? (state.jobs.ashwalker * 1 + (leader === 'ash' ? leaderBonus : 0)) * mult * workMult * ashAltarMult * logisticsFactor * overcrowdingFactor : 0,
    attack: state.jobs.drillmaster * 0.06
  };
}

/**
 * Compute warband attack and health based on army size, roles, and upgrades.
 * @param {object} state
 * @returns {{atk:number, hp:number, roles: Record<string, number>, matchup:number}}
 */
export function getArmyStats(state) {
  const religion = getReligionBonuses(state);
  const stance = state.ui?.combatStance || 'balanced';
  const stanceAtk = stance === 'aggressive' ? 1.25 : stance === 'defensive' ? 0.85 : 1;
  const runeAtk = 1 + (state.runes?.frost || 0) * 0.01;
  const roles = normalizeWarbandRoles(state.clansfolk.army, state.warband?.roles);
  const roleStats = {
    melee: { count: roles.melee, atk: roles.melee * 2.2, hpMax: roles.melee * 8 },
    bowmen: { count: roles.bowmen, atk: roles.bowmen * 1.8, hpMax: roles.bowmen * 5.5 },
    horsemen: { count: roles.horsemen, atk: roles.horsemen * 2.6, hpMax: roles.horsemen * 7 },
    spearmen: { count: roles.spearmen, atk: roles.spearmen * 2.3, hpMax: roles.spearmen * 8.5 },
    heavy: { count: roles.heavy, atk: roles.heavy * 2.8, hpMax: roles.heavy * 11 }
  };
  let equipAtk = 0;
  let equipHp = 0;
  const roleSlots = {
    melee: ['weapon', 'shield', 'armor'],
    bowmen: ['ranged', 'light'],
    horsemen: ['mount', 'weapon', 'armor'],
    spearmen: ['weapon', 'shield', 'armor'],
    heavy: ['weapon', 'shield', 'armor']
  };
  Object.entries(roleSlots).forEach(([roleId, slots]) => {
    let remainingBySlot = Math.max(0, roles[roleId] || 0);
    slots.forEach((slot) => {
      let remaining = remainingBySlot;
      Object.entries(state.equipment || {})
        .filter(([id, count]) => {
          const item = BLACKSMITH_ITEMS[id];
          return item && item.role === roleId && item.slot === slot && count > 0;
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
          roleStats[roleId].atk += (item.atk || 0) * applied;
          roleStats[roleId].hpMax += (item.hp || 0) * applied;
          remaining -= applied;
        });
    });
  });
  const matchup = getRoleMatchupModifier(roles, state.world?.enemyArchetype);
  const currentHealth = state.warband?.health || {};
  const scaledRoleStats = Object.fromEntries(Object.entries(roleStats).map(([roleId, role]) => {
    const currentHp = currentHealth?.[roleId]?.hp;
    const hpRatio = role.hpMax > 0 && Number.isFinite(currentHp)
      ? clamp(currentHp / role.hpMax, 0, 1)
      : 1;
    const hpPerUnit = role.count > 0 ? role.hpMax / role.count : 0;
    const currentCount = role.count <= 0
      ? 0
      : Math.max(0, Math.min(role.count, Math.ceil((Math.max(0, currentHp ?? role.hpMax)) / Math.max(1e-6, hpPerUnit))));
    return [
      roleId,
      {
        count: role.count,
        currentCount,
        atk: Math.max(0, role.atk * hpRatio * state.perks.atkMult * stanceAtk * runeAtk * (1 + religion.atkMult) * matchup),
        hpMax: Math.max(0, role.hpMax * (1 + religion.hpMult))
      }
    ];
  }));
  const totalAtk = Object.values(scaledRoleStats).reduce((sum, role) => sum + role.atk, 0);
  const totalHp = Object.values(roleStats).reduce((sum, role) => sum + role.hpMax, 0);
  return {
    atk: Math.max(0, totalAtk + state.jobs.drillmaster * 0.8 * state.perks.atkMult * stanceAtk * runeAtk * (1 + religion.atkMult) * matchup),
    hp: Math.max(0, (totalHp + state.jobs.drillmaster * 1.5) * (1 + religion.hpMult)),
    roles,
    roleStats: scaledRoleStats,
    matchup
  };
}

function getRoleMatchupModifier(roles, enemyArchetype = 'raider') {
  const total = Math.max(1, Object.values(roles || {}).reduce((sum, count) => sum + count, 0));
  const bowShare = (roles?.bowmen || 0) / total;
  if (bowShare <= 0) return 1;
  if (enemyArchetype === 'skirmish' || enemyArchetype === 'beast') return 1 + bowShare * 0.35;
  if (enemyArchetype === 'shield' || enemyArchetype === 'brute' || enemyArchetype === 'captain') return Math.max(0.85, 1 - bowShare * 0.2);
  return 1 + bowShare * 0.08;
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
