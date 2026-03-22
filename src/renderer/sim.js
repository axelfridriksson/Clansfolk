import { clamp, calcCaps, calcRates, getArmyStats, getReligionBonuses, nextEnemy, normalizeWarbandRoles, totalJobs } from './systems.js';
import { getScoutReport } from './combat/scouting.js';
import { BLACKSMITH_ITEMS } from './data.js';

const BALANCE = {
  foodPerClansfolk: 0.25,
  growthBase: 1 / 120,
  growthPopScale: 0.0,
  idleBoostPer: 0.0,
  idleBoostMax: 0,
  idleGrowthCap: 20,
  growthBonusPerLevel: 0.2,
  enemyDamageScale: 0.5,
  playerDamageScale: 0.6
};

/**
 * Advance the simulation by dt seconds.
 * @param {object} prev
 * @param {number} [dt=1]
 * @returns {object}
 */
export function simulateTick(prev, dt = 1) {
  const next = { ...prev };
  next.world = { ...next.world, expedition: { ...next.world?.expedition }, scouting: { ...next.world?.scouting } };
  next.time += dt;

  const grassHuts = next.buildings.grasshut || 0;
  const timberHalls = next.buildings.timberhall || 0;
  const longhouses = next.buildings.longhouse || 0;
  const warcamps = next.buildings.warcamp || 0;
  const commanderPosts = next.buildings.commander || 0;

  next.unlocks = { ...next.unlocks };
  if (!next.world.enemiesPerZone) {
    next.world.enemiesPerZone = next.world.zone <= 10 ? 5 : 5 + Math.floor((next.world.zone - 10) / 5);
  }
  if (!next.world.enemyIndex) next.world.enemyIndex = 1;
  if (!next.unlocks.buildingsTier1 && grassHuts >= 10) next.unlocks.buildingsTier1 = true;
  if (!next.unlocks.buildingsTier2 && timberHalls >= 8) next.unlocks.buildingsTier2 = true;
  if (!next.unlocks.buildingsTier3 && longhouses >= 6) next.unlocks.buildingsTier3 = true;
  if (warcamps <= 0) {
    next.clansfolk.maxArmy = 1;
  } else {
    next.clansfolk.maxArmy = 1 + 1 + Math.max(0, warcamps - 1) * 2 + commanderPosts;
  }
  const totalClansfolk = next.clansfolk.total + next.clansfolk.army;
  const maxPop = 10 + grassHuts * 4 + timberHalls * 6 + longhouses * 8 + (next.buildings.stonekeep || 0) * 10;
  const crowdRatio = maxPop > 0 ? next.clansfolk.total / maxPop : 0;
  const crowdStart = maxPop >= 150 ? 0.9 : 0.95;
  let overcrowdingGrowthPenalty = 0;
  let overcrowdingOutputPenalty = 0;
  let overcrowdingFoodMult = 1;
  let overcrowdingStarvationMult = 1;
  if (crowdRatio >= crowdStart && crowdRatio < 1) {
    const t = (crowdRatio - crowdStart) / (1 - crowdStart);
    overcrowdingGrowthPenalty = 0.1 * t;
    overcrowdingOutputPenalty = 0.06 * t;
    overcrowdingFoodMult = 1 + 0.2 * t;
  } else if (crowdRatio >= 1 && crowdRatio < 1.1) {
    const t = (crowdRatio - 1) / 0.1;
    overcrowdingGrowthPenalty = 0.1 + 0.25 * t;
    overcrowdingOutputPenalty = 0.08 + 0.17 * t;
    overcrowdingFoodMult = 1.2 + 0.5 * t;
  } else if (crowdRatio >= 1.1) {
    const overflow = crowdRatio - 1.1;
    overcrowdingGrowthPenalty = 1;
    overcrowdingOutputPenalty = 0.25 + Math.min(0.2, overflow * 0.35);
    overcrowdingFoodMult = 1.7 + Math.min(0.6, overflow * 0.8);
    overcrowdingStarvationMult = 1.5;
  }
  const granaryMitigation = Math.min(0.6, (next.buildings.granaryhall || 0) * 0.08);
  overcrowdingFoodMult = 1 + (overcrowdingFoodMult - 1) * (1 - granaryMitigation);
  next.world.overcrowdingRatio = crowdRatio;
  next.world.overcrowdingGrowthPenalty = clamp(overcrowdingGrowthPenalty, 0, 1);
  next.world.overcrowdingOutputPenalty = clamp(overcrowdingOutputPenalty, 0, 0.85);
  next.world.overcrowdingFoodMult = overcrowdingFoodMult;
  if (!next.unlocks.weapons && totalClansfolk >= 12) next.unlocks.weapons = true;
  if (!next.unlocks.upgradesTier1 && grassHuts >= 10) next.unlocks.upgradesTier1 = true;
  if (!next.unlocks.upgradesTier2 && grassHuts >= 20 && next.world.zone >= 6) next.unlocks.upgradesTier2 = true;
  if (!next.unlocks.travel && next.unlocks.upgradesTier1) next.unlocks.travel = true;

  const logisticsBuildings = (next.buildings.ashaltar || 0)
    + (next.buildings.skaldhall || 0)
    + (next.buildings.stonekeep || 0)
    + (next.buildings.warcamp || 0);
  const storehouses = next.buildings.storehouse || 0;
  const logisticsFoodCost = logisticsBuildings * 0.2 * dt;
  const logisticsWoodCost = (next.buildings.masonryard || 0) * 0.08 * dt
    + (next.buildings.smeltery || 0) * 0.08 * dt
    + (next.buildings.ashaltar || 0) * 0.08 * dt
    + (next.buildings.stonekeep || 0) * 0.06 * dt
    + (next.buildings.skaldhall || 0) * 0.05 * dt
    + storehouses * 0.06 * dt;
  const logisticsStoneCost = storehouses * 0.05 * dt;
  const logisticsMetalCost = storehouses * 0.03 * dt;
  const availableFoodForLogistics = next.resources.food;
  const availableWoodForLogistics = next.resources.wood;
  const availableStoneForLogistics = next.resources.stone || 0;
  const availableMetalForLogistics = next.resources.metal || 0;
  const consumedFoodForLogistics = Math.min(availableFoodForLogistics, logisticsFoodCost);
  const consumedWoodForLogistics = Math.min(availableWoodForLogistics, logisticsWoodCost);
  const consumedStoneForLogistics = Math.min(availableStoneForLogistics, logisticsStoneCost);
  const consumedMetalForLogistics = Math.min(availableMetalForLogistics, logisticsMetalCost);
  const foodShortage = logisticsFoodCost > 0 ? (logisticsFoodCost - consumedFoodForLogistics) / logisticsFoodCost : 0;
  const woodShortage = logisticsWoodCost > 0 ? (logisticsWoodCost - consumedWoodForLogistics) / logisticsWoodCost : 0;
  const stoneShortage = logisticsStoneCost > 0 ? (logisticsStoneCost - consumedStoneForLogistics) / logisticsStoneCost : 0;
  const metalShortage = logisticsMetalCost > 0 ? (logisticsMetalCost - consumedMetalForLogistics) / logisticsMetalCost : 0;
  const shortageParts = [foodShortage, woodShortage];
  if (logisticsStoneCost > 0) shortageParts.push(stoneShortage);
  if (logisticsMetalCost > 0) shortageParts.push(metalShortage);
  next.world.logisticsPressure = clamp(shortageParts.reduce((sum, value) => sum + value, 0) / shortageParts.length, 0, 1);

  const nextCaps = calcCaps(next);
  const nextRates = calcRates(next);
  const religion = getReligionBonuses(next);

  if (next.religion?.blessing?.expiresAt && next.time >= next.religion.blessing.expiresAt) {
    next.religion = {
      ...next.religion,
      blessing: { patron: null, expiresAt: 0 }
    };
  }

  Object.keys(next.resources).forEach(key => {
    const gain = (nextRates[key] || 0) * dt;
    next.resources[key] = clamp(next.resources[key] + gain, 0, nextCaps[key]);
  });

  next.resources.food = clamp(next.resources.food - consumedFoodForLogistics, 0, nextCaps.food);
  next.resources.wood = clamp(next.resources.wood - consumedWoodForLogistics, 0, nextCaps.wood);
  if (next.unlocks.stone) {
    next.resources.stone = clamp((next.resources.stone || 0) - consumedStoneForLogistics, 0, nextCaps.stone);
  }
  if (next.unlocks.metal) {
    next.resources.metal = clamp((next.resources.metal || 0) - consumedMetalForLogistics, 0, nextCaps.metal);
  }

  const growthBonus = (1 + (next.upgrades.growthrites || 0) * BALANCE.growthBonusPerLevel) * (1 + religion.growthMult);
  const foodNeeded = next.clansfolk.total * BALANCE.foodPerClansfolk * overcrowdingFoodMult * dt;
  const availableFood = next.resources.food;
  const consumedFood = Math.min(availableFood, foodNeeded);
  next.resources.food = clamp(availableFood - consumedFood, 0, nextCaps.food);
  const starvationRatioRaw = foodNeeded > 0 ? Math.max(0, (foodNeeded - consumedFood) / foodNeeded) : 0;
  const starvationRatio = clamp(starvationRatioRaw * overcrowdingStarvationMult, 0, 1);
  next.world.populationDeclining = starvationRatio > 0;

  const idleCount = Math.max(0, next.clansfolk.idle);
  const idleEffective = Math.min(BALANCE.idleGrowthCap, idleCount);
  const baseGrowthRate = BALANCE.growthBase * idleEffective * growthBonus * (1 - next.world.overcrowdingGrowthPenalty);
  const growthRate = idleCount > 0 && starvationRatio === 0
    ? baseGrowthRate
    : 0;

  if (next.clansfolk.total < maxPop) {
    next.clansfolk.growthProgress = Math.min(1, next.clansfolk.growthProgress + growthRate * dt);
    if (next.clansfolk.growthProgress >= 1) {
      next.clansfolk.growthProgress = 0;
      next.clansfolk.total += 1;
      next.clansfolk.idle = Math.min(next.clansfolk.total - totalJobs(next.jobs), next.clansfolk.idle + 1);
    }
  } else {
    next.clansfolk.growthProgress = 0;
  }

  if (starvationRatio > 0 && next.clansfolk.total > 0) {
    const deathIdleEffective = Math.max(1, idleEffective);
    const deathRate = BALANCE.growthBase * deathIdleEffective * growthBonus * starvationRatio;
    next.clansfolk.starvationProgress = (next.clansfolk.starvationProgress || 0) + deathRate * dt;
    if (next.clansfolk.starvationProgress >= 1) {
      const loss = Math.floor(next.clansfolk.starvationProgress);
      next.clansfolk.starvationProgress = next.clansfolk.starvationProgress - loss;
      next.clansfolk.total = Math.max(0, next.clansfolk.total - loss);
      const assigned = totalJobs(next.jobs);
      let deficit = Math.max(0, assigned - next.clansfolk.total);
      if (deficit > 0) {
        Object.keys(next.jobs).forEach(key => {
          if (deficit <= 0) return;
          const remove = Math.min(deficit, next.jobs[key]);
          next.jobs[key] -= remove;
          deficit -= remove;
        });
      }
    }
  }

  const assigned = totalJobs(next.jobs);
  const maxIdle = Math.max(0, next.clansfolk.total - assigned);
  next.clansfolk.idle = maxIdle;

  if (next.tutorial?.enabled) {
    next.tutorial = { ...next.tutorial, steps: { ...next.tutorial.steps } };
    if (next.resources.food >= 20) next.tutorial.steps.food = true;
    if (next.resources.wood >= 20) next.tutorial.steps.wood = true;
    if ((next.buildings.grasshut || 0) >= 1) next.tutorial.steps.hut = true;
    if (next.clansfolk.army > 0) next.tutorial.steps.warband = true;
    if (next.world.zone > 1) next.tutorial.steps.zone = true;
  }

  if (next.world.fighting && next.clansfolk.army > 0) {
    const armyStats = getArmyStats(next);
    next.warband = { ...next.warband, health: ensureRoleHealth(next, armyStats) };
    syncAggregateWarbandHealth(next);
    const stance = next.ui?.combatStance || 'balanced';
    const battlePlan = next.ui?.battlePlan || 'hold';
    const stanceRange = stance === 'aggressive'
      ? { min: 0.2, max: 0.8 }
      : stance === 'defensive'
        ? { min: 0.4, max: 0.5 }
        : { min: 0.3, max: 0.6 };
    const planMods = getBattlePlanModifiers(battlePlan, next);
    const playerRoll = stanceRange.min + Math.random() * (stanceRange.max - stanceRange.min);
    const enemyRoll = 0.85 + Math.random() * 0.3;
    const playerCrit = Math.random() < 0.05 ? 1.6 : 1;
    const enemyCrit = Math.random() < 0.03 ? 1.5 : 1;
    const playerDamage = getCurrentWarbandAttack(next, armyStats) * BALANCE.playerDamageScale * dt * playerRoll * playerCrit * planMods.atkMult;
    const enemyDamage = next.world.enemyAtk * BALANCE.enemyDamageScale * dt * enemyRoll * enemyCrit * planMods.incomingMult;
    next.world.lastWarbandHit = playerDamage;
    next.world.lastEnemyHit = enemyDamage;
    next.world.enemyHP = Math.max(0, next.world.enemyHP - playerDamage);
    applyDamageToWarband(next, enemyDamage, armyStats);

    if (next.world.enemyHP <= 0) {
      const rewardSummary = {
        enemyName: next.world.enemyName,
        enemyIndex: next.world.enemyIndex,
        enemiesPerZone: next.world.enemiesPerZone || 5,
        food: Math.round(8 + next.world.zone * 1.4),
        wood: Math.round(5 + next.world.zone * 1.1),
        stone: next.unlocks.stone ? Math.round(3 + next.world.zone * 0.8) : 0,
        metal: next.unlocks.metal ? Math.round(2 + next.world.zone * 0.6) : 0,
        ash: 0,
        knowledge: next.unlocks.knowledge ? Math.max(0, next.world.zone - 4) : 0
      };
      rewardSummary.losses = getCombatLosses(next, armyStats);
      finalizeWarbandAfterCombat(next, armyStats);
      next.stats.totalKills += 1;
      next.resources.food = clamp(next.resources.food + rewardSummary.food, 0, nextCaps.food);
      next.resources.wood = clamp(next.resources.wood + rewardSummary.wood, 0, nextCaps.wood);
      if (next.unlocks.stone) {
        next.resources.stone = clamp(next.resources.stone + rewardSummary.stone, 0, nextCaps.stone);
      }
      if (next.unlocks.metal) {
        next.resources.metal = clamp(next.resources.metal + rewardSummary.metal, 0, nextCaps.metal);
      }
      if (next.unlocks.ash) {
        const ashAltarMult = 1 + (next.buildings.ashaltar || 0) * 0.15;
        const ashGain = Math.max(0, next.world.zone - 2) * (1 + religion.ashGainMult) * ashAltarMult;
        rewardSummary.ash = Math.round(ashGain);
        next.resources.ash = clamp(next.resources.ash + ashGain, 0, nextCaps.ash);
      }
      if (next.unlocks.knowledge) {
        next.resources.knowledge = clamp(next.resources.knowledge + rewardSummary.knowledge, 0, nextCaps.knowledge);
      }
      next.world.fighting = false;
      next.world.combatState = 'victory';
      next.world.lastVictory = rewardSummary;
      next.world.lastDefeat = null;
      next.world.combatStartCounts = null;
      next.log = [`${rewardSummary.enemyName} defeated.`, ...next.log].slice(0, 40);
    }

    if (next.clansfolk.armyHP <= 0) {
      const defeatSummary = {
        enemyName: next.world.enemyName,
        losses: getCombatLosses(next, armyStats)
      };
      finalizeWarbandAfterCombat(next, armyStats);
      next.world.fighting = false;
      next.world.combatState = 'defeat';
      next.world.lastVictory = null;
      next.world.lastDefeat = defeatSummary;
      next.world.combatStartCounts = null;
      next.log = ['Your warband fell. Regroup and try again.', ...next.log].slice(0, 40);
    }
  }

  if (next.world.expedition?.active) {
    next.world.expedition.timeLeft = Math.max(0, next.world.expedition.timeLeft - dt);
    if (next.world.expedition.timeLeft <= 0) {
      const party = next.world.expedition.party || 0;
      const zone = next.world.zone || 1;
      const type = next.world.expedition.type;
      const risk = type === 'salvage' ? 0.16 : type === 'embers' ? 0.24 : 0.2;
      const casualties = Math.min(party, Math.round(party * (risk * (0.55 + Math.random() * 0.9))));
      const survivors = Math.max(0, party - casualties);
      const rewardBase = Math.max(1, Math.round((zone + 2) * (party * 1.4)));
      if (type === 'salvage') {
        next.resources.metal = clamp(next.resources.metal + rewardBase * 1.1, 0, nextCaps.metal);
        next.resources.stone = clamp(next.resources.stone + rewardBase * 0.9, 0, nextCaps.stone);
      } else if (type === 'embers') {
        next.resources.ash = clamp(next.resources.ash + rewardBase * 1.0, 0, nextCaps.ash);
        next.resources.knowledge = clamp(next.resources.knowledge + rewardBase * 0.45, 0, nextCaps.knowledge);
      } else {
        next.resources.knowledge = clamp(next.resources.knowledge + rewardBase * 0.9, 0, nextCaps.knowledge);
        next.resources.food = clamp(next.resources.food + rewardBase * 0.8, 0, nextCaps.food);
      }
      next.clansfolk.army = Math.min(next.clansfolk.maxArmy, next.clansfolk.army + survivors);
      next.warband = { ...next.warband, roles: normalizeWarbandRoles(next.clansfolk.army, next.warband?.roles) };
      next.warband.health = ensureRoleHealth(next, getArmyStats(next), true);
      syncAggregateWarbandHealth(next);
      next.log = [
        `Expedition returned: ${survivors}/${party} survivors, ${casualties} lost.`,
        ...next.log
      ].slice(0, 40);
      next.world.expedition = {
        active: false,
        type: null,
        timeLeft: 0,
        duration: 0,
        party: 0
      };
    }
  }

  if (next.religion?.ritual?.active) {
    next.religion = { ...next.religion, ritual: { ...next.religion.ritual } };
    const holdUntil = next.religion.ritual.holdUntil || 0;
    if (holdUntil > next.time) {
      next.religion.ritual.timeLeft = Math.max(next.religion.ritual.timeLeft, holdUntil - next.time);
    } else {
      next.religion.ritual.timeLeft = Math.max(0, next.religion.ritual.timeLeft - dt);
    }
    if (next.religion.ritual.timeLeft <= 0 && holdUntil <= next.time) {
      const success = next.religion.ritual.hits >= next.religion.ritual.required;
      if (success) {
        const emberBonus = (next.religion.buildings?.embercairn || 0) * 60;
        next.religion.blessing = {
          patron: next.religion.ritual.patron,
          expiresAt: next.time + 20 * 60 + emberBonus
        };
        next.log = [`Ritual succeeded. ${next.religion.ritual.patron} blesses the clansfolk.`, ...next.log].slice(0, 40);
      } else {
        next.log = ['Ritual failed. The ashes scatter and fade.', ...next.log].slice(0, 40);
      }
      next.religion.ritual = {
        ...next.religion.ritual,
        active: false,
        patron: null,
        timeLeft: 0,
        duration: 0
      };
    }
  }

  if (next.world.scouting?.active) {
    next.world.scouting = { ...next.world.scouting };
    next.world.scouting.timeLeft = Math.max(0, next.world.scouting.timeLeft - dt);
    if (next.world.scouting.timeLeft <= 0) {
      const party = Math.max(1, next.world.scouting.party || 1);
      const coverage = getMeleeScoutCoverage(next);
      const risk = Math.max(0.04, 0.12 + next.world.zone * 0.012 - coverage * 0.06 - party * 0.008);
      const casualties = Math.min(party, Math.round(party * Math.max(0, risk) * (0.6 + Math.random() * 0.8)));
      const qualityScore = party + coverage * 2 - casualties * 0.75;
      const quality = qualityScore >= 4.5 ? 'full' : qualityScore >= 2.5 ? 'mid' : 'low';
      const report = getScoutReport(next, quality);
      next.world.scouting.active = false;
      next.world.scouting.casualties = casualties;
      next.world.scouting.report = report;
      next.world.scouting.quality = quality;
      next.clansfolk.army = Math.max(0, next.clansfolk.army - casualties);
      const nextRoles = {
        ...(next.warband?.roles || {}),
        melee: Math.max(0, (next.warband?.roles?.melee || 0) - casualties)
      };
      const nonMelee = (nextRoles.bowmen || 0) + (nextRoles.horsemen || 0) + (nextRoles.spearmen || 0) + (nextRoles.heavy || 0);
      nextRoles.melee = Math.max(0, next.clansfolk.army - nonMelee);
      next.warband = { ...next.warband, roles: normalizeWarbandRoles(next.clansfolk.army, nextRoles) };
      const refreshedStats = getArmyStats(next);
      next.warband.health = ensureRoleHealth(next, refreshedStats, true);
      syncAggregateWarbandHealth(next);
      Object.keys(next.equipment || {}).forEach((key) => {
        const item = BLACKSMITH_ITEMS[key];
        const roleCap = item ? (next.warband?.roles?.[item.role] || 0) : 0;
        if ((next.equipment[key] || 0) > roleCap) {
          const excess = next.equipment[key] - roleCap;
          next.equipment[key] = roleCap;
          next.inventory[key] = (next.inventory[key] || 0) + excess;
        }
      });
      next.log = [
        `Scouts returned: ${party - casualties}/${party} survived.`,
        ...report,
        ...next.log
      ].slice(0, 40);
    }
  }

  return next;
}

function getMeleeScoutCoverage(state) {
  const melee = Math.max(1, state.warband?.roles?.melee || 0);
  let sum = 0;
  Object.entries(state.equipment || {}).forEach(([id, count]) => {
    if (count <= 0) return;
    const item = BLACKSMITH_ITEMS[id];
    if (item?.role === 'melee') sum += count;
  });
  return Math.min(1, sum / Math.max(1, melee * 3));
}

function ensureRoleHealth(state, armyStats, resetToFull = false) {
  const current = state.warband?.health || {};
  const next = {};
  Object.entries(armyStats.roleStats || {}).forEach(([roleId, role]) => {
    const hpMax = Math.max(0, role.hpMax || 0);
    const previous = current[roleId];
    const ratio = !resetToFull && previous && previous.hpMax > 0
      ? previous.hp / previous.hpMax
      : 1;
    next[roleId] = {
      hpMax,
      hp: hpMax <= 0 ? 0 : Math.min(hpMax, Math.max(0, hpMax * ratio))
    };
  });
  return next;
}

function zeroRoleHealth(current = {}) {
  return Object.fromEntries(Object.keys(current).map((roleId) => [roleId, { hp: 0, hpMax: 0 }]));
}

function syncAggregateWarbandHealth(state) {
  const health = state.warband?.health || {};
  state.clansfolk.armyHPMax = Object.values(health).reduce((sum, role) => sum + (role?.hpMax || 0), 0);
  state.clansfolk.armyHP = Object.values(health).reduce((sum, role) => sum + (role?.hp || 0), 0);
}

function getCurrentWarbandAttack(state, armyStats) {
  return Object.entries(armyStats.roleStats || {}).reduce((sum, [roleId, role]) => {
    if (!role.hpMax) return sum;
    const currentHp = state.warband?.health?.[roleId]?.hp || 0;
    const ratio = Math.max(0, Math.min(1, currentHp / role.hpMax));
    return sum + role.atk * ratio;
  }, 0);
}

function applyDamageToWarband(state, damage, armyStats) {
  let remaining = Math.max(0, damage);
  const order = getDamagePriority(state.world?.enemyArchetype);
  order.forEach((roleId) => {
    if (remaining <= 0) return;
    const pool = state.warband?.health?.[roleId];
    const role = armyStats.roleStats?.[roleId];
    if (!pool || !role || role.count <= 0 || pool.hp <= 0) return;
    const absorbed = Math.min(pool.hp, remaining);
    pool.hp -= absorbed;
    remaining -= absorbed;
  });
  syncAggregateWarbandHealth(state);
}

function getDamagePriority(enemyType) {
  if (enemyType === 'skirmish') return ['bowmen', 'horsemen', 'melee', 'spearmen', 'heavy'];
  if (enemyType === 'beast') return ['melee', 'spearmen', 'heavy', 'bowmen', 'horsemen'];
  if (enemyType === 'captain' || enemyType === 'brute') return ['heavy', 'melee', 'spearmen', 'bowmen', 'horsemen'];
  return ['melee', 'heavy', 'spearmen', 'bowmen', 'horsemen'];
}

function getBattlePlanModifiers(plan, state) {
  const roles = state.warband?.roles || {};
  const bowmen = roles.bowmen || 0;
  const army = Math.max(1, state.clansfolk.army || 1);
  const bowShare = bowmen / army;
  const enemyType = state.world?.enemyArchetype || 'raider';
  const enemyCount = state.world?.enemyCount || 1;
  if (plan === 'press') {
    const rushBonus = enemyType === 'skirmish' || enemyType === 'raider' ? 0.08 : 0;
    const heavyPenalty = enemyType === 'shield' || enemyType === 'brute' || enemyType === 'captain' ? 0.08 : 0;
    return {
      atkMult: 1.12 + rushBonus - heavyPenalty,
      incomingMult: 1.08 + (enemyCount >= 5 ? 0.04 : 0)
    };
  }
  if (plan === 'volley') {
    const targetBonus = enemyType === 'skirmish' || enemyType === 'beast' ? 0.12 : 0;
    const shieldPenalty = enemyType === 'shield' || enemyType === 'captain' ? 0.1 : 0;
    return {
      atkMult: 1 + bowShare * (0.35 + targetBonus) - shieldPenalty,
      incomingMult: bowShare > 0 ? 1.06 + (enemyType === 'beast' ? 0.04 : 0) : 1
    };
  }
  const holdBonus = enemyType === 'beast' || enemyType === 'raider' || enemyCount >= 5 ? 0.08 : 0;
  return {
    atkMult: enemyType === 'captain' ? 0.98 : 0.94,
    incomingMult: Math.max(0.76, 0.88 - holdBonus)
  };
}

function getCombatLosses(state, armyStats) {
  const start = state.world?.combatStartCounts || {};
  const losses = {};
  Object.entries(armyStats.roleStats || {}).forEach(([roleId, role]) => {
    const started = Math.max(0, start?.[roleId] ?? role.count ?? 0);
    const now = Math.max(0, role.currentCount ?? role.count ?? 0);
    const lost = Math.max(0, started - now);
    if (lost > 0) losses[roleId] = lost;
  });
  return losses;
}

function finalizeWarbandAfterCombat(state, armyStats) {
  const survivors = {};
  Object.entries(armyStats.roleStats || {}).forEach(([roleId, role]) => {
    survivors[roleId] = Math.max(0, role.currentCount ?? 0);
  });
  const totalSurvivors = Object.values(survivors).reduce((sum, count) => sum + count, 0);
  state.clansfolk.army = totalSurvivors;
  state.warband = { ...state.warband, roles: normalizeWarbandRoles(totalSurvivors, survivors) };
  const updatedStats = getArmyStats(state);
  state.warband.health = Object.fromEntries(Object.keys(updatedStats.roleStats || {}).map((roleId) => {
    const hpMax = updatedStats.roleStats[roleId]?.hpMax || 0;
    return [roleId, { hp: hpMax, hpMax }];
  }));
  clampEquipmentToRoleCaps(state);
  syncAggregateWarbandHealth(state);
}

function clampEquipmentToRoleCaps(state) {
  Object.keys(state.equipment || {}).forEach((key) => {
    const item = BLACKSMITH_ITEMS[key];
    const roleCap = item ? (state.warband?.roles?.[item.role] || 0) : 0;
    if ((state.equipment[key] || 0) > roleCap) {
      const excess = state.equipment[key] - roleCap;
      state.equipment[key] = roleCap;
      state.inventory[key] = (state.inventory[key] || 0) + excess;
    }
  });
}
