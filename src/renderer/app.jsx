import React, { useEffect, useMemo, useRef, useState } from 'react';
import stillBg from './assets/images/Still.png';
import frozenBg from './assets/images/Frozen.png';
import hellBg from './assets/images/hellvibes.png';
import { BLACKSMITH_ITEMS, BUILDINGS, UPGRADES, PATRONS, RITES_BUILDINGS } from './data.js';
import { SAVE_KEY, START_STATE } from './models.js';
import { calcCaps, calcRates, getArmyStats, canAfford, applyCost, loadSave, mergeSave, totalJobs } from './systems.js';
import { simulateTick } from './sim.js';
import AppHeader from './components/AppHeader.jsx';
import LeftColumn from './components/LeftColumn.jsx';
import OverviewTab from './components/OverviewTab.jsx';
import WarcampTab from './components/WarcampTab.jsx';
import RitesTab from './components/RitesTab.jsx';
import TravelTab from './components/TravelTab.jsx';
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
  const chantHitRef = useRef([]);
  const chantMissRef = useRef([]);

  const caps = useMemo(() => calcCaps(state), [state.buildings, state.unlocks, state.religion]);
  const rates = useMemo(
    () => calcRates(state),
    [
      state.jobs,
      state.buildings,
      state.perks,
      state.religion,
      state.unlocks,
      state.world?.logisticsPressure,
      state.world?.overcrowdingOutputPenalty
    ]
  );
  const netRates = useMemo(
    () => getResourceNetRates(state, rates),
    [rates, state.buildings, state.clansfolk.total, state.unlocks, state.world?.overcrowdingFoodMult]
  );
  const army = useMemo(() => getArmyStats(state), [state.clansfolk, state.jobs, state.perks, state.equipment, state.ui?.combatStance, state.religion]);
  const travelPartyCap = useMemo(() => getTravelPartyCap(state), [state.upgrades]);
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
    const step = 0.25;
    const timer = setInterval(() => {
      if (document.hidden) return;
      setState(prev => simulateTick(prev, step));
    }, step * 1000);
    return () => clearInterval(timer);
  }, []);

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
  const crowdRatio = state.world.overcrowdingRatio || (maxTrimps > 0 ? state.clansfolk.total / maxTrimps : 0);
  const crowdFillPercent = Math.max(0, Math.round(crowdRatio * 100));
  const crowdStart = maxTrimps >= 150 ? 0.9 : 0.95;
  const overcrowdingTone = crowdRatio < crowdStart ? 'safe' : crowdRatio < 1.05 ? 'warn' : 'danger';
  const overcrowdingDangerLevel = overcrowdingTone === 'danger'
    ? Math.max(0, Math.min(1, (crowdRatio - 1.05) / 0.25))
    : 0;
  const logisticsPressure = state.world.logisticsPressure || 0;
  const logisticsOutputPenalty = Math.max(0, (1 - Math.max(0.4, 1 - logisticsPressure * 0.6)) * 100);
  const overcrowdingGrowthPenalty = Math.max(0, (state.world.overcrowdingGrowthPenalty || 0) * 100);
  const overcrowdingOutputPenalty = Math.max(0, (state.world.overcrowdingOutputPenalty || 0) * 100);
  const overcrowdingFoodMult = state.world.overcrowdingFoodMult || 1;
  const logisticsTooltipText = `Logistics shortfall is reducing worker output by ${logisticsOutputPenalty.toFixed(1)}%. Keep food, wood, stone, and metal supply stable to lower pressure.`;
  const overcrowdingTooltipText = `Overcrowding effects: growth -${overcrowdingGrowthPenalty.toFixed(1)}%, output -${overcrowdingOutputPenalty.toFixed(1)}%, food use x${overcrowdingFoodMult.toFixed(2)}.`;
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
  function build(type, amount = 1) {
    const config = BUILDINGS[type] || UPGRADES[type];
    setState(prev => {
      const isUpgrade = Boolean(UPGRADES[type]);
      if (!hasRequirements(prev, config.requires)) return prev;
      if (config.requiresZone && prev.world.zone < config.requiresZone) return prev;
      const next = {
        ...prev,
        buildings: { ...prev.buildings },
        upgrades: { ...prev.upgrades },
        resources: { ...prev.resources }
      };
      const maxPurchases = amount === 'max' ? Number.MAX_SAFE_INTEGER : Math.max(1, Number(amount) || 1);
      const oneTimeInnovation = isUpgrade && config.group === 'Innovation';
      let purchases = 0;

      while (purchases < maxPurchases) {
        const owned = isUpgrade ? (next.upgrades[type] || 0) : (next.buildings[type] || 0);
        if (!isUpgrade && type === 'warcamp' && owned >= getWarcampCap(next)) break;
        if (oneTimeInnovation && owned > 0) break;

        const scaledCost = getScaledCost(config.cost, owned, getScale(isUpgrade, config.group), type);
        const timberYardDiscount = Math.min(0.35, (next.buildings.timberyard || 0) * 0.04);
        const finalCost = applyWoodDiscount(scaledCost, timberYardDiscount);
        if (!canAfford(next, finalCost)) break;
        next.resources = applyCost(next, finalCost);

        if (isUpgrade) {
          if (type === 'stoneworking') {
            next.unlocks = { ...next.unlocks, stone: true };
            next.upgrades[type] = 1;
          } else if (type === 'mining') {
            next.unlocks = { ...next.unlocks, metal: true };
            next.upgrades[type] = 1;
          } else if (type === 'ashgathering') {
            next.unlocks = { ...next.unlocks, ash: true };
            next.upgrades[type] = 1;
          } else if (type === 'lorekeeping') {
            next.unlocks = { ...next.unlocks, knowledge: true };
            next.upgrades[type] = 1;
          } else if (type === 'skaldtraining') {
            next.unlocks = { ...next.unlocks, lorekeepers: true };
            next.upgrades[type] = 1;
          } else if (type === 'blacksmithing') {
            next.unlocks = { ...next.unlocks, blacksmith: true };
            next.upgrades[type] = 1;
          } else if (type === 'armory1') {
            next.unlocks = { ...next.unlocks, weaponTier2: true };
            next.upgrades[type] = 1;
          } else if (type === 'armory2') {
            next.unlocks = { ...next.unlocks, weaponTier3: true };
            next.upgrades[type] = 1;
          } else {
            const nextLevel = config.group === 'Innovation' ? 1 : (next.upgrades[type] || 0) + 1;
            next.upgrades[type] = nextLevel;
          }
        } else {
          next.buildings[type] += 1;
        }

        purchases += 1;
        if (oneTimeInnovation) break;
      }

      if (purchases <= 0) return prev;
      if (isUpgrade) {
        if (type === 'stoneworking') pushLog('Stone can now be gathered.');
        else if (type === 'mining') pushLog('Metal can now be gathered.');
        else if (type === 'ashgathering') pushLog('Ash can now be gathered.');
        else if (type === 'lorekeeping') pushLog('Knowledge can now be stored.');
        else if (type === 'skaldtraining') pushLog('Lorekeepers can now be assigned.');
        else if (type === 'blacksmithing') pushLog('The blacksmith is now operational.');
        else if (type === 'armory1') pushLog('Reinforced blacksmith gear unlocked.');
        else if (type === 'armory2') pushLog('Iron blacksmith gear unlocked.');
        else pushLog(`${config.name} ${config.group === 'Innovation' ? 'acquired' : `upgraded x${purchases}`}.`);
      } else {
        pushLog(`${config.name} constructed x${purchases}.`);
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
   * Set expedition send amount from quick controls.
   * @param {number|string} amount
   */
  function setExpeditionSend(amount) {
    setState(prev => {
      const army = Math.max(0, prev.clansfolk.army || 0);
      const cap = getTravelPartyCap(prev);
      const maxSend = Math.max(1, Math.min(army, cap));
      const target = amount === 'max'
        ? maxSend
        : Math.max(1, Math.min(maxSend, Number(amount) || 1));
      return {
        ...prev,
        ui: { ...prev.ui, expeditionSend: target }
      };
    });
  }

  /**
   * Launch an expedition from the travel tab.
   * @param {'scout'|'salvage'|'embers'} type
   */
  function startExpedition(type) {
    setState(prev => {
      if (prev.world?.fighting) return prev;
      if (prev.world?.expedition?.active) return prev;
      const army = Math.max(0, prev.clansfolk.army || 0);
      if (army <= 0) return prev;
      if (type === 'embers' && !prev.unlocks.ash) return prev;
      const cap = getTravelPartyCap(prev);
      const send = Math.max(1, Math.min(army, cap, prev.ui?.expeditionSend || 1));
      const travelSpeed = getTravelSpeedMult(prev);
      const baseDuration = type === 'salvage' ? 55 : type === 'embers' ? 70 : 45;
      const zoneTax = Math.max(0, prev.world.zone - 1) * 1.5;
      const duration = Math.max(15, Math.round((baseDuration + zoneTax) * travelSpeed));
      return {
        ...prev,
        world: {
          ...prev.world,
          expedition: {
            active: true,
            type,
            timeLeft: duration,
            duration,
            party: send
          }
        },
        clansfolk: {
          ...prev.clansfolk,
          army: Math.max(0, prev.clansfolk.army - send),
          armyHP: 0,
          armyHPMax: 0
        },
        ui: {
          ...prev.ui,
          expeditionSend: Math.max(
            1,
            Math.min(
              Math.max(0, prev.clansfolk.army - send),
              cap,
              prev.ui?.expeditionSend || 1
            )
          )
        }
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

  function handleArcheryHit(spearsLeft) {
    setState(prev => {
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
    });
  }

  function handleArcheryMiss(spearsLeft) {
    setState(prev => {
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
    });
  }

  function handleArcheryFinalHit(holdSeconds) {
    setState(prev => {
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
    });
  }

  return (
    <>
      <AppHeader
        state={state}
        tabs={tabs}
        activeTab={activeTab}
        formatShort={formatShort}
        isResourceUnlocked={isResourceUnlocked}
        onTabChange={(tabId) => setState(prev => ({
          ...prev,
          ui: { ...prev.ui, tab: tabId }
        }))}
        prestige={prestige}
        hardRestart={hardRestart}
        setStage={setStage}
        toggleTutorial={toggleTutorial}
        toggleDevMode={toggleDevMode}
        onDevAddAsh={() => setState(prev => ({
          ...prev,
          resources: { ...prev.resources, ash: (prev.resources.ash || 0) + 200 }
        }))}
        onToggleLowFx={() => setState(prev => ({
          ...prev,
          ui: { ...prev.ui, lowFx: !prev.ui?.lowFx }
        }))}
      />
      <div className={`shell ${state.ui?.lowFx ? 'low-fx' : ''} ${activeTab === 'travel' ? 'travel-layout' : ''}`}>
        {activeTab !== 'travel' && (
        <LeftColumn
          state={state}
          caps={caps}
          rates={rates}
          netRates={netRates}
          resourceOrder={resourceOrder}
          formatShort={formatShort}
          isResourceUnlocked={isResourceUnlocked}
          maxTrimps={maxTrimps}
          totalAssigned={totalAssigned}
          assignStep={assignStep}
          setAssignStep={setAssignStep}
          assign={assign}
          sendArmy={sendArmy}
          recallArmy={recallArmy}
          isJobUnlocked={isJobUnlocked}
          buildingGroups={buildingGroups}
          getScaledCost={getScaledCost}
          getScale={getScale}
          applyWoodDiscount={applyWoodDiscount}
          getBuildingTintClass={getBuildingTintClass}
          showTooltip={showTooltip}
          hideTooltip={hideTooltip}
          getItemTooltipText={getItemTooltipText}
          build={build}
          onToggleLeaderTask={(key, isLeaderTask) => setState(prev => ({
            ...prev,
            ui: { ...prev.ui, leaderTask: isLeaderTask ? null : key }
          }))}
          onSetBuildCategory={(category) => setState(prev => ({
            ...prev,
            ui: { ...prev.ui, buildCategory: category }
          }))}
        />
        )}

        {activeTab === 'overview' ? (
        <OverviewTab
          state={state}
          zoneName={zoneName}
          zoneProgress={zoneProgress}
          blocker={blocker}
          logisticsTooltipText={logisticsTooltipText}
          overcrowdingTooltipText={overcrowdingTooltipText}
          logisticsPressure={logisticsPressure}
          overcrowdingTone={overcrowdingTone}
          overcrowdingDangerLevel={overcrowdingDangerLevel}
          crowdFillPercent={crowdFillPercent}
          scene={scene}
          army={army}
          forecast={forecast}
          combatTimes={combatTimes}
          cycleName={cycleName}
          cycleTime={cycleTime}
          modifiers={modifiers}
          forecasts={forecasts}
          milestones={milestones}
          runeDefs={runeDefs}
          ritesBuildings={ritesBuildings}
          patron={patron}
          showTooltip={showTooltip}
          hideTooltip={hideTooltip}
          setWarbandSend={(nextValue) => setState(prev => ({
            ...prev,
            ui: { ...prev.ui, warbandSend: nextValue }
          }))}
          startFight={startFight}
          stopFight={stopFight}
          scout={() => pushLog('Scouted the zone.')}
          setCombatStance={(stance) => setState(prev => {
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
          prestige={prestige}
          craftRune={craftRune}
          formatTime={formatTime}
        />
        ) : activeTab === 'warcamp' && (state.buildings.warcamp || 0) > 0 ? (
        <WarcampTab
          state={state}
          army={army}
          equipSlots={equipSlots}
          equipmentTiers={equipmentTiers}
          blacksmithItems={blacksmithItems}
          availableBlacksmithTiers={availableBlacksmithTiers}
          selectedBlacksmithTier={selectedBlacksmithTier}
          blacksmithItemsByTier={blacksmithItemsByTier}
          applyEquipSlot={applyEquipSlot}
          adjustEquip={adjustEquip}
          autoEquip={autoEquip}
          craftItem={craftItem}
          onSetCraftStep={(step) => setState(prev => ({
            ...prev,
            ui: { ...prev.ui, craftStep: step }
          }))}
          onSetBlacksmithTier={(tierId) => setState(prev => ({
            ...prev,
            ui: { ...prev.ui, blacksmithTier: tierId }
          }))}
        />
        ) : activeTab === 'rites' && state.unlocks.ash ? (
        <RitesTab
          state={state}
          patron={patron}
          ritesBuildings={ritesBuildings}
          choosePatron={choosePatron}
          devotePatron={devotePatron}
          startRitual={startRitual}
          chantRitual={chantRitual}
          buildRite={buildRite}
          getScaledCost={getScaledCost}
          onArcheryHit={handleArcheryHit}
          onArcheryMiss={handleArcheryMiss}
          onArcheryFinalHit={handleArcheryFinalHit}
          onArcherySuccess={() => setState(prev => finishRitual(prev, prev.religion.ritual, true, 'Ritual succeeded. The storm roars back.'))}
          onArcheryFail={() => setState(prev => finishRitual(prev, prev.religion.ritual, false, 'Ritual failed. The storm passes unanswered.'))}
        />
        ) : activeTab === 'travel' ? (
        <TravelTab
          state={state}
          travelPartyCap={travelPartyCap}
          onSetExpeditionSend={setExpeditionSend}
          onStartExpedition={startExpedition}
          build={build}
          getScaledCost={getScaledCost}
          getScale={getScale}
          applyWoodDiscount={applyWoodDiscount}
        />
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
  const buildingOrder = [
    'grasshut',
    'timberhall',
    'longhouse',
    'stonekeep',
    'storehouse',
    'smokehouse',
    'woodcuttershed',
    'masonryard',
    'smeltery',
    'granaryhall',
    'timberyard',
    'warcamp',
    'commander',
    'skaldhall',
    'ashaltar',
    'sewer'
  ];
  const orderIndex = new Map(buildingOrder.map((id, index) => [id, index]));
  Object.entries(buildings).forEach(([id, data]) => {
    const group = data.group || 'General';
    if (!groups[group]) groups[group] = [];
    groups[group].push({ id, data });
  });
  Object.keys(groups).forEach((group) => {
    groups[group].sort((a, b) => {
      const aIdx = orderIndex.has(a.id) ? orderIndex.get(a.id) : Number.MAX_SAFE_INTEGER;
      const bIdx = orderIndex.has(b.id) ? orderIndex.get(b.id) : Number.MAX_SAFE_INTEGER;
      if (aIdx !== bIdx) return aIdx - bIdx;
      return a.data.name.localeCompare(b.data.name);
    });
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
    if ((id === 'storehouse' || id === 'warcamp' || id === 'stonekeep' || id === 'skaldhall' || id === 'ashaltar' || id === 'granaryhall' || id === 'timberyard' || id === 'masonryard' || id === 'smeltery') && hasRequirements(state, data.requires)) {
      items[id] = data;
      return;
    }
  });

  Object.entries(upgrades).forEach(([id, data]) => {
    if (data.group === 'Innovation' && (state.upgrades[id] || 0) > 0) return;
    if (data.group === 'Innovation' && !unlocks.upgradesTier1) return;
    if (data.group === 'Innovation') {
      const innovationTier = data.tier || 1;
      const currentTier = unlocks.upgradesTier2 ? 2 : 1;
      if (innovationTier > currentTier) return;
    }
    if (data.group === 'Travel' && !unlocks.travel) return;
    if (!hasRequirements(state, data.requires)) return;
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
 * Convert travel upgrades into an expedition duration multiplier.
 * @param {object} state
 * @returns {number}
 */
function getTravelSpeedMult(state) {
  const longboats = state.upgrades?.longboats || 0;
  const sleds = state.upgrades?.icesleds || 0;
  const reduction = Math.min(0.7, longboats * 0.2 + sleds * 0.35);
  return Math.max(0.3, 1 - reduction);
}

/**
 * Maximum expedition party size for Travel missions.
 * Starts small and scales with travel tech.
 * @param {object} state
 * @returns {number}
 */
function getTravelPartyCap(state) {
  const longboats = state.upgrades?.longboats || 0;
  const sleds = state.upgrades?.icesleds || 0;
  return 10 + longboats * 5 + sleds * 10;
}

/**
 * Compute scaled costs based on owned count and scale factor.
 * @param {Record<string, number>} baseCost
 * @param {number} owned
 * @param {number} scale
 * @param {string} [itemId]
 * @returns {Record<string, number>}
 */
function getScaledCost(baseCost, owned, scale, itemId = '') {
  let factor = Math.pow(scale, owned);
  if (itemId === 'storehouse' && owned > 10) {
    // After level 10, storehouse costs ramp much harder to slow runaway cap scaling.
    factor = Math.pow(scale, 10) * Math.pow(1.55, owned - 10);
  }
  const scaled = {};
  Object.entries(baseCost).forEach(([key, value]) => {
    scaled[key] = Math.max(1, Math.round(value * factor));
  });
  return scaled;
}

/**
 * Apply a percentage discount to wood costs only.
 * @param {Record<string, number>} cost
 * @param {number} discount
 * @returns {Record<string, number>}
 */
function applyWoodDiscount(cost, discount) {
  if (!cost.wood || discount <= 0) return cost;
  return {
    ...cost,
    wood: Math.max(1, Math.round(cost.wood * (1 - discount)))
  };
}

/**
 * Build tooltip text for a build/upgrade item.
 * @param {object} data
 * @param {string} id
 * @param {number} owned
 * @param {object} state
 * @param {Record<string, number>} [scaledCost]
 * @param {Record<string, number>} [finalCost]
 * @returns {string}
 */
function getItemTooltipText(data, id, owned, state, scaledCost, finalCost) {
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
  if (id === 'granaryhall') {
    const reduction = Math.min(60, (state.buildings.granaryhall || 0) * 8);
    return `Famine buffer: reduces overcrowding food-drain penalties by 8% per level (current ${reduction}%).`;
  }
  if (id === 'timberyard') {
    const reduction = Math.min(35, (state.buildings.timberyard || 0) * 4);
    const before = scaledCost?.wood || 0;
    const after = finalCost?.wood || before;
    const saved = Math.max(0, before - after);
    return `Supply yard: reduces wood costs by 4% per level (current ${reduction}%). This purchase saves ${saved} wood.`;
  }
  if (id === 'masonryard') {
    const effectiveCap = Math.round((150 + (state.buildings.storehouse || 0) * 75));
    return `Raises stone storage by about ${effectiveCap} per level.`;
  }
  if (id === 'smeltery') {
    const effectiveCap = Math.round((150 + (state.buildings.storehouse || 0) * 75));
    return `Raises metal storage by about ${effectiveCap} per level.`;
  }
  if (id === 'ashaltar') {
    return 'Raises ash gain from battle by 15% and ash storage by 60 per level.';
  }
  if (id === 'warcamp') {
    const cap = getWarcampCap(state);
    return `Military camp: first level adds +1 warband slot, later levels add +2. Owned ${owned}/${cap} warcamps.`;
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
  if (id === 'storehouse' || id === 'smokehouse' || id === 'woodcuttershed' || id === 'masonryard' || id === 'smeltery' || id === 'sewer') return 'tint-storage';
  if (id === 'granaryhall' || id === 'timberyard') return 'tint-logistics';
  if (id === 'ashaltar') return 'tint-warcamp';
  if (id === 'warcamp') return 'tint-warcamp';
  if (id === 'skaldhall') return 'tint-skald';
  return '';
}

function getWarcampCap(state) {
  if ((state.upgrades.warlogistics2 || 0) > 0) return 15;
  if ((state.upgrades.warlogistics1 || 0) > 0) return 10;
  return 5;
}

/**
 * Compute net per-second resource change as displayed to the player.
 * Includes production minus recurring upkeep/consumption drains.
 * @param {object} state
 * @param {Record<string, number>} rates
 * @returns {Record<string, number>}
 */
function getResourceNetRates(state, rates) {
  const next = { ...rates };

  const logisticsBuildings = (state.buildings.ashaltar || 0)
    + (state.buildings.skaldhall || 0)
    + (state.buildings.stonekeep || 0)
    + (state.buildings.warcamp || 0);
  const storehouses = state.buildings.storehouse || 0;
  const logisticsFoodCost = logisticsBuildings * 0.2;
  const logisticsWoodCost = (state.buildings.masonryard || 0) * 0.08
    + (state.buildings.smeltery || 0) * 0.08
    + (state.buildings.ashaltar || 0) * 0.08
    + (state.buildings.stonekeep || 0) * 0.06
    + (state.buildings.skaldhall || 0) * 0.05
    + storehouses * 0.06;
  const logisticsStoneCost = storehouses * 0.05;
  const logisticsMetalCost = storehouses * 0.03;

  const foodNeed = (state.clansfolk.total || 0) * 0.25 * (state.world?.overcrowdingFoodMult || 1);

  next.food = (next.food || 0) - logisticsFoodCost - foodNeed;
  next.wood = (next.wood || 0) - logisticsWoodCost;
  if (state.unlocks.stone) next.stone = (next.stone || 0) - logisticsStoneCost;
  if (state.unlocks.metal) next.metal = (next.metal || 0) - logisticsMetalCost;

  return next;
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
  const logisticsPressure = state.world?.logisticsPressure || 0;
  if (logisticsPressure >= 0.2) {
    const outputPenalty = Math.max(0, (1 - Math.max(0.4, 1 - logisticsPressure * 0.6)) * 100);
    items.push({ text: `Logistics pressure cutting output by ${outputPenalty.toFixed(0)}%`, tone: logisticsPressure >= 0.45 ? 'danger' : 'warn' });
  }
  const overcrowding = state.world?.overcrowdingRatio || 0;
  if (overcrowding >= 0.95) {
    const overPct = Math.max(0, (overcrowding - 1) * 100);
    const growthPenalty = (state.world?.overcrowdingGrowthPenalty || 0) * 100;
    items.push({ text: `Overcrowding at ${overPct.toFixed(0)}% over cap (growth -${growthPenalty.toFixed(0)}%)`, tone: overcrowding >= 1.05 ? 'danger' : 'warn' });
  }
  return items.slice(0, 3);
}
