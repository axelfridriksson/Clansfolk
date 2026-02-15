import React, { useEffect, useMemo, useRef, useState } from 'react';
import stillBg from './assets/images/Still.png';
import frozenBg from './assets/images/Frozen.png';
import hellBg from './assets/images/hellvibes.png';
import { BLACKSMITH_ITEMS, BUILDINGS, JOBS, UPGRADES, PATRONS, RITES_BUILDINGS } from './data.js';
import { SAVE_KEY, START_STATE } from './models.js';
import { calcCaps, calcRates, getArmyStats, canAfford, applyCost, loadSave, mergeSave, totalJobs } from './systems.js';
import { simulateTick } from './sim.js';
import ArrowDuelCanvas from './components/ArrowDuelCanvas.jsx';
import ChantMinigame from './components/ChantMinigame.jsx';
import chant1 from './assets/audio/sfx/chant1.wav';
import chant2 from './assets/audio/sfx/chant2.wav';
import chant3 from './assets/audio/sfx/chant3.wav';
import chant4 from './assets/audio/sfx/chant4.wav';
import misschant1 from './assets/audio/sfx/misschant1.wav';
import misschant2 from './assets/audio/sfx/misschant2.wav';
import misschant3 from './assets/audio/sfx/misschant3.wav';
import misschant4 from './assets/audio/sfx/misschant4.wav';

const RESOURCE_JOBS = {
  food: 'forager',
  wood: 'woodcutter',
  stone: 'quarry',
  metal: 'smelter',
  knowledge: 'lorekeeper',
  ash: 'ashwalker'
};

export default function App() {
  const [state, setState] = useState(() => {
    const saved = loadSave(SAVE_KEY);
    return saved ? mergeSave(START_STATE, saved) : START_STATE;
  });
  const [tooltip, setTooltip] = useState(null);
  const [assignStep, setAssignStep] = useState(1);
  const ritualLaneRef = useRef(null);
  const ritualTargetRef = useRef(null);
  const chantHitRef = useRef([]);
  const chantMissRef = useRef([]);

  const caps = useMemo(() => calcCaps(state), [state.buildings, state.unlocks, state.religion]);
  const rates = useMemo(() => calcRates(state), [state.jobs, state.buildings, state.perks, state.religion, state.unlocks]);
  const army = useMemo(() => getArmyStats(state), [state.clansfolk, state.jobs, state.perks, state.equipment, state.ui?.combatStance, state.religion]);
  const activeTab = state.ui?.tab || 'overview';
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'warcamp', label: 'Warcamp', requires: () => (state.buildings.warcamp || 0) > 0 },
    { id: 'rites', label: 'Rites', requires: () => state.unlocks.ash },
    { id: 'travel', label: 'Travel' }
  ];
  const blacksmithItems = Object.entries(BLACKSMITH_ITEMS)
    .map(([id, item]) => ({ id, ...item }))
    .filter(item => (!item.unlock || state.unlocks[item.unlock]) && state.unlocks.blacksmith);
  const equipItems = blacksmithItems;
  const equipSlots = [
    { id: 'weapon', label: 'Weapon' },
    { id: 'shield', label: 'Shield' },
    { id: 'armor', label: 'Armor' }
  ];
  const equipmentTiers = [
    {
      id: 'wood',
      label: 'Wood',
      items: ['woodsword', 'woodshield', 'woolarmor']
    },
    {
      id: 'reinforced',
      label: 'Reinforced',
      unlock: 'weaponTier2',
      items: ['reinforcedsword', 'reinforcedshield', 'paddedarmor']
    },
    {
      id: 'iron',
      label: 'Iron',
      unlock: 'weaponTier3',
      items: ['ironsword', 'ironshield', 'chainarmor']
    }
  ];
  const availableBlacksmithTiers = equipmentTiers.filter(tier => !tier.unlock || state.unlocks[tier.unlock]);
  const selectedBlacksmithTier = availableBlacksmithTiers.find(tier => tier.id === state.ui?.blacksmithTier)
    ? state.ui.blacksmithTier
    : (availableBlacksmithTiers[0]?.id || 'wood');
  const blacksmithItemsByTier = blacksmithItems.filter(item => {
    const tier = equipmentTiers.find(entry => entry.items.includes(item.id));
    return tier?.id === selectedBlacksmithTier;
  });
  const ritesBuildings = Object.entries(RITES_BUILDINGS).map(([id, data]) => ({ id, ...data }));
  const patron = PATRONS.find(entry => entry.id === state.religion?.patron);

  useEffect(() => {
    let running = true;
    const step = 0.25;
    const maxCatchUp = 10;
    const lastRef = { t: performance.now() };
    const accRef = { t: 0 };

    const loop = (now) => {
      if (!running) return;
      const dt = Math.min(1, (now - lastRef.t) / 1000);
      lastRef.t = now;
      accRef.t += dt;
      if (accRef.t >= step) {
        setState(prev => {
          let next = prev;
          let steps = 0;
          while (accRef.t >= step && steps < maxCatchUp) {
            next = simulateTick(next, step);
            accRef.t -= step;
            steps += 1;
          }
          return next;
        });
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);

    return () => {
      running = false;
    };
  }, []);

  useEffect(() => {
    if (!state.religion?.ritual?.active) return undefined;
    let running = true;
    const loop = () => {
      if (!running) return;
      const ritual = state.religion?.ritual;
      if (ritual?.type === 'archery') {
        const laneEl = ritualLaneRef.current;
        const targetEl = ritualTargetRef.current;
        if (ritual && laneEl && targetEl) {
          const rect = laneEl.getBoundingClientRect();
          const meter = getRitualMeter(performance.now() / 1000, ritual);
          const maxX = Math.max(0, rect.width - 16);
          targetEl.style.transform = `translateX(${meter * maxX}px)`;
        }
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
    return () => {
      running = false;
    };
  }, [state.religion?.ritual?.active, state.religion?.ritual?.startTime, state.religion?.ritual?.period, state.religion?.ritual?.bandCenter, state.religion?.ritual?.bandWidth]);


  useEffect(() => {
    const saveInterval = setInterval(() => {
      localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    }, 6000);
    return () => clearInterval(saveInterval);
  }, [state]);

  useEffect(() => {
    chantHitRef.current = [chant1, chant2, chant3, chant4].map(src => new Audio(src));
    chantMissRef.current = [misschant1, misschant2, misschant3, misschant4].map(src => new Audio(src));
    chantHitRef.current.forEach(audio => { audio.volume = 0.6; });
    chantMissRef.current.forEach(audio => { audio.volume = 0.6; });
  }, []);

  const totalAssigned = totalJobs(state.jobs);
  const maxTrimps = 10
    + (state.buildings.grasshut || 0) * 4
    + (state.buildings.timberhall || 0) * 6
    + (state.buildings.longhouse || 0) * 8
    + (state.buildings.stonekeep || 0) * 10;
  const visibleItems = getVisibleItems(BUILDINGS, UPGRADES, state);
  const buildingGroups = groupBuildings(visibleItems);
  const zoneName = `Fracture ${state.world.zone}`;
  const zoneProgress = getZoneProgress(state);
  const blocker = state.clansfolk.army <= 0 ? 'Blocked by No Warband' : 'Blocked by Hostile';
  const forecast = getCombatForecast(state, army);
  const combatTimes = getCombatTimes(state, army);
  const cycleName = 'The Turning';
  const cycleTime = formatTime(state.time);
  const modifiers = getWorldModifiers(state);
  const forecasts = getForecasts(state, caps, rates);
  const milestones = getMilestones(state);
  const scene = getCombatScene(state, zoneProgress);
  const enemyAtk = state.world.enemyAtk;
  const resourceOrder = ['food', 'wood', 'stone', 'metal', 'knowledge', 'ash'];
  const runeDefs = [
    { id: 'ember', name: 'Ember Rune', desc: '+2% production per rune', cost: { remnants: 2 } },
    { id: 'frost', name: 'Frost Rune', desc: '+1% warband atk per rune', cost: { remnants: 3 } }
  ];

  function pushLog(line) {
    setState(prev => ({ ...prev, log: [line, ...prev.log].slice(0, 40) }));
  }

  /**
   * Adjust assigned workers for a job.
   * @param {string} job
   * @param {number} delta
   */
  function assign(job, delta) {
    setState(prev => {
      const next = { ...prev, jobs: { ...prev.jobs }, clansfolk: { ...prev.clansfolk } };
      const value = Number.isFinite(delta) ? delta : 0;
      if (value > 0) {
        let add = Math.min(value, next.clansfolk.idle);
        if (job === 'drillmaster') {
          const cap = Math.max(0, next.clansfolk.maxArmy || 0);
          const availableSlots = Math.max(0, cap - (next.jobs.drillmaster || 0));
          add = Math.min(add, availableSlots);
        }
        if (add <= 0) return prev;
        next.jobs[job] += add;
        next.clansfolk.idle = Math.max(0, next.clansfolk.idle - add);
      } else if (value < 0) {
        const remove = Math.min(Math.abs(value), next.jobs[job]);
        if (remove <= 0) return prev;
        next.jobs[job] -= remove;
        next.clansfolk.idle += remove;
      } else {
        return prev;
      }
      if (next.clansfolk.army > 0) {
        const stats = getArmyStats(next);
        const ratio = next.clansfolk.armyHPMax > 0 ? next.clansfolk.armyHP / next.clansfolk.armyHPMax : 1;
        next.clansfolk.armyHPMax = stats.hp;
        next.clansfolk.armyHP = Math.min(stats.hp, Math.max(0, stats.hp * ratio));
      }
      return next;
    });
  }

  /**
   * Build a building or buy an upgrade.
   * @param {string} type
   */
  function build(type) {
    const config = BUILDINGS[type] || UPGRADES[type];
    setState(prev => {
      const isUpgrade = Boolean(UPGRADES[type]);
      if (!hasRequirements(prev, config.requires)) return prev;
      if (config.requiresZone && prev.world.zone < config.requiresZone) return prev;
      const owned = isUpgrade ? (prev.upgrades[type] || 0) : (prev.buildings[type] || 0);
      const scaledCost = getScaledCost(config.cost, owned, getScale(isUpgrade, config.group));
      if (!canAfford(prev, scaledCost)) return prev;
      if (isUpgrade && config.group === 'Innovation' && owned > 0) return prev;
      const next = {
        ...prev,
        buildings: { ...prev.buildings },
        upgrades: { ...prev.upgrades },
        resources: applyCost(prev, scaledCost)
      };
      if (isUpgrade) {
        if (type === 'stoneworking') {
          next.unlocks = { ...next.unlocks, stone: true };
          next.upgrades[type] = 1;
          pushLog('Stone can now be gathered.');
        } else if (type === 'mining') {
          next.unlocks = { ...next.unlocks, metal: true };
          next.upgrades[type] = 1;
          pushLog('Metal can now be gathered.');
        } else if (type === 'ashgathering') {
          next.unlocks = { ...next.unlocks, ash: true };
          next.upgrades[type] = 1;
          pushLog('Ash can now be gathered.');
        } else if (type === 'lorekeeping') {
          next.unlocks = { ...next.unlocks, knowledge: true };
          next.upgrades[type] = 1;
          pushLog('Knowledge can now be stored.');
        } else if (type === 'skaldtraining') {
          next.unlocks = { ...next.unlocks, lorekeepers: true };
          next.upgrades[type] = 1;
          pushLog('Lorekeepers can now be assigned.');
        } else if (type === 'blacksmithing') {
          next.unlocks = { ...next.unlocks, blacksmith: true };
          next.upgrades[type] = 1;
          pushLog('The blacksmith is now operational.');
        } else if (type === 'armory1') {
          next.unlocks = { ...next.unlocks, weaponTier2: true };
          next.upgrades[type] = 1;
          pushLog('Reinforced blacksmith gear unlocked.');
        } else if (type === 'armory2') {
          next.unlocks = { ...next.unlocks, weaponTier3: true };
          next.upgrades[type] = 1;
          pushLog('Iron blacksmith gear unlocked.');
        } else {
          const nextLevel = config.group === 'Innovation' ? 1 : (next.upgrades[type] || 0) + 1;
          next.upgrades[type] = nextLevel;
          pushLog(`${config.name} ${config.group === 'Innovation' ? 'acquired' : 'upgraded'}.`);
        }
      } else {
        next.buildings[type] += 1;
        pushLog(`${config.name} constructed.`);
      }
      if (next.clansfolk.army > 0) {
        const stats = getArmyStats(next);
        const ratio = next.clansfolk.armyHPMax > 0 ? next.clansfolk.armyHP / next.clansfolk.armyHPMax : 1;
        next.clansfolk.armyHPMax = stats.hp;
        next.clansfolk.armyHP = Math.min(stats.hp, Math.max(0, stats.hp * ratio));
      }
      return next;
    });
  }

  /**
   * Choose a patron for the rites system.
   * @param {string} id
   */
  function choosePatron(id) {
    const config = PATRONS.find(entry => entry.id === id);
    if (!config) return;
    setState(prev => {
      if (!prev.unlocks.ash) return prev;
      return {
        ...prev,
        ui: { ...prev.ui, selectedPatron: id }
      };
    });
  }

  function devotePatron() {
    setState(prev => {
      const selected = prev.ui?.selectedPatron;
      if (!selected) return prev;
      if (prev.religion?.patron === selected) return prev;
      const config = PATRONS.find(entry => entry.id === selected);
      if (!config) return prev;
      if (!canAfford(prev, config.cost)) return prev;
      return {
        ...prev,
        resources: applyCost(prev, config.cost),
        religion: { ...prev.religion, patron: selected, buildings: { ...prev.religion.buildings } }
      };
    });
  }

  /**
   * Build a rites structure.
   * @param {string} id
   */
  function buildRite(id) {
    const config = RITES_BUILDINGS[id];
    if (!config) return;
    setState(prev => {
      if (!prev.unlocks.ash) return prev;
      if (!prev.religion?.patron) return prev;
      const owned = prev.religion?.buildings?.[id] || 0;
      const scaledCost = getScaledCost(config.cost, owned, config.scale || 1.2);
      if (!canAfford(prev, scaledCost)) return prev;
      return {
        ...prev,
        resources: applyCost(prev, scaledCost),
        religion: {
          ...prev.religion,
          buildings: { ...prev.religion.buildings, [id]: owned + 1 }
        }
      };
    });
  }

  /**
   * Start a patron ritual session.
   */
  function startRitual() {
    setState(prev => {
      if (!prev.religion?.patron) return prev;
      if (prev.religion?.ritual?.active) return prev;
      const patronId = prev.religion.patron;
      const shrine = prev.religion.buildings?.ashshrine || 0;
      const hymnhall = prev.religion.buildings?.hymnhall || 0;
      const base = patronId === 'storm'
        ? { duration: 60, required: 3, period: 2.4, bandCenter: 0.5, bandWidth: 0.12, arrows: 6, type: 'archery' }
        : patronId === 'veil'
          ? { duration: 90, required: 11, period: 3.4, bandCenter: 0.35, bandWidth: 0.14, arrows: 0, type: 'chant' }
          : { duration: 80, required: 10, period: 4.2, bandCenter: 0.65, bandWidth: 0.18, arrows: 0, type: 'chant' };
      const earlyPenalty = Math.max(0, 3 - (prev.religion?.buildings?.hymnhall || 0)) * 0.02;
      const bandWidth = Math.max(0.06, Math.min(0.45, base.bandWidth - earlyPenalty + shrine * 0.02));
      const requiredBase = base.required + Math.max(0, 3 - (prev.religion?.buildings?.ashshrine || 0));
      const required = base.type === 'archery'
        ? 3
        : Math.max(4, Math.round(requiredBase * Math.max(0.6, 1 - hymnhall * 0.05)));
      const period = Math.max(1.4, base.period * Math.max(0.6, 1 - hymnhall * 0.03));
      pushLog(base.type === 'archery'
        ? 'Ritual started. Throw spears when the target crosses the reticle.'
        : 'Ritual started. Keep the chant within the omen band.');
      return {
        ...prev,
        religion: {
          ...prev.religion,
          ritual: {
            active: true,
            type: base.type,
            patron: patronId,
            timeLeft: base.duration,
            duration: base.duration,
            required,
            hits: 0,
            misses: 0,
            period,
            bandCenter: base.bandCenter,
            bandWidth,
            startTime: performance.now() / 1000,
            arrowsLeft: base.arrows,
            totalArrows: base.arrows,
            lastResult: '',
            speedTier: 0,
            narrowTier: 0
          }
        }
      };
    });
  }

  /**
   * Chant during a ritual and register a hit/miss.
   */
  function chantRitual() {
    setState(prev => {
      const ritual = prev.religion?.ritual;
      if (!ritual?.active || ritual.type !== 'chant') return prev;
      const meter = getRitualMeter(performance.now() / 1000, ritual);
      const grace = 0.02;
      const halfWidth = ritual.bandWidth / 2 + grace;
      const inBand = meter >= ritual.bandCenter - halfWidth && meter <= ritual.bandCenter + halfWidth;
      playChantSfx(inBand);
      const nextHits = Math.max(0, ritual.hits + (inBand ? 1 : -1));
      const nextMisses = ritual.misses + (inBand ? 0 : 1);
      const nextBandCenter = inBand ? 0.08 + Math.random() * 0.84 : ritual.bandCenter;
      let nextPeriod = ritual.period;
      let nextBandWidth = ritual.bandWidth;
      let nextSpeedTier = ritual.speedTier || 0;
      let nextNarrowTier = ritual.narrowTier || 0;
      if (inBand && nextHits >= 4 && nextSpeedTier === 0) {
        nextSpeedTier = 1;
        nextPeriod = Math.max(1.2, ritual.period * 0.85);
      }
      if (inBand && nextHits >= 8 && nextNarrowTier === 0) {
        nextNarrowTier = 1;
        nextBandWidth = Math.max(0.05, ritual.bandWidth * 0.55);
      }
      if (inBand && nextHits >= ritual.required) {
        return finishRitual(prev, ritual, true, 'Ritual succeeded. The patron answers your call.');
      }
      return {
        ...prev,
        religion: {
          ...prev.religion,
          ritual: {
            ...ritual,
            hits: nextHits,
            misses: nextMisses,
            lastResult: inBand ? 'Hit' : 'Miss',
            bandCenter: nextBandCenter,
            period: nextPeriod,
            bandWidth: nextBandWidth,
            speedTier: nextSpeedTier,
            narrowTier: nextNarrowTier
          }
        }
      };
    });
  }

  function shootRitual() {
    setState(prev => {
      const ritual = prev.religion?.ritual;
      if (!ritual?.active || ritual.type !== 'archery') return prev;
      if (ritual.arrowsLeft <= 0) return prev;
      const meter = getRitualMeter(performance.now() / 1000, ritual);
      const grace = 0.02;
      const halfWidth = ritual.bandWidth / 2 + grace;
      const inBand = Math.abs(meter - 0.5) <= halfWidth;
      const nextHits = Math.max(0, ritual.hits + (inBand ? 1 : -1));
      const nextMisses = ritual.misses + (inBand ? 0 : 1);
      const nextArrows = ritual.arrowsLeft - 1;
      if (inBand && nextHits >= ritual.required) {
        return finishRitual(prev, ritual, true, 'Ritual succeeded. The storm roars back.');
      }
      if (nextArrows <= 0 && nextHits < ritual.required) {
        return finishRitual(prev, ritual, false, 'Ritual failed. The storm passes unanswered.');
      }
      return {
        ...prev,
        religion: {
          ...prev.religion,
          ritual: {
            ...ritual,
            hits: nextHits,
            misses: nextMisses,
            arrowsLeft: nextArrows,
            lastResult: inBand ? 'Hit' : 'Miss'
          }
        }
      };
    });
  }

  function finishRitual(prev, ritual, success, message) {
    const emberBonus = (prev.religion.buildings?.embercairn || 0) * 60;
    if (success) {
      pushLog(message);
      return {
        ...prev,
        religion: {
          ...prev.religion,
          blessing: {
            patron: ritual.patron,
            expiresAt: prev.time + 20 * 60 + emberBonus
          },
          ritual: {
            ...ritual,
            active: false,
            timeLeft: 0,
            duration: 0,
            lastResult: 'Hit'
          }
        }
      };
    }
    pushLog(message);
    return {
      ...prev,
      religion: {
        ...prev.religion,
        ritual: {
          ...ritual,
          active: false,
          timeLeft: 0,
          duration: 0
        }
      }
    };
  }

  /**
   * Craft a blacksmith item and add to inventory.
   * @param {string} id
   */
  function craftItem(id, amount = 1) {
    const item = blacksmithItems.find(entry => entry.id === id);
    if (!item) return;
    setState(prev => {
      const target = amount === 'max' ? Infinity : Math.max(1, amount);
      let crafted = 0;
      const next = {
        ...prev,
        resources: { ...prev.resources },
        inventory: { ...prev.inventory }
      };
      while (crafted < target && canAfford(next, item.cost)) {
        next.resources = applyCost(next, item.cost);
        next.inventory[id] = (next.inventory[id] || 0) + 1;
        crafted += 1;
      }
      if (crafted <= 0) return prev;
      pushLog(`${item.name} crafted x${crafted}.`);
      return next;
    });
  }

  /**
   * Equip or unequip an item for the warband.
   * @param {string} id
   * @param {number} delta
   */
  function adjustEquip(id, delta) {
    setState(prev => {
      const next = {
        ...prev,
        inventory: { ...prev.inventory },
        equipment: { ...prev.equipment },
        clansfolk: { ...prev.clansfolk }
      };
      const capacity = Math.max(0, next.clansfolk.army || 0);
      const current = next.equipment[id] || 0;
      const item = BLACKSMITH_ITEMS[id];
      if (!item) return prev;
      const slotEquipped = Object.entries(next.equipment).reduce((sum, [equipId, count]) => {
        const equipItem = BLACKSMITH_ITEMS[equipId];
        if (!equipItem || equipItem.slot !== item.slot) return sum;
        return sum + count;
      }, 0);
      if (delta > 0) {
        const available = next.inventory[id] || 0;
        const maxEquip = Math.max(0, capacity - slotEquipped);
        const add = Math.min(delta, available, maxEquip);
        if (add <= 0) return prev;
        next.inventory[id] = available - add;
        next.equipment[id] = current + add;
      } else if (delta < 0) {
        const remove = Math.min(Math.abs(delta), current);
        if (remove <= 0) return prev;
        next.inventory[id] = (next.inventory[id] || 0) + remove;
        next.equipment[id] = current - remove;
      } else {
        return prev;
      }
      if (next.clansfolk.army > 0) {
        const stats = getArmyStats(next);
        const ratio = next.clansfolk.armyHPMax > 0 ? next.clansfolk.armyHP / next.clansfolk.armyHPMax : 1;
        next.clansfolk.armyHPMax = stats.hp;
        next.clansfolk.armyHP = Math.min(stats.hp, Math.max(0, stats.hp * ratio));
      }
      return next;
    });
  }

  /**
   * Auto-equip items up to the current warband size.
   */
  function autoEquip() {
    setState(prev => {
      const next = {
        ...prev,
        inventory: { ...prev.inventory },
        equipment: { ...prev.equipment },
        clansfolk: { ...prev.clansfolk }
      };
      const capacity = Math.max(0, next.clansfolk.army || 0);
      const slots = ['weapon', 'shield', 'armor'];
      slots.forEach(slot => {
        const slotItems = blacksmithItems
          .filter(item => item.slot === slot)
          .sort((a, b) => ((b.atk || 0) + (b.hp || 0)) - ((a.atk || 0) + (a.hp || 0)));
        let remaining = capacity;
        slotItems.forEach(item => {
          const owned = (next.inventory[item.id] || 0) + (next.equipment[item.id] || 0);
          const equipCount = Math.min(remaining, owned);
          next.equipment[item.id] = equipCount;
          next.inventory[item.id] = owned - equipCount;
          remaining -= equipCount;
        });
      });
      if (next.clansfolk.army > 0) {
        const stats = getArmyStats(next);
        const ratio = next.clansfolk.armyHPMax > 0 ? next.clansfolk.armyHP / next.clansfolk.armyHPMax : 1;
        next.clansfolk.armyHPMax = stats.hp;
        next.clansfolk.armyHP = Math.min(stats.hp, Math.max(0, stats.hp * ratio));
      }
      return next;
    });
  }

  /**
   * Apply a selected item to all warband members for a slot.
   * @param {string} slot
   * @param {string|null} itemId
   */
  function applyEquipSlot(slot, itemId) {
    setState(prev => {
      const next = {
        ...prev,
        inventory: { ...prev.inventory },
        equipment: { ...prev.equipment },
        clansfolk: { ...prev.clansfolk },
        ui: { ...prev.ui, equipChoice: { ...(prev.ui?.equipChoice || {}) } }
      };
      const capacity = Math.max(0, next.clansfolk.maxArmy || 0);
      const slotItems = blacksmithItems.filter(item => item.slot === slot);
      slotItems.forEach(item => {
        const equipped = next.equipment[item.id] || 0;
        if (equipped > 0) {
          next.inventory[item.id] = (next.inventory[item.id] || 0) + equipped;
          next.equipment[item.id] = 0;
        }
      });
      if (itemId) {
        const item = BLACKSMITH_ITEMS[itemId];
        if (!item || item.slot !== slot) return prev;
        const available = next.inventory[itemId] || 0;
        const equipCount = Math.min(capacity, available);
        next.inventory[itemId] = available - equipCount;
        next.equipment[itemId] = equipCount;
      }
      next.ui.equipChoice[slot] = itemId || '';
      if (next.clansfolk.army > 0) {
        const stats = getArmyStats(next);
        const ratio = next.clansfolk.armyHPMax > 0 ? next.clansfolk.armyHP / next.clansfolk.armyHPMax : 1;
        next.clansfolk.armyHPMax = stats.hp;
        next.clansfolk.armyHP = Math.min(stats.hp, Math.max(0, stats.hp * ratio));
      }
      return next;
    });
  }

  /**
   * Apply all selected slot choices at once.
   */
  function applyEquipAll() {
    setState(prev => {
      const choices = prev.ui?.equipChoice || {};
      let next = prev;
      const capacity = Math.max(0, prev.clansfolk.army || 0);
      equipSlots.forEach(slot => {
        next = {
          ...next,
          inventory: { ...next.inventory },
          equipment: { ...next.equipment },
          clansfolk: { ...next.clansfolk },
          ui: { ...next.ui }
        };
        const itemId = choices[slot.id] || '';
        const slotItems = blacksmithItems.filter(item => item.slot === slot.id);
        slotItems.forEach(item => {
          const equipped = next.equipment[item.id] || 0;
          if (equipped > 0) {
            next.inventory[item.id] = (next.inventory[item.id] || 0) + equipped;
            next.equipment[item.id] = 0;
          }
        });
        if (itemId) {
          const item = BLACKSMITH_ITEMS[itemId];
          if (item && item.slot === slot.id) {
            const available = next.inventory[itemId] || 0;
            const equipCount = Math.min(capacity, available);
            next.inventory[itemId] = available - equipCount;
            next.equipment[itemId] = equipCount;
          }
        }
      });
      if (next.clansfolk.army > 0) {
        const stats = getArmyStats(next);
        const ratio = next.clansfolk.armyHPMax > 0 ? next.clansfolk.armyHP / next.clansfolk.armyHPMax : 1;
        next.clansfolk.armyHPMax = stats.hp;
        next.clansfolk.armyHP = Math.min(stats.hp, Math.max(0, stats.hp * ratio));
      }
      return next;
    });
  }

  /**
   * Equip a full tier across all slots.
   * @param {string[]} itemIds
   */
  function applyEquipTier(itemIds) {
    setState(prev => {
      const next = {
        ...prev,
        inventory: { ...prev.inventory },
        equipment: { ...prev.equipment },
        clansfolk: { ...prev.clansfolk }
      };
      const capacity = Math.max(0, next.clansfolk.army || 0);
      itemIds.forEach(itemId => {
        const item = BLACKSMITH_ITEMS[itemId];
        if (!item) return;
        const slotItems = blacksmithItems.filter(entry => entry.slot === item.slot);
        slotItems.forEach(entry => {
          const equipped = next.equipment[entry.id] || 0;
          if (equipped > 0) {
            next.inventory[entry.id] = (next.inventory[entry.id] || 0) + equipped;
            next.equipment[entry.id] = 0;
          }
        });
        const available = next.inventory[itemId] || 0;
        const equipCount = Math.min(capacity, available);
        next.inventory[itemId] = available - equipCount;
        next.equipment[itemId] = equipCount;
      });
      if (next.clansfolk.army > 0) {
        const stats = getArmyStats(next);
        const ratio = next.clansfolk.armyHPMax > 0 ? next.clansfolk.armyHP / next.clansfolk.armyHPMax : 1;
        next.clansfolk.armyHPMax = stats.hp;
        next.clansfolk.armyHP = Math.min(stats.hp, Math.max(0, stats.hp * ratio));
      }
      return next;
    });
  }

  /**
   * Start combat if a warband exists.
   */
  function startFight() {
    setState(prev => {
      if (prev.clansfolk.army <= 0) return prev;
      return { ...prev, world: { ...prev.world, fighting: true } };
    });
  }

  /**
   * Stop combat without changing warband.
   */
  function stopFight() {
    setState(prev => ({ ...prev, world: { ...prev.world, fighting: false } }));
  }

  /**
   * Send idle clansfolk into the warband.
   */
  function sendArmy() {
    setState(prev => {
      const next = { ...prev, clansfolk: { ...prev.clansfolk }, equipment: { ...prev.equipment }, inventory: { ...prev.inventory } };
      if (next.clansfolk.idle <= 0) return prev;
      const space = next.clansfolk.maxArmy - next.clansfolk.army;
      if (space <= 0) return prev;
      const reserve = 2;
      const available = Math.max(0, next.clansfolk.total - reserve);
      const requested = Math.max(1, Math.floor(prev.ui?.warbandSend || 1));
      const add = Math.min(space, next.clansfolk.idle, available, requested);
      if (add <= 0) return prev;
      next.clansfolk.army += add;
      next.clansfolk.total = Math.max(0, next.clansfolk.total - add);
      next.clansfolk.idle = Math.max(0, next.clansfolk.total - totalJobs(next.jobs));
      Object.keys(next.equipment).forEach(key => {
        if (next.equipment[key] > next.clansfolk.army) {
          const excess = next.equipment[key] - next.clansfolk.army;
          next.equipment[key] = next.clansfolk.army;
          next.inventory[key] = (next.inventory[key] || 0) + excess;
        }
      });
      const stats = getArmyStats(next);
      next.clansfolk.armyHPMax = stats.hp;
      next.clansfolk.armyHP = stats.hp;
      return next;
    });
  }

  /**
   * Recall the warband back into clansfolk total.
   */
  function recallArmy() {
    setState(prev => {
      const next = { ...prev, clansfolk: { ...prev.clansfolk }, equipment: { ...prev.equipment }, inventory: { ...prev.inventory } };
      if (next.clansfolk.army <= 0) return prev;
      next.clansfolk.total += next.clansfolk.army;
      next.clansfolk.idle = Math.max(0, next.clansfolk.total - totalJobs(next.jobs));
      next.clansfolk.army = 0;
      next.clansfolk.armyHP = 0;
      next.clansfolk.armyHPMax = 0;
      Object.keys(next.equipment).forEach(key => {
        if (next.equipment[key] > 0) {
          next.inventory[key] = (next.inventory[key] || 0) + next.equipment[key];
          next.equipment[key] = 0;
        }
      });
      return next;
    });
  }

  /**
   * Reset the run and grant remnants based on zone.
   */
  function prestige() {
    if (state.world.zone < 10) return;
    const remnantsGain = Math.floor(state.world.zone / 5);
    const newRemnants = state.perks.remnants + remnantsGain;
    const prodMult = 1 + newRemnants * 0.03;
    const atkMult = 1 + newRemnants * 0.02;
    setState({
      ...START_STATE,
      perks: { remnants: newRemnants, prodMult, atkMult },
      log: [`Ascended for ${remnantsGain} remnants. Production +${Math.round((prodMult - 1) * 100)}%.`]
    });
  }

  function craftRune(id) {
    const rune = runeDefs.find(r => r.id === id);
    if (!rune) return;
    setState(prev => {
      if (prev.perks.remnants < rune.cost.remnants) return prev;
      const next = {
        ...prev,
        runes: { ...prev.runes },
        perks: { ...prev.perks }
      };
      next.perks.remnants -= rune.cost.remnants;
      next.runes[id] = (next.runes[id] || 0) + 1;
      pushLog(`${rune.name} carved.`);
      return next;
    });
  }

  /**
   * Show a tooltip near a target rect.
   * @param {string} text
   * @param {DOMRect} rect
   */
  function showTooltip(text, rect) {
    const padding = 12;
    const width = 520;
    const left = Math.min(window.innerWidth - width - padding, rect.right + padding);
    const top = Math.min(window.innerHeight - 80, rect.top);
    setTooltip({ text, left: Math.max(padding, left), top: Math.max(padding, top), width });
  }

  /**
   * Clear any active tooltip.
   */
  function hideTooltip() {
    setTooltip(null);
  }

  /**
   * Clear saved data and reload.
   */
  function hardRestart() {
    localStorage.removeItem(SAVE_KEY);
    window.location.reload();
  }

  /**
   * Toggle tutorial guidance on/off.
   */
  function toggleTutorial() {
    setState(prev => ({
      ...prev,
      tutorial: { ...prev.tutorial, enabled: !prev.tutorial.enabled }
    }));
  }

  /**
   * Toggle dev mode (show all items).
   */
  function toggleDevMode() {
    setState(prev => ({
      ...prev,
      dev: { ...prev.dev, showAll: !prev.dev.showAll }
    }));
  }

  /**
   * Load a preset stage for testing.
   * @param {number} stage
   */
  function setStage(stage) {
    const stageState = getStageState(stage);
    localStorage.setItem(SAVE_KEY, JSON.stringify(stageState));
    window.location.reload();
  }

  function playChantSfx(hit) {
    const bank = hit ? chantHitRef.current : chantMissRef.current;
    if (!bank || bank.length === 0) return;
    const pick = bank[Math.floor(Math.random() * bank.length)];
    if (!pick) return;
    pick.currentTime = 0;
    pick.play().catch(() => {});
  }

  return (
    <>
      <header>
        <div className="header-left">
          <div>
            <h1>Clansfolk Prototype</h1>
            <div className="meta">Zone {state.world.zone} · Remnants {state.perks.remnants} · {Math.floor(state.time)}s</div>
          </div>
          <div className="header-resources">
            {Object.entries(state.resources)
              .filter(([key]) => isResourceUnlocked(state, key))
              .map(([key, value]) => (
                <span key={key} className="resource-chip">
                  {key.toUpperCase()} {formatShort(value)}
                </span>
              ))}
          </div>
          <div className="header-tabs">
            {tabs.filter(tab => !tab.requires || tab.requires()).map(tab => (
              <button
                key={tab.id}
                className={`header-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setState(prev => ({
                  ...prev,
                  ui: { ...prev.ui, tab: tab.id }
                }))}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span className="chip">Prod x{state.perks.prodMult.toFixed(2)}</span>
          <button className="warn" onClick={prestige} disabled={state.world.zone < 10}>Ascend</button>
          <details className="settings-menu">
            <summary>Settings</summary>
            <div className="settings-panel">
              <button className="danger" onClick={hardRestart}>Hard Restart</button>
              <button className="ghost" onClick={() => setStage(1)}>Load Stage 1</button>
              <button className="ghost" onClick={() => setStage(2)}>Load Stage 2</button>
              <button className="ghost" onClick={() => setStage(3)}>Load Stage 3</button>
              <button
                className="ghost"
                onClick={() => setState(prev => ({
                  ...prev,
                  resources: { ...prev.resources, ash: (prev.resources.ash || 0) + 200 }
                }))}
              >
                Dev: +200 Ash
              </button>
              <button className="ghost" onClick={toggleTutorial}>
                {state.tutorial.enabled ? 'Disable Tutorial' : 'Enable Tutorial'}
              </button>
              <button className="ghost" onClick={toggleDevMode}>
                {state.dev.showAll ? 'Disable Dev Mode' : 'Enable Dev Mode'}
              </button>
            </div>
          </details>
        </div>
      </header>
      <div className="shell">
        <div className="left-column">
          <section className="panel section">
            <h2>Resources</h2>
            <div className="resource-list">
              {resourceOrder
                .filter((key) => isResourceUnlocked(state, key))
                .map((key) => {
                const value = state.resources[key] || 0;
                const baseStorage = getBaseStorage(state, key);
                const storehouseLevel = state.buildings.storehouse || 0;
                const storehousePercent = storehouseLevel * 50;
                const rate = rates[key] || 0;
                const isCapped = value >= caps[key];
                const waste = Math.max(0, rate);
                const isLeaderTask = state.ui.leaderTask === key;
                const leaderLabel = isLeaderTask ? ' (Leader +2/s)' : '';
                return (
                  <div key={key} className={`resource-card ${isCapped ? 'capped' : ''}`}>
                    <div className="resource-row">
                      <strong>{key.toUpperCase()}</strong>
                      <strong className="resource-cap">{formatShort(value)} / {formatShort(caps[key])} storage</strong>
                    </div>
                    <div className="resource-row meta">
                      <span className={isCapped ? 'waste' : ''}>
                        {isCapped ? `Waste ${waste.toFixed(2)} /s` : `+${rate.toFixed(2)} /s${leaderLabel}`}
                      </span>
                      <span className="storage-meta"></span>
                      {key !== 'ash' && (
                        <button
                          className={`mini ${isLeaderTask ? 'selected' : ''}`}
                          onClick={() => setState(prev => ({
                            ...prev,
                            ui: { ...prev.ui, leaderTask: isLeaderTask ? null : key }
                          }))}
                        >
                          {isLeaderTask ? 'Leading' : 'Lead'}
                        </button>
                      )}
                    </div>
                    <div className="resource-bar">
                      <div style={{ width: `${Math.min(100, (value / Math.max(1, caps[key])) * 100)}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="panel section">
            <h2>Clansfolk & Jobs</h2>
            <div className="population-summary">
              <div className="pop-row">
                <span>Total</span>
                <strong>{Math.floor(state.clansfolk.total)} / {maxTrimps}</strong>
              </div>
              <div className="pop-row">
                <span>Idle</span>
                <strong className={state.clansfolk.idle < 1 ? 'scarce' : ''}>{Math.floor(state.clansfolk.idle)}</strong>
              </div>
              <div className="pop-row">
                <span>Assigned</span>
                <strong>{Math.floor(totalAssigned)}</strong>
              </div>
            </div>
            <div className="assign-step">
              <span>Assign</span>
              <div className="assign-buttons">
                <button className={`mini ${assignStep === 1 ? 'selected' : ''}`} onClick={() => setAssignStep(1)}>x1</button>
                <button className={`mini ${assignStep === 5 ? 'selected' : ''}`} onClick={() => setAssignStep(5)}>x5</button>
                <button className={`mini ${assignStep === 10 ? 'selected' : ''}`} onClick={() => setAssignStep(10)}>x10</button>
                <button className={`mini ${assignStep === 'max' ? 'selected' : ''}`} onClick={() => setAssignStep('max')}>Max</button>
              </div>
            </div>
            <div className="growth-row">
              <span>Next Clansfolk</span>
              <span>{Math.round(state.clansfolk.growthProgress * 100)}%</span>
            </div>
            <div className="growth-bar">
              <div style={{ width: `${Math.min(100, state.clansfolk.growthProgress * 100)}%` }} />
            </div>
            <div className="jobs-list">
              {Object.entries(JOBS).map(([key, job]) => {
                const assigned = state.jobs[key];
                if (!isJobUnlocked(state, key)) return null;
                const drillCap = key === 'drillmaster' ? Math.max(0, state.clansfolk.maxArmy || 0) : null;
                return (
                  <div className="job-row" key={key}>
                    <div className="job-header">
                      <span>
                        {job.name} {assigned}
                        {key === 'drillmaster' && (
                          <span className="job-cap"> / {drillCap} warcamp limit</span>
                        )}
                      </span>
                      <div className="job-controls">
                        <button className="ghost mini" onClick={() => assign(key, assignStep === 'max' ? -assigned : -assignStep)} disabled={assigned < 1}>−</button>
                        <button
                          className="mini"
                          onClick={() => assign(key, assignStep === 'max' ? state.clansfolk.idle : assignStep)}
                          disabled={state.clansfolk.idle < 1}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="grid grid-2">
              <button className="secondary" onClick={sendArmy}>Send to Warband</button>
              <button className="ghost" onClick={recallArmy}>Recall</button>
            </div>
          </section>

          <section className="panel section">
            <h2>Buildings & Innovation</h2>
            <div className="buildings-list">
              {Object.entries(buildingGroups).map(([group, items]) => (
                <details className="build-group" key={group} open>
                  <summary>{group}</summary>
                  <div className="build-group-items">
                    {items.map(({ id, data }) => {
                      const isUpgrade = Boolean(UPGRADES[id]);
                      const owned = isUpgrade ? (state.upgrades[id] || 0) : (state.buildings[id] || 0);
                      const scaledCost = getScaledCost(data.cost, owned, getScale(isUpgrade, data.group, data));
                      const tintClass = !isUpgrade ? getBuildingTintClass(id) : '';
                      const costEntries = Object.entries(scaledCost);
                      const inlineCost = costEntries.map(([r, v]) => `${v} ${r}`).join(', ');
                      const stackCost = Boolean(data.icon) && (costEntries.length > 2 || inlineCost.length > 24);
                      const costLines = stackCost
                        ? id === 'skaldhall'
                          ? [
                            costEntries
                              .filter(([r]) => r === 'wood' || r === 'stone')
                              .map(([r, v]) => `${v} ${r}`)
                              .join(', '),
                            ...costEntries
                              .filter(([r]) => r !== 'wood' && r !== 'stone')
                              .map(([r, v]) => `${v} ${r}`)
                          ].filter(Boolean)
                          : costEntries.map(([r, v]) => `${v} ${r}`)
                        : [inlineCost];
                      return (
                      <div
                        className={`build-row ${tintClass} ${data.icon ? 'has-icon' : ''} ${stackCost ? 'icon-dense' : ''}`}
                        key={id}
                        style={data.icon ? { '--card-icon': `url(${data.icon})` } : undefined}
                      >
                        <div className="build-info">
                          <div className="item-title">
                            <strong>{data.name}</strong>
                          </div>
                          <div className={`cost cost-list ${stackCost ? 'stack' : ''}`}>
                            {costLines.map((line, idx) => (
                              <span key={`${id}-cost-${idx}`}>{line}</span>
                            ))}
                          </div>
                        </div>
                        <div className="build-actions">
                          <span className="owned">{isUpgrade ? 'Level' : 'Owned'} {owned}</span>
                          <span
                            className="tooltip-target"
                            onMouseEnter={(event) => showTooltip(
                              getItemTooltipText(data, id, owned, state),
                              event.currentTarget.getBoundingClientRect()
                            )}
                            onMouseLeave={hideTooltip}
                          >
                            <button
                              className="ghost mini"
                              onClick={() => build(id)}
                              disabled={!canAfford(state, scaledCost)}
                            >
                              {isUpgrade ? 'Upgrade' : 'Build'}
                            </button>
                          </span>
                        </div>
                      </div>
                    );
                    })}
                  </div>
                </details>
              ))}
            </div>
          </section>

          <section className="panel section locked">
            <h2>Automation</h2>
            <div className="locked-row">
              <span className="lock">Locked</span>
              <span>Automation unlocks after the first cycle.</span>
            </div>
          </section>
        </div>

        {activeTab === 'overview' ? (
        <>
          <div className="center-column">
          <section className="panel center-section world-header">
            <div className="zone-title">
              <div className="zone-name">{zoneName}</div>
              <div className="zone-number">Zone {state.world.zone}</div>
            </div>
            <div className="pressure-tags">
              <span className="pressure">Frost</span>
              <span className="pressure">Ash</span>
              <span className="pressure">Wind</span>
            </div>
          </section>

          <section className="panel center-section primary-progress">
            <div className="progress-title">Advance</div>
            <div className="progress-bar">
              <div style={{ width: `${Math.max(0, Math.min(100, zoneProgress * 100))}%` }} />
            </div>
            <div className="blocker">{blocker}</div>
            <div className="logistics-center-row">
              <span>Logistics Pressure</span>
              <strong>{Math.round((state.world.logisticsPressure || 0) * 100)}%</strong>
            </div>
          </section>

          <section className="panel center-section combat-summary">
            {state.buildings.warcamp > 0 && (
              <div className="warband-control">
                <div className="warband-label">Send to Warband</div>
                <div className="warband-meta">
                  {(() => {
                    const reserve = 2;
                    const available = Math.max(0, state.clansfolk.total - reserve);
                    const space = state.clansfolk.maxArmy - state.clansfolk.army;
                    const maxSend = Math.max(0, Math.min(state.clansfolk.idle, available, space));
                    const value = Math.max(1, Math.min(state.ui.warbandSend || 1, maxSend || 1));
                    return (
                      <>
                        <div className="warband-count">Sending {maxSend === 0 ? 0 : value} clansfolk</div>
                        <input
                          type="range"
                          min={1}
                          max={Math.max(1, maxSend)}
                          step={1}
                          value={maxSend === 0 ? 1 : value}
                          onChange={(event) => {
                            const nextValue = Math.max(1, Number(event.target.value || 1));
                            setState(prev => ({
                              ...prev,
                              ui: { ...prev.ui, warbandSend: nextValue }
                            }));
                          }}
                          disabled={maxSend <= 0}
                        />
                        <div className="warband-available">Available {maxSend} · Cap {state.clansfolk.maxArmy}</div>
                      </>
                    );
                  })()}
                </div>
              </div>
            )}
            <div className={`combat-scene ${state.world.fighting ? 'active' : ''}`} style={{ backgroundImage: `url(${scene})` }}>
              <div className={`combat-scene-overlay ${state.world.fighting ? 'active' : ''}`} />
              <div className="combat-scene-actors">
                <span className="fighter ally" />
                <span className="fighter ally delay" />
                <span className="fighter ally delay-2" />
                <span className="fighter enemy" />
              </div>
            </div>
            <div className="combat-row">
              <div className="combat-label">Enemy</div>
              <div className="combat-value">
                {Math.round(state.world.enemyHP)} / {state.world.enemyHPMax} · ATK {state.world.enemyAtk.toFixed(1)}
                <span className="enemy-count">Enemy {state.world.enemyIndex || 1} of {state.world.enemiesPerZone || 5}</span>
              </div>
            </div>
            <div className="combat-row sub">
              <div className="combat-label">Incoming</div>
              <div className="combat-value">
                {(() => {
                  const base = state.world.enemyAtk * 0.5 * 0.25;
                  const min = base * 0.85;
                  const max = base * 1.84;
                  return `${(min * 4).toFixed(1)} - ${(max * 4).toFixed(1)} dmg / s`;
                })()}
              </div>
            </div>
            <div className="combat-row sub">
              <div className="combat-label">Last Hit</div>
              <div className="combat-value">
                {state.world.lastEnemyHit ? `${(state.world.lastEnemyHit * 4).toFixed(1)} dmg / s` : '--'}
              </div>
            </div>
            <div className="bar enemy">
              <div style={{ width: `${(state.world.enemyHP / state.world.enemyHPMax) * 100}%` }} />
            </div>

            <div className="combat-row">
              <div className="combat-label">Warband</div>
              <div className="combat-value">{state.clansfolk.armyHP.toFixed(1)} / {state.clansfolk.armyHPMax.toFixed(1)} HP · {army.atk.toFixed(1)} ATK</div>
            </div>
            <div className="combat-row sub">
              <div className="combat-label">Outgoing</div>
              <div className="combat-value">
                {(() => {
                  const stance = state.ui?.combatStance || 'balanced';
                  const stanceRange = stance === 'aggressive'
                    ? { min: 0.2, max: 0.8 }
                    : stance === 'defensive'
                      ? { min: 0.4, max: 0.5 }
                      : { min: 0.3, max: 0.6 };
                  const base = army.atk * 0.6 * 0.25;
                  const min = base * stanceRange.min;
                  const max = base * stanceRange.max;
                  return `${(min * 4).toFixed(1)} - ${(max * 4).toFixed(1)} dmg / s`;
                })()}
              </div>
            </div>
            <div className="combat-row sub">
              <div className="combat-label">Last Hit</div>
              <div className="combat-value">
                {state.world.lastWarbandHit ? `${(state.world.lastWarbandHit * 4).toFixed(1)} dmg / s` : '--'}
              </div>
            </div>
            <div className="bar">
              <div style={{ width: `${Math.min(100, (state.clansfolk.armyHP / Math.max(1, state.clansfolk.armyHPMax)) * 100)}%` }} />
            </div>

            <div className={`forecast ${forecast.tone}`}>{forecast.text}</div>
            <div className="combat-times">
              <span>TTK {combatTimes.ttk}s</span>
              <span>TTL {combatTimes.ttl}s</span>
            </div>
            <div className={`combat-outcome ${combatTimes.outcomeTone}`}>{combatTimes.outcomeText}</div>
            <div className="combat-actions">
              <button onClick={startFight} disabled={state.world.fighting || state.clansfolk.army <= 0}>Fight</button>
              <button className="secondary" onClick={() => pushLog('Scouted the zone.')}>Scout</button>
              <button className="ghost" onClick={stopFight} disabled={!state.world.fighting}>Retreat</button>
            </div>
            <div className="combat-stance">
              {['aggressive', 'balanced', 'defensive'].map(stance => (
                <button
                  key={stance}
                  className={`mini ${state.ui.combatStance === stance ? 'selected' : ''}`}
                  onClick={() => setState(prev => {
                    const next = {
                      ...prev,
                      ui: { ...prev.ui, combatStance: stance },
                      clansfolk: { ...prev.clansfolk }
                    };
                    if (next.clansfolk.army > 0) {
                      const stats = getArmyStats(next);
                      const ratio = next.clansfolk.armyHPMax > 0 ? next.clansfolk.armyHP / next.clansfolk.armyHPMax : 1;
                      next.clansfolk.armyHPMax = stats.hp;
                      next.clansfolk.armyHP = Math.min(stats.hp, Math.max(0, stats.hp * ratio));
                    }
                    return next;
                  })}
                >
                  {stance}
                </button>
              ))}
            </div>
          </section>

          <section className="panel center-section prestige-awareness">
            <div className="cycle-row">
              <div>
                <div className="cycle-title">{cycleName}</div>
                <div className="cycle-time">Cycle Time {cycleTime}</div>
              </div>
              <div className="prestige-actions">
                <button className="warn" onClick={prestige} disabled={state.world.zone < 10}>Ascend</button>
              </div>
            </div>
          </section>
        </div>

          <div className="right-column">
          <section className="panel section">
            <h2>World Modifiers</h2>
            <div className="mod-group">
              <div className="mod-title">Production</div>
              {modifiers.production.map(item => (
                <div className="mod-row" key={item.label}>
                  <span>{item.label}</span>
                  <span className="mod-value">{item.value}</span>
                </div>
              ))}
            </div>
            <div className="mod-group">
              <div className="mod-title">Combat</div>
              {modifiers.combat.map(item => (
                <div className="mod-row" key={item.label}>
                  <span>{item.label}</span>
                  <span className="mod-value">{item.value}</span>
                </div>
              ))}
            </div>
            <div className="mod-group">
              <div className="mod-title">Environment</div>
              {modifiers.environment.map(item => (
                <div className="mod-row" key={item.label}>
                  <span>{item.label}</span>
                  <span className="mod-value">{item.value}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="panel section">
            <h2>Forecasts & Warnings</h2>
            <div className="forecast-list">
              {forecasts.length === 0 && (
                <div className="forecast-item neutral">No immediate pressure detected.</div>
              )}
              {forecasts.map(item => (
                <div className={`forecast-item ${item.tone}`} key={item.text}>{item.text}</div>
              ))}
            </div>
          </section>

          <section className="panel section">
            <h2>{state.tutorial.enabled ? 'Guided Steps' : 'Next Steps'}</h2>
            <div className="milestone-list">
              {milestones.map(item => (
                <div key={item.text} className="milestone">
                  <span>{item.text}</span>
                  <span>Next</span>
                </div>
              ))}
              {milestones.length === 0 && (
                <div className="milestone">All early steps completed.</div>
              )}
            </div>
          </section>

          <section className="panel section">
            <h2>Meta Progression</h2>
            <div className="meta-row">
              <span>Remnants</span>
              <strong>{state.perks.remnants}</strong>
            </div>
            <div className="meta-row">
              <span>Runes</span>
              <strong>{(state.runes.ember || 0) + (state.runes.frost || 0)}</strong>
            </div>
            <div className="meta-row">
              <span>Next Memory</span>
              <strong>{Math.max(0, 10 - state.world.zone)} zones</strong>
            </div>
            <div className="meta-effects">
              <div className="meta-title">Active Effects</div>
              <div className="meta-effect">Production x{state.perks.prodMult.toFixed(2)}</div>
              <div className="meta-effect">Attack x{state.perks.atkMult.toFixed(2)}</div>
            </div>
          </section>

          {state.perks.remnants > 0 && (
            <section className="panel section">
              <h2>Ascension Runes</h2>
              <div className="buildings-list">
                {runeDefs.map(rune => (
                  <div className="build-row" key={rune.id}>
                    <div>
                      <div className="item-title">
                        <strong>{rune.name}</strong>
                      </div>
                      <div className="cost">{rune.desc}</div>
                      <div className="cost">Cost: {rune.cost.remnants} remnants</div>
                    </div>
                    <div className="build-actions">
                      <span className="owned">Owned {state.runes[rune.id] || 0}</span>
                      <button className="ghost mini" onClick={() => craftRune(rune.id)} disabled={state.perks.remnants < rune.cost.remnants}>
                        Carve
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className={`panel section ${state.unlocks.ash ? '' : 'locked'}`}>
            <h2>Rites</h2>
            {state.unlocks.ash ? (
              <>
                <div className="meta-row">
                  <span>Patron</span>
                  <strong>{patron ? patron.name : 'Unchosen'}</strong>
                </div>
                <div className="meta-row">
                  <span>Blessing</span>
                  <strong>
                    {state.religion?.blessing?.patron
                      ? `${PATRONS.find(entry => entry.id === state.religion.blessing.patron)?.name || 'Active'} · ${formatTime(Math.max(0, state.religion.blessing.expiresAt - state.time))}`
                      : 'None'}
                  </strong>
                </div>
                <div className="meta-effects">
                  <div className="meta-title">Structures</div>
                  {ritesBuildings.map(item => (
                    <div key={`rite-${item.id}`} className="meta-effect">
                      {item.name} x{state.religion?.buildings?.[item.id] || 0}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="locked-row">
                <span className="lock">Ash</span>
                <span>Rituals and beliefs awaken later.</span>
              </div>
            )}
          </section>

          <section className="panel section">
            <details className="log-section">
              <summary>Event Log</summary>
              <div className="event-log">
                {state.log.map((line, idx) => (
                  <div key={idx} className="event-row">{line}</div>
                ))}
              </div>
            </details>
          </section>
          </div>
        </>
        ) : activeTab === 'warcamp' && (state.buildings.warcamp || 0) > 0 ? (
        <>
          <div className="center-column">
            <section className="panel center-section warcamp-overview">
              <div className="placeholder-title">Warcamp</div>
              <div className="warcamp-stats">
                <div>
                  <div className="stat-label">Warband</div>
                  <div className="stat-value">{state.clansfolk.army} / {state.clansfolk.maxArmy}</div>
                </div>
                <div>
                  <div className="stat-label">Warband HP</div>
                  <div className="stat-value">{state.clansfolk.armyHP.toFixed(1)} / {state.clansfolk.armyHPMax.toFixed(1)}</div>
                </div>
                <div>
                  <div className="stat-label">Attack</div>
                  <div className="stat-value">{army.atk.toFixed(1)}</div>
                </div>
              </div>
              <div className="warcamp-equipment">
                <div className="stat-label">Equip Warband</div>
                <div className="equipment-summary">
                  {['weapon', 'shield', 'armor'].map(slot => {
                    const equippedItems = Object.entries(state.equipment)
                      .filter(([id, count]) => {
                        const item = BLACKSMITH_ITEMS[id];
                        return item && item.slot === slot && count > 0;
                      })
                      .map(([id, count]) => `${BLACKSMITH_ITEMS[id].name} x${count}`);
                    const equippedCount = Object.entries(state.equipment).reduce((sum, [id, count]) => {
                      const item = BLACKSMITH_ITEMS[id];
                      if (!item || item.slot !== slot) return sum;
                      return sum + count;
                    }, 0);
                    const capacity = Math.max(0, state.clansfolk.army || 0);
                    const fill = capacity > 0 ? Math.min(100, (equippedCount / capacity) * 100) : 0;
                    return (
                      <div key={slot} className="equipment-summary-row">
                        <span className="summary-label">{slot.toUpperCase()}</span>
                        <span className="summary-value">{equippedItems.length ? equippedItems.join(', ') : 'None'}</span>
                        <span className="summary-count">{equippedCount}/{capacity}</span>
                        <button
                          className="ghost mini"
                          onClick={() => applyEquipSlot(slot, null)}
                          disabled={equippedItems.length === 0 || state.world.fighting}
                        >
                          Unequip
                        </button>
                        <div className="summary-bar">
                          <div style={{ width: `${fill}%` }} />
                        </div>
                      </div>
                    );
                  })}
                  <button className="ghost mini" onClick={() => equipSlots.forEach(slot => applyEquipSlot(slot.id, null))} disabled={state.clansfolk.army <= 0 || state.world.fighting}>
                    Unequip All
                  </button>
                </div>
                <div className="equipment-tiers">
                  {equipmentTiers
                    .filter(tier => !tier.unlock || state.unlocks[tier.unlock])
                    .map(tier => {
                      const tierItems = tier.items
                        .map(id => {
                          const item = BLACKSMITH_ITEMS[id];
                          return item ? { id, ...item } : null;
                        })
                        .filter(Boolean);
                      return (
                        <div className="equipment-tier" key={tier.id}>
                          <div className="tier-label">
                            <strong>{tier.label}</strong>
                            <span>{tierItems.length}x{equipSlots.length}</span>
                          </div>
                          <div className="tier-items">
                            {tierItems.map(item => {
                              const equipped = state.equipment[item.id] || 0;
                              const stored = state.inventory[item.id] || 0;
                              const equippedInSlot = Object.entries(state.equipment).reduce((sum, [equipId, count]) => {
                                const equipItem = BLACKSMITH_ITEMS[equipId];
                                if (!equipItem || equipItem.slot !== item.slot) return sum;
                                return sum + count;
                              }, 0);
                              const slotRemaining = Math.max(0, (state.clansfolk.army || 0) - equippedInSlot);
                              const itemStats = [];
                              if (item.atk) itemStats.push(`+${item.atk} ATK`);
                              if (item.hp) itemStats.push(`+${item.hp} HP`);
                              return (
                                <div className={`tier-item ${equipped > 0 ? 'equipped' : ''}`} key={item.id}>
                                  <div className="item-title">
                                    <strong>{item.name}</strong>
                                  </div>
                                  <div className="cost">Equipped {equipped} · Stored {stored} · Slots left {slotRemaining}</div>
                                  <div className="cost">{itemStats.join(' ')}</div>
                                  <div className="equip-controls">
                                    <button className="ghost mini" onClick={() => adjustEquip(item.id, -1)} disabled={equipped <= 0 || state.world.fighting}>−</button>
                                    <button className="mini" onClick={() => adjustEquip(item.id, 1)} disabled={stored <= 0 || slotRemaining <= 0 || state.world.fighting}>+</button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                </div>
                <div className="equip-actions">
                  <button className="ghost mini" onClick={autoEquip} disabled={state.clansfolk.army <= 0 || state.world.fighting}>Auto-Equip Best</button>
                </div>
              </div>
              <div className="warcamp-roster">
                <div className="stat-label">Warband Roster</div>
                <div className="roster-grid roster-backdrop" style={{ backgroundImage: `url(${stillBg})` }}>
                  <div className="roster-dots">
                    {Array.from({ length: state.clansfolk.army }).map((_, index) => {
                      const rand = (seed) => {
                        const value = (Math.sin(seed) * 10000) % 1;
                        return value < 0 ? value + 1 : value;
                      };
                      const baseLeft = 8 + rand(index + 1) * 84;
                      const baseTop = 160;
                      const dx = Math.round(60 + rand(index + 21) * 80);
                      const dy = Math.round(6 + rand(index + 31) * 18);
                      const delay = rand(index + 41) * 1.2;
                      const durX = 6 + rand(index + 51) * 4;
                      const durY = 4 + rand(index + 61) * 3;
                      return (
                        <span
                          key={`dot-${index}`}
                          className="roster-dot"
                          style={{
                            left: `${baseLeft}%`,
                            top: `${baseTop}px`,
                            animationDelay: `${delay}s`,
                            '--dx': `${dx}px`,
                            '--dy': `${dy}px`,
                            '--durx': `${durX}s`,
                            '--dury': `${durY}s`
                          }}
                        />
                      );
                    })}
                  </div>
                  {state.clansfolk.army === 0 && (
                    <div className="roster-empty">No clansfolk assigned to the warband yet.</div>
                  )}
                </div>
              </div>
              <div className="warcamp-inventory">
                <div className="stat-label">Equipment Inventory</div>
                <div className="inventory-grid">
                  {blacksmithItems.map(item => (
                    <React.Fragment key={`inv-${item.id}`}>
                      <div>{item.name}</div>
                      <strong>{state.inventory[item.id] || 0}</strong>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </section>
          </div>
          <div className="right-column">
            {state.unlocks.blacksmith ? (
              <section className="panel section">
                <h2>Blacksmith</h2>
                <div className="assign-step">
                  <span>Craft</span>
                  <div className="assign-buttons">
                    {[1, 5, 10, 'max'].map(step => (
                      <button
                        key={step}
                        className={`mini ${state.ui.craftStep === step ? 'selected' : ''}`}
                        onClick={() => setState(prev => ({
                          ...prev,
                          ui: { ...prev.ui, craftStep: step }
                        }))}
                      >
                        {step === 'max' ? 'Max' : `x${step}`}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="assign-step">
                  <span>Tier</span>
                  <div className="assign-buttons">
                    {availableBlacksmithTiers.map((tier, index) => (
                      <button
                        key={tier.id}
                        className={`mini ${selectedBlacksmithTier === tier.id ? 'selected' : ''}`}
                        onClick={() => setState(prev => ({
                          ...prev,
                          ui: { ...prev.ui, blacksmithTier: tier.id }
                        }))}
                      >
                        {`Tier ${index + 1}`}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="buildings-list">
                  {blacksmithItemsByTier.map(item => (
                    <div className="build-row" key={item.id}>
                      <div>
                        <div className="item-title">
                          <strong>{item.name}</strong>
                        </div>
                        <div className="cost">Cost: {Object.entries(item.cost).map(([r, v]) => `${v} ${r}`).join(', ')}</div>
                      </div>
                      <div className="build-actions">
                        <span className="owned">Owned {state.inventory[item.id] || 0}</span>
                        <button
                          className="ghost mini"
                          onClick={() => craftItem(item.id, state.ui.craftStep)}
                          disabled={!canAfford(state, item.cost)}
                        >
                          Craft
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ) : (
              <section className="panel section locked">
                <h2>Blacksmith</h2>
                <div className="locked-row">
                  <span className="lock">Locked</span>
                  <span>Unlock via the Blacksmithing innovation.</span>
                </div>
              </section>
            )}
            <section className="panel section">
              <h2>Command Center</h2>
              <div className="command-card">
                <div className="stat-label">Commander</div>
                <div className="command-hero">
                  <div className="command-avatar" />
                  <div>
                    <div className="command-name">Runa Iceborn</div>
                    <div className="command-title">Warcamp Warden</div>
                    <div className="command-traits">
                      <span>+6% Warband ATK</span>
                      <span>+10% Rally Speed</span>
                    </div>
                  </div>
                </div>
                <div className="command-actions">
                  <button className="ghost mini" disabled>Choose Commander</button>
                  <button className="ghost mini" disabled>Archive Commander</button>
                </div>
                <div className="placeholder-subtitle">Future: unique stats, traits, and persistent legends.</div>
              </div>
            </section>
          </div>
        </>
        ) : activeTab === 'rites' && state.unlocks.ash ? (
        <>
          <div className="center-column">
            <section className="panel center-section rites-panel">
              <div className="panel-header">
                <h2>Rites</h2>
                <div className="panel-subtitle">Choose a patron, then raise rites with ash.</div>
              </div>
              <div className="rites-patrons">
                {PATRONS.map(entry => {
                  const isActive = state.religion?.patron === entry.id;
                  const isSelected = state.ui?.selectedPatron === entry.id;
                  const canChoose = state.unlocks.ash;
                  return (
                    <div key={entry.id} className={`patron-card ${isActive ? 'active' : ''} ${isSelected ? 'selected' : ''}`}>
                      <div className="patron-title">{entry.name}</div>
                      <div className="patron-desc">{entry.desc}</div>
                      <div className="patron-detail">{entry.detail}</div>
                      <div className="cost">Cost: {Object.entries(entry.cost).map(([r, v]) => `${v} ${r}`).join(', ')}</div>
                      <div className="patron-detail">Session: 2–3 minutes</div>
                      <div className="patron-detail">Reward: 20 minutes</div>
                      <button
                        className="mini"
                        onClick={() => choosePatron(entry.id)}
                        disabled={isActive || !canChoose}
                      >
                        {isActive ? 'Devoted' : isSelected ? 'Selected' : 'Select'}
                      </button>
                    </div>
                  );
                })}
              </div>
              <div className="rites-summary">
                <div className="stat-label">Current Patron</div>
                <div className="stat-value">{patron ? patron.name : state.ui?.selectedPatron ? 'Ready to devote' : 'None chosen'}</div>
                <div className="rites-note">
                  {patron ? patron.desc : 'Select a patron to unlock rites buildings.'}
                </div>
                <div className="ritual-controls">
                  <button
                    className="mini"
                    onClick={devotePatron}
                    disabled={!state.ui?.selectedPatron || state.religion?.patron === state.ui?.selectedPatron || !canAfford(state, (PATRONS.find(entry => entry.id === state.ui?.selectedPatron)?.cost || {}))}
                  >
                    {state.religion?.patron ? 'Re‑Devote' : 'Devote'}
                  </button>
                  <button
                    className="mini"
                    onClick={startRitual}
                    disabled={!patron || state.religion?.ritual?.active}
                  >
                    {state.religion?.ritual?.active ? 'Ritual Active' : 'Begin Ritual'}
                  </button>
                </div>
              </div>
              {state.religion?.ritual?.active && (
                <div className="ritual-panel">
                  <div className="ritual-row">
                    <span>Time Left</span>
                    <strong>{Math.ceil(state.religion.ritual.timeLeft)}s</strong>
                  </div>
                  <div className="ritual-row">
                    <span>Hits</span>
                    <strong>{state.religion.ritual.hits} / {state.religion.ritual.required}</strong>
                  </div>
                  {state.religion.ritual.type === 'archery' && (
                    <div className="ritual-row">
                      <span>Spears</span>
                      <strong>{state.religion.ritual.arrowsLeft} / {state.religion.ritual.totalArrows}</strong>
                    </div>
                  )}
                  {state.religion.ritual.type === 'archery' ? (
                    <>
                      <ArrowDuelCanvas
                        resetToken={state.religion.ritual.startTime}
                        onHit={(spearsLeft) => setState(prev => {
                          const ritual = prev.religion?.ritual;
                          if (!ritual?.active || ritual.type !== 'archery') return prev;
                          const nextHits = Math.min(ritual.required, ritual.hits + 1);
                          return {
                            ...prev,
                            religion: {
                              ...prev.religion,
                              ritual: {
                                ...ritual,
                                hits: nextHits,
                                arrowsLeft: spearsLeft
                              }
                            }
                          };
                        })}
                        onMiss={(spearsLeft) => setState(prev => {
                          const ritual = prev.religion?.ritual;
                          if (!ritual?.active || ritual.type !== 'archery') return prev;
                          return {
                            ...prev,
                            religion: {
                              ...prev.religion,
                              ritual: {
                                ...ritual,
                                arrowsLeft: spearsLeft
                              }
                            }
                          };
                        })}
                        onFinalHit={(holdSeconds) => setState(prev => {
                          const ritual = prev.religion?.ritual;
                          if (!ritual?.active) return prev;
                          const holdUntil = performance.now() / 1000 + holdSeconds;
                          return {
                            ...prev,
                            religion: {
                              ...prev.religion,
                              ritual: {
                                ...ritual,
                                holdUntil,
                                timeLeft: Math.max(ritual.timeLeft, holdSeconds)
                              }
                            }
                          };
                        })}
                        onSuccess={() => setState(prev => finishRitual(prev, prev.religion.ritual, true, 'Ritual succeeded. The storm roars back.'))}
                        onFail={() => setState(prev => finishRitual(prev, prev.religion.ritual, false, 'Ritual failed. The storm passes unanswered.'))}
                      />
                    </>
                  ) : (
                    <ChantMinigame
                      ritual={state.religion.ritual}
                      onChant={chantRitual}
                    />
                  )}
                </div>
              )}
            </section>
          </div>
          <div className="right-column">
            <section className="panel section">
              <h2>Rites Buildings</h2>
              {!state.religion?.patron ? (
                <div className="locked-row">
                  <span className="lock">Devotion</span>
                  <span>Choose a patron before building rites.</span>
                </div>
              ) : (
                <div className="buildings-list">
                  {ritesBuildings.map(item => {
                    const owned = state.religion?.buildings?.[item.id] || 0;
                    const scaledCost = getScaledCost(item.cost, owned, item.scale || 1.2);
                    return (
                      <div key={`rite-build-${item.id}`} className="build-row">
                        <div>
                          <div className="item-title">
                            <strong>{item.name}</strong>
                          </div>
                          <div className="cost">{item.desc}</div>
                          <div className="cost">Cost: {Object.entries(scaledCost).map(([r, v]) => `${v} ${r}`).join(', ')}</div>
                        </div>
                        <div className="build-actions">
                          <span className="owned">Owned {owned}</span>
                          <button className="ghost mini" onClick={() => buildRite(item.id)} disabled={!canAfford(state, scaledCost)}>
                            Build
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        </>
        ) : (
        <>
          <div className="center-column">
            <section className="panel center-section tab-placeholder">
              <div className="placeholder-title">{tabs.find(tab => tab.id === activeTab)?.label}</div>
              <div className="placeholder-subtitle">
                {activeTab === 'warcamp'
                  ? 'Warcamp unlocks after building a Warcamp.'
                  : 'This page is reserved for future systems and detailed views.'}
              </div>
            </section>
          </div>
          <div className="right-column">
            <section className="panel section tab-placeholder">
              <h2>{tabs.find(tab => tab.id === activeTab)?.label} Notes</h2>
              <div className="placeholder-subtitle">Context, forecasts, and meta details will live here.</div>
            </section>
          </div>
        </>
        )}
        {tooltip && (
          <div
            className="floating-tooltip"
            style={{ left: tooltip.left, top: tooltip.top, width: tooltip.width }}
          >
            {tooltip.text}
          </div>
        )}
      </div>
    </>
  );
}

/**
 * Group build items by category for rendering.
 * @param {Record<string, object>} buildings
 * @returns {Record<string, Array<{id:string,data:object}>>}
 */
function groupBuildings(buildings) {
  const groups = {};
  Object.entries(buildings).forEach(([id, data]) => {
    const group = data.group || 'General';
    if (!groups[group]) groups[group] = [];
    groups[group].push({ id, data });
  });
  return groups;
}

/**
 * Return only items that are unlocked/visible for the current state.
 * @param {Record<string, object>} buildings
 * @param {Record<string, object>} upgrades
 * @param {object} state
 * @returns {Record<string, object>}
 */
function getVisibleItems(buildings, upgrades, state) {
  const items = {};
  if (state.dev?.showAll) {
    return { ...buildings, ...upgrades };
  }
  const unlocks = state.unlocks;

  Object.entries(buildings).forEach(([id, data]) => {
    if (id === 'grasshut') {
      items[id] = data;
      return;
    }
    if (!unlocks.buildingsTier1) return;
    if (id === 'timberhall') {
      items[id] = data;
      return;
    }
    if ((id === 'smokehouse' || id === 'woodcuttershed') && hasRequirements(state, data.requires)) {
      items[id] = data;
      return;
    }
    if (!unlocks.buildingsTier2) return;
    if (id === 'longhouse') {
      items[id] = data;
      return;
    }
    if ((id === 'storehouse' || id === 'warcamp' || id === 'stonekeep' || id === 'skaldhall' || id === 'quarrycamp' || id === 'foundry' || id === 'ashaltar' || id === 'granaryhall' || id === 'timberyard' || id === 'masonryard' || id === 'smeltery') && hasRequirements(state, data.requires)) {
      items[id] = data;
      return;
    }
  });

  Object.entries(upgrades).forEach(([id, data]) => {
    if (data.group === 'Innovation' && (state.upgrades[id] || 0) > 0) return;
    if (data.group === 'Innovation' && !unlocks.upgradesTier1) return;
    if (data.group === 'Travel' && !unlocks.travel) return;
    if (!hasRequirements(state, data.requires)) return;
    if (data.group === 'Innovation' && !unlocks.upgradesTier2) {
      const tier2 = ['steelhooks', 'fellingaxes'];
      if (tier2.includes(id)) return;
    }
    if (data.requiresZone && state.world.zone < data.requiresZone) return;
    items[id] = data;
  });

  return items;
}

/**
 * Get cost scaling factor for an item category.
 * @param {boolean} isUpgrade
 * @param {string} group
 * @returns {number}
 */
function getScale(isUpgrade, group, data) {
  if (data?.scale) return data.scale;
  if (!isUpgrade) return 1.05;
  if (group === 'Travel') return 1.2;
  return 1.12;
}

/**
 * Compute the ritual meter position.
 * @param {number} time
 * @param {object} ritual
 * @returns {number}
 */
function getRitualMeter(time, ritual) {
  const period = ritual?.period || 4;
  if (period <= 0) return 0;
  const phase = ((time - (ritual?.startTime || 0)) % period) / period;
  return phase < 0.5 ? phase * 2 : (1 - phase) * 2;
}

/**
 * Style for the ritual band.
 * @param {object} ritual
 * @returns {object}
 */
function getRitualBandStyle(ritual) {
  const width = Math.max(0.05, Math.min(0.6, ritual.bandWidth || 0.14));
  const left = Math.max(0, Math.min(1 - width, (ritual.bandCenter || 0.5) - width / 2));
  return { left: `${left * 100}%`, width: `${width * 100}%` };
}

/**
 * Style for the ritual pointer.
 * @param {number} time
 * @param {object} ritual
 * @returns {object}
 */
// ritual pointer uses rAF transform for smoothness

/**
 * Compute scaled costs based on owned count and scale factor.
 * @param {Record<string, number>} baseCost
 * @param {number} owned
 * @param {number} scale
 * @returns {Record<string, number>}
 */
function getScaledCost(baseCost, owned, scale) {
  const factor = Math.pow(scale, owned);
  const scaled = {};
  Object.entries(baseCost).forEach(([key, value]) => {
    scaled[key] = Math.max(1, Math.round(value * factor));
  });
  return scaled;
}

/**
 * Build tooltip text for a build/upgrade item.
 * @param {object} data
 * @param {string} id
 * @param {number} owned
 * @param {object} state
 * @returns {string}
 */
function getItemTooltipText(data, id, owned, state) {
  if (id === 'smokehouse') {
    const storehouseMult = 1 + (state.buildings.storehouse || 0) * 0.5;
    const effective = Math.round(200 * storehouseMult);
    return `Raises food storage by ${effective} per level (with Storehouse).`;
  }
  if (id === 'woodcuttershed') {
    const storehouseMult = 1 + (state.buildings.storehouse || 0) * 0.5;
    const effective = Math.round(200 * storehouseMult);
    return `Raises wood storage by ${effective} per level (with Storehouse).`;
  }
  if (id === 'skaldhall') {
    return 'Raises knowledge storage by 200 per level.';
  }
  if (id === 'quarrycamp') {
    const effectiveCap = Math.round((150 + (state.buildings.storehouse || 0) * 75));
    return `Raises stone output by 12% and stone storage by about ${effectiveCap} per level.`;
  }
  if (id === 'granaryhall') {
    const effectiveCap = Math.round((250 + (state.buildings.storehouse || 0) * 125));
    return `Raises food output by 8% and food storage by about ${effectiveCap} per level.`;
  }
  if (id === 'timberyard') {
    const effectiveCap = Math.round((250 + (state.buildings.storehouse || 0) * 125));
    return `Raises wood output by 8% and wood storage by about ${effectiveCap} per level.`;
  }
  if (id === 'masonryard') {
    const effectiveCap = Math.round((150 + (state.buildings.storehouse || 0) * 75));
    return `Raises stone output by 10% and stone storage by about ${effectiveCap} per level.`;
  }
  if (id === 'smeltery') {
    const effectiveCap = Math.round((150 + (state.buildings.storehouse || 0) * 75));
    return `Raises metal output by 10% and metal storage by about ${effectiveCap} per level.`;
  }
  if (id === 'foundry') {
    const effectiveCap = Math.round((150 + (state.buildings.storehouse || 0) * 75));
    return `Raises metal output by 12% and metal storage by about ${effectiveCap} per level.`;
  }
  if (id === 'ashaltar') {
    return 'Raises ash gain from battle by 15% and ash storage by 60 per level.';
  }
  if (id === 'storehouse') {
    const bonus = (state.buildings.storehouse || 0) * 50;
    return `Increases food/wood/stone/metal storage by 50% per level (current +${bonus}%).`;
  }
  const base = data.detail || data.desc || '';
  const unlocks = data.unlocks ? ` • Unlocks: ${data.unlocks}` : '';
  return `${base}${unlocks}`;
}

/**
 * Building-specific visual tint class for build cards.
 * @param {string} id
 * @returns {string}
 */
function getBuildingTintClass(id) {
  if (id === 'grasshut' || id === 'timberhall' || id === 'longhouse' || id === 'stonekeep') return 'tint-housing';
  if (id === 'storehouse' || id === 'smokehouse' || id === 'woodcuttershed' || id === 'quarrycamp' || id === 'foundry' || id === 'granaryhall' || id === 'timberyard' || id === 'masonryard' || id === 'smeltery') return 'tint-storage';
  if (id === 'ashaltar') return 'tint-warcamp';
  if (id === 'warcamp') return 'tint-warcamp';
  if (id === 'skaldhall') return 'tint-skald';
  return '';
}

/**
 * Check if a resource is unlocked.
 * @param {object} state
 * @param {string} key
 * @returns {boolean}
 */
function isResourceUnlocked(state, key) {
  if (key === 'food' || key === 'wood') return true;
  return Boolean(state.unlocks[key]);
}

/**
 * Check if a job is unlocked.
 * @param {object} state
 * @param {string} jobKey
 * @returns {boolean}
 */
function isJobUnlocked(state, jobKey) {
  if (jobKey === 'forager' || jobKey === 'woodcutter') return true;
  if (jobKey === 'quarry') return state.unlocks.stone;
  if (jobKey === 'smelter') return state.unlocks.metal;
  if (jobKey === 'ashwalker') return state.unlocks.ash;
  if (jobKey === 'lorekeeper') return state.unlocks.lorekeepers;
  if (jobKey === 'drillmaster') return (state.buildings.warcamp || 0) > 0;
  return true;
}

/**
 * Check if a build/upgrade requirement is satisfied.
 * Supports strings or arrays, and building/upgrade/unlock keys.
 * @param {object} state
 * @param {string|string[]|undefined} requires
 * @returns {boolean}
 */
function hasRequirements(state, requires) {
  if (!requires) return true;
  const list = Array.isArray(requires) ? requires : [requires];
  return list.every(req => {
    if (state.upgrades[req] !== undefined) return (state.upgrades[req] || 0) > 0;
    if (state.buildings[req] !== undefined) return (state.buildings[req] || 0) > 0;
    if (state.unlocks[req] !== undefined) return Boolean(state.unlocks[req]);
    return false;
  });
}

/**
 * Base storage value before storehouse multiplier.
 * @param {object} state
 * @param {string} key
 * @returns {number}
 */
function getBaseStorage(state, key) {
  if (key === 'food') {
    return 200 + (state.buildings.smokehouse || 0) * 200 + (state.buildings.granaryhall || 0) * 250;
  }
  if (key === 'wood') return 200 + (state.buildings.timberyard || 0) * 250;
  if (key === 'stone') return state.unlocks.stone ? 200 + (state.buildings.quarrycamp || 0) * 150 + (state.buildings.masonryard || 0) * 150 : 0;
  if (key === 'metal') return state.unlocks.metal ? 200 + (state.buildings.foundry || 0) * 150 + (state.buildings.smeltery || 0) * 150 : 0;
  if (key === 'ash') return state.unlocks.ash ? 100 + (state.buildings.ashaltar || 0) * 60 : 0;
  if (key === 'knowledge') return state.unlocks.knowledge ? 200 : 0;
  return 0;
}


/**
 * Format seconds into m:ss.
 * @param {number} totalSeconds
 * @returns {string}
 */
function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
}

/**
 * Format numbers into short human-readable form (e.g., 1.2k).
 * @param {number} value
 * @returns {string}
 */
function formatShort(value) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}m`;
  if (value >= 10_000) return `${(value / 1_000).toFixed(1)}k`;
  return `${Math.floor(value)}`;
}

/**
 * Build a preset state for stage testing.
 * @param {number} stage
 * @returns {object}
 */
function getStageState(stage) {
  const base = structuredClone(START_STATE);
  if (stage === 1) {
    base.resources = { food: 40, wood: 40, stone: 0, metal: 0, ash: 0, knowledge: 0 };
    base.clansfolk.total = 6;
    base.clansfolk.idle = 6;
    base.buildings.grasshut = 6;
    base.unlocks.buildingsTier1 = false;
    base.log = ['Stage 1: A small camp is formed.'];
  }
  if (stage === 2) {
    base.resources = { food: 120, wood: 120, stone: 40, metal: 10, ash: 0, knowledge: 5 };
    base.clansfolk.total = 12;
    base.clansfolk.idle = 10;
    base.buildings.grasshut = 12;
    base.buildings.timberhall = 4;
    base.unlocks.buildingsTier1 = true;
    base.unlocks.weapons = true;
    base.unlocks.upgradesTier1 = true;
    base.unlocks.stone = true;
    base.unlocks.knowledge = true;
    base.log = ['Stage 2: The camp grows into a village.'];
  }
  if (stage === 3) {
    base.resources = { food: 1800, wood: 1800, stone: 1200, metal: 900, ash: 600, knowledge: 400 };
    base.clansfolk.total = 200;
    base.clansfolk.idle = 180;
    base.clansfolk.army = 20;
    base.buildings = {
      grasshut: 20,
      timberhall: 10,
      longhouse: 6,
      stonekeep: 4,
      storehouse: 3,
      smokehouse: 4,
      woodcuttershed: 4,
      granaryhall: 2,
      timberyard: 2,
      masonryard: 2,
      smeltery: 2,
      warcamp: 3,
      skaldhall: 2,
      quarrycamp: 3,
      foundry: 2,
      ashaltar: 2
    };
    Object.keys(base.upgrades).forEach((key) => {
      base.upgrades[key] = 1;
    });
    base.unlocks = Object.fromEntries(Object.keys(base.unlocks).map(key => [key, true]));
    base.inventory = Object.fromEntries(Object.keys(base.inventory).map(key => [key, 6]));
    base.equipment = Object.fromEntries(Object.keys(base.equipment).map(key => [key, 0]));
    base.religion = {
      patron: 'hearth',
      buildings: { ashshrine: 2, embercairn: 2, hymnhall: 2 },
      ritual: { ...base.religion.ritual },
      blessing: { patron: null, expiresAt: 0 }
    };
    base.ui = { ...base.ui, selectedPatron: 'hearth' };
    base.world.zone = 8;
    base.log = ['Stage 3: All systems unlocked for testing.'];
  }
  return base;
}

/**
 * Estimate combat outcome based on DPS comparison.
 * @param {object} state
 * @param {{atk:number,hp:number}} army
 * @returns {{text:string,tone:string}}
 */
function getCombatForecast(state, army) {
  if (state.clansfolk.army <= 0) return { text: 'No warband available', tone: 'danger' };
  const playerDps = Math.max(0.01, army.atk * 0.6);
  const enemyDps = Math.max(0.01, state.world.enemyAtk * 0.04);
  const timeToKill = state.world.enemyHP / playerDps;
  const timeToLose = army.hp / enemyDps;
  if (timeToKill < timeToLose * 0.8) return { text: 'Forecast: Likely victory', tone: 'good' };
  if (timeToLose < timeToKill * 0.8) return { text: 'Forecast: Likely defeat', tone: 'danger' };
  return { text: 'Forecast: Uncertain', tone: 'warn' };
}

function getCombatTimes(state, army) {
  if (state.clansfolk.army <= 0) {
    return { ttk: '--', ttl: '--', outcomeText: 'No warband', outcomeTone: 'danger' };
  }
  const playerDps = Math.max(0.01, army.atk * 0.6);
  const enemyDps = Math.max(0.01, state.world.enemyAtk * 0.5);
  const ttk = state.world.enemyHP / playerDps;
  const ttl = state.clansfolk.armyHP / enemyDps;
  const ttkText = formatSeconds(ttk);
  const ttlText = formatSeconds(ttl);
  let outcomeText = 'Outcome: Uncertain';
  let outcomeTone = 'warn';
  if (ttk < ttl * 0.8) {
    outcomeText = `Outcome: Win in ${ttkText}`;
    outcomeTone = 'good';
  } else if (ttl < ttk * 0.8) {
    outcomeText = `Outcome: Lose in ${ttlText}`;
    outcomeTone = 'danger';
  }
  return { ttk: ttkText, ttl: ttlText, outcomeText, outcomeTone };
}

function formatSeconds(value) {
  if (!Number.isFinite(value)) return '--';
  if (value >= 99) return '99+';
  return value.toFixed(1);
}

/**
 * Tutorial milestones and next-step guidance.
 * @param {object} state
 * @returns {Array<{key:string,text:string,done:boolean}>}
 */
function getMilestones(state) {
  const steps = [
    {
      key: 'food',
      text: 'Gather 20 food',
      done: state.resources.food >= 20
    },
    {
      key: 'wood',
      text: 'Gather 20 wood',
      done: state.resources.wood >= 20
    },
    {
      key: 'hut',
      text: 'Build 1 Grass Hut',
      done: (state.buildings.grasshut || 0) >= 1
    },
    {
      key: 'warband',
      text: 'Send a warband',
      done: state.clansfolk.army > 0
    },
    {
      key: 'zone',
      text: 'Clear Zone 1',
      done: state.world.zone > 1
    }
  ];

  if (!state.tutorial.enabled) {
    return steps.filter(item => !item.done).slice(0, 4);
  }

  const next = steps.find(item => !item.done);
  return next ? [next] : [];
}

/**
 * Zone progress as a 0..1 value across enemies.
 * @param {object} state
 * @returns {number}
 */
function getZoneProgress(state) {
  const enemies = state.world.enemiesPerZone || 1;
  const idx = Math.max(1, state.world.enemyIndex || 1);
  const current = 1 - state.world.enemyHP / Math.max(1, state.world.enemyHPMax);
  return Math.min(1, (idx - 1 + current) / enemies);
}

/**
 * Pick a combat background image for the current zone.
 * @param {object} state
 * @param {number} zoneProgress
 * @returns {string}
 */
function getCombatScene(state, zoneProgress) {
  if (!state.world.fighting) return stillBg;
  if (zoneProgress > 0.75 && state.world.zone >= 6) return hellBg;
  if (state.world.zone <= 3) return frozenBg;
  return stillBg;
}

/**
 * World modifier rows for right column.
 * @param {object} state
 * @returns {object}
 */
function getWorldModifiers(state) {
  return {
    production: [
      { label: 'Remnants Memory', value: `x${state.perks.prodMult.toFixed(2)}` },
      { label: 'Shelter Efficiency', value: '+0%' }
    ],
    combat: [
      { label: 'Warband Discipline', value: `x${state.perks.atkMult.toFixed(2)}` },
      { label: 'Zone Pressure', value: `+${state.world.zone * 2}%` }
    ],
    environment: [
      { label: 'Frost Load', value: `+${state.world.zone}%` },
      { label: 'Ashfall', value: `+${Math.max(0, state.world.zone - 3)}%` }
    ]
  };
}

function getForecasts(state, caps, rates) {
  const items = [];
  const capped = Object.keys(state.resources).filter(key => state.resources[key] >= caps[key] && rates[key] > 0);
  if (capped.length > 0) {
    items.push({ text: `Storage waste begins: ${capped.slice(0, 2).join(', ')}`, tone: 'warn' });
  }
  if (state.clansfolk.idle <= 0) {
    items.push({ text: 'Idle population exhausted', tone: 'warn' });
  }
  if (state.clansfolk.army <= 0) {
    items.push({ text: 'No warband to advance zones', tone: 'danger' });
  }
  if (state.world.enemyHP / Math.max(1, state.world.enemyHPMax) > 0.9 && state.world.zone >= 3) {
    items.push({ text: 'Enemy resistance is stalling progress', tone: 'warn' });
  }
  return items.slice(0, 3);
}
