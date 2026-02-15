import { clamp, calcCaps, calcRates, getArmyStats, getReligionBonuses, nextEnemy, totalJobs } from './systems.js';

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
  next.world = { ...next.world, expedition: { ...next.world?.expedition } };
  next.time += dt;

  const grassHuts = next.buildings.grasshut || 0;
  const timberHalls = next.buildings.timberhall || 0;
  const longhouses = next.buildings.longhouse || 0;
  const warcamps = next.buildings.warcamp || 0;

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
    next.clansfolk.maxArmy = 1 + 1 + Math.max(0, warcamps - 1) * 2;
  }
  const totalClansfolk = next.clansfolk.total + next.clansfolk.army;
  if (!next.unlocks.weapons && totalClansfolk >= 12) next.unlocks.weapons = true;
  if (!next.unlocks.upgradesTier1 && grassHuts >= 10) next.unlocks.upgradesTier1 = true;
  if (!next.unlocks.upgradesTier2 && grassHuts >= 20 && next.world.zone >= 6) next.unlocks.upgradesTier2 = true;
  if (!next.unlocks.travel && next.unlocks.upgradesTier1) next.unlocks.travel = true;

  const logisticsBuildings = (next.buildings.quarrycamp || 0)
    + (next.buildings.foundry || 0)
    + (next.buildings.ashaltar || 0)
    + (next.buildings.skaldhall || 0)
    + (next.buildings.stonekeep || 0)
    + (next.buildings.warcamp || 0);
  const logisticsFoodCost = logisticsBuildings * 0.2 * dt;
  const logisticsWoodCost = (next.buildings.quarrycamp || 0) * 0.12 * dt
    + (next.buildings.foundry || 0) * 0.12 * dt
    + (next.buildings.ashaltar || 0) * 0.08 * dt
    + (next.buildings.stonekeep || 0) * 0.06 * dt
    + (next.buildings.skaldhall || 0) * 0.05 * dt;
  const availableFoodForLogistics = next.resources.food;
  const availableWoodForLogistics = next.resources.wood;
  const consumedFoodForLogistics = Math.min(availableFoodForLogistics, logisticsFoodCost);
  const consumedWoodForLogistics = Math.min(availableWoodForLogistics, logisticsWoodCost);
  const foodShortage = logisticsFoodCost > 0 ? (logisticsFoodCost - consumedFoodForLogistics) / logisticsFoodCost : 0;
  const woodShortage = logisticsWoodCost > 0 ? (logisticsWoodCost - consumedWoodForLogistics) / logisticsWoodCost : 0;
  next.world.logisticsPressure = clamp((foodShortage + woodShortage) / 2, 0, 1);

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

  const maxPop = 10 + grassHuts * 4 + timberHalls * 6 + longhouses * 8 + (next.buildings.stonekeep || 0) * 10;
  const growthBonus = (1 + (next.upgrades.growthrites || 0) * BALANCE.growthBonusPerLevel) * (1 + religion.growthMult);
  const foodNeeded = next.clansfolk.total * BALANCE.foodPerClansfolk * dt;
  const availableFood = next.resources.food;
  const consumedFood = Math.min(availableFood, foodNeeded);
  next.resources.food = clamp(availableFood - consumedFood, 0, nextCaps.food);
  const starvationRatio = foodNeeded > 0 ? Math.max(0, (foodNeeded - consumedFood) / foodNeeded) : 0;

  const idleCount = Math.max(0, next.clansfolk.idle);
  const idleEffective = Math.min(BALANCE.idleGrowthCap, idleCount);
  const baseGrowthRate = BALANCE.growthBase * idleEffective * growthBonus;
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
    next.clansfolk.armyHPMax = armyStats.hp;
    if (next.clansfolk.armyHP === 0) next.clansfolk.armyHP = armyStats.hp;
    const stance = next.ui?.combatStance || 'balanced';
    const stanceRange = stance === 'aggressive'
      ? { min: 0.2, max: 0.8 }
      : stance === 'defensive'
        ? { min: 0.4, max: 0.5 }
        : { min: 0.3, max: 0.6 };
    const playerRoll = stanceRange.min + Math.random() * (stanceRange.max - stanceRange.min);
    const enemyRoll = 0.85 + Math.random() * 0.3;
    const playerCrit = Math.random() < 0.05 ? 1.6 : 1;
    const enemyCrit = Math.random() < 0.03 ? 1.5 : 1;
    const playerDamage = armyStats.atk * BALANCE.playerDamageScale * dt * playerRoll * playerCrit;
    const enemyDamage = next.world.enemyAtk * BALANCE.enemyDamageScale * dt * enemyRoll * enemyCrit;
    next.world.lastWarbandHit = playerDamage;
    next.world.lastEnemyHit = enemyDamage;
    next.world.enemyHP = Math.max(0, next.world.enemyHP - playerDamage);
    next.clansfolk.armyHP = Math.max(0, next.clansfolk.armyHP - enemyDamage);

    if (next.world.enemyHP <= 0) {
      next.stats.totalKills += 1;
      next.resources.food = clamp(next.resources.food + 8 + next.world.zone * 1.4, 0, nextCaps.food);
      next.resources.wood = clamp(next.resources.wood + 5 + next.world.zone * 1.1, 0, nextCaps.wood);
      if (next.unlocks.stone) {
        next.resources.stone = clamp(next.resources.stone + 3 + next.world.zone * 0.8, 0, nextCaps.stone);
      }
      if (next.unlocks.metal) {
        next.resources.metal = clamp(next.resources.metal + 2 + next.world.zone * 0.6, 0, nextCaps.metal);
      }
      if (next.unlocks.ash) {
        const ashAltarMult = 1 + (next.buildings.ashaltar || 0) * 0.15;
        const ashGain = Math.max(0, next.world.zone - 2) * (1 + religion.ashGainMult) * ashAltarMult;
        next.resources.ash = clamp(next.resources.ash + ashGain, 0, nextCaps.ash);
      }
      if (next.unlocks.knowledge) {
        next.resources.knowledge = clamp(next.resources.knowledge + Math.max(0, next.world.zone - 4), 0, nextCaps.knowledge);
      }

      const enemiesPerZone = next.world.enemiesPerZone || 5;
      if (next.world.enemyIndex < enemiesPerZone) {
        next.world.enemyIndex += 1;
        const enemy = nextEnemy(next.world.zone, next.world.enemyIndex);
        next.world.enemyHP = enemy.hp;
        next.world.enemyHPMax = enemy.hp;
        next.world.enemyAtk = enemy.atk;
      } else {
        next.log = [`Zone ${next.world.zone} cleared.`, ...next.log].slice(0, 40);
        next.world.zone += 1;
        next.world.enemyIndex = 1;
        next.world.enemiesPerZone = next.world.zone <= 10 ? 5 : 5 + Math.floor((next.world.zone - 10) / 5);
        const enemy = nextEnemy(next.world.zone, next.world.enemyIndex);
        next.world.enemyHP = enemy.hp;
        next.world.enemyHPMax = enemy.hp;
        next.world.enemyAtk = enemy.atk;
      }
    }

    if (next.clansfolk.armyHP <= 0) {
      next.clansfolk.army = 0;
      next.clansfolk.armyHP = 0;
      next.equipment = Object.fromEntries(Object.keys(next.equipment || {}).map(key => [key, 0]));
      next.world.fighting = false;
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

  return next;
}
