import React, { useEffect, useMemo, useState } from 'react';
import stillBg from './assets/images/Still.png';
import frozenBg from './assets/images/Frozen.png';
import hellBg from './assets/images/hellvibes.png';
import { BUILDINGS, JOBS, UPGRADES } from './data.js';
import { SAVE_KEY, START_STATE } from './models.js';
import { calcCaps, calcRates, getArmyStats, canAfford, applyCost, loadSave, mergeSave, totalJobs } from './systems.js';
import { simulateTick } from './sim.js';

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

  const caps = useMemo(() => calcCaps(state), [state.buildings]);
  const rates = useMemo(() => calcRates(state), [state.jobs, state.buildings, state.perks]);
  const army = useMemo(() => getArmyStats(state), [state.clansfolk, state.jobs, state.perks]);

  useEffect(() => {
    const interval = setInterval(() => {
      setState(prev => simulateTick(prev, 0.25));
    }, 250);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const saveInterval = setInterval(() => {
      localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    }, 6000);
    return () => clearInterval(saveInterval);
  }, [state]);

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
  const cycleName = 'The Turning';
  const cycleTime = formatTime(state.time);
  const modifiers = getWorldModifiers(state);
  const forecasts = getForecasts(state, caps, rates);
  const milestones = getMilestones(state);
  const scene = getCombatScene(state, zoneProgress);
  const enemyAtk = state.world.enemyAtk;

  function pushLog(line) {
    setState(prev => ({ ...prev, log: [line, ...prev.log].slice(0, 40) }));
  }

  function assign(job, delta) {
    setState(prev => {
      const next = { ...prev, jobs: { ...prev.jobs }, clansfolk: { ...prev.clansfolk } };
      if (delta > 0 && next.clansfolk.idle < delta) return prev;
      if (delta < 0 && next.jobs[job] < Math.abs(delta)) return prev;
      next.jobs[job] += delta;
      next.clansfolk.idle -= delta;
      return next;
    });
  }

  function build(type) {
    const config = BUILDINGS[type] || UPGRADES[type];
    setState(prev => {
      const isUpgrade = Boolean(UPGRADES[type]);
      if (isUpgrade && config.requires && !prev.upgrades[config.requires]) return prev;
      const owned = isUpgrade ? (prev.upgrades[type] || 0) : (prev.buildings[type] || 0);
      const scaledCost = getScaledCost(config.cost, owned, getScale(isUpgrade, config.group));
      if (!canAfford(prev, scaledCost)) return prev;
      const unlockOnce = ['stoneworking', 'mining', 'ashgathering', 'lorekeeping', 'forgeSteelsword', 'forgeIronshield'];
      if (isUpgrade && unlockOnce.includes(type) && owned > 0) return prev;
      const next = {
        ...prev,
        buildings: { ...prev.buildings },
        upgrades: { ...prev.upgrades },
        resources: applyCost(prev, scaledCost)
      };
      if (isUpgrade) {
        if (type === 'forgeSteelsword') {
          next.unlocks = { ...next.unlocks, steelSwords: true };
          next.upgrades.woodsword = 0;
          pushLog('Wood Swords reforged into Steel Swords.');
        } else if (type === 'forgeIronshield') {
          next.unlocks = { ...next.unlocks, ironShields: true };
          next.upgrades.woodshield = 0;
          pushLog('Wood Shields reforged into Iron Shields.');
        } else if (type === 'stoneworking') {
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
          pushLog('Knowledge can now be gathered.');
        } else {
          next.upgrades[type] = (next.upgrades[type] || 0) + 1;
          pushLog(`${config.name} upgraded.`);
        }
      } else {
        next.buildings[type] += 1;
        pushLog(`${config.name} constructed.`);
      }
      return next;
    });
  }

  function startFight() {
    setState(prev => {
      if (prev.clansfolk.army <= 0) return prev;
      return { ...prev, world: { ...prev.world, fighting: true } };
    });
  }

  function stopFight() {
    setState(prev => ({ ...prev, world: { ...prev.world, fighting: false } }));
  }

  function sendArmy() {
    setState(prev => {
      const next = { ...prev, clansfolk: { ...prev.clansfolk } };
      if (next.clansfolk.idle <= 0) return prev;
      const space = next.clansfolk.maxArmy - next.clansfolk.army;
      if (space <= 0) return prev;
      const reserve = 2;
      const available = Math.max(0, next.clansfolk.total - reserve);
      const add = Math.min(space, next.clansfolk.idle, available);
      if (add <= 0) return prev;
      next.clansfolk.army += add;
      next.clansfolk.total = Math.max(0, next.clansfolk.total - add);
      next.clansfolk.idle = Math.max(0, next.clansfolk.total - totalJobs(next.jobs));
      const stats = getArmyStats(next);
      next.clansfolk.armyHPMax = stats.hp;
      next.clansfolk.armyHP = stats.hp;
      return next;
    });
  }

  function recallArmy() {
    setState(prev => {
      const next = { ...prev, clansfolk: { ...prev.clansfolk } };
      if (next.clansfolk.army <= 0) return prev;
      next.clansfolk.total += next.clansfolk.army;
      next.clansfolk.idle = Math.max(0, next.clansfolk.total - totalJobs(next.jobs));
      next.clansfolk.army = 0;
      next.clansfolk.armyHP = 0;
      next.clansfolk.armyHPMax = 0;
      return next;
    });
  }

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

  function showTooltip(text, rect) {
    const padding = 12;
    const width = 520;
    const left = Math.min(window.innerWidth - width - padding, rect.right + padding);
    const top = Math.min(window.innerHeight - 80, rect.top);
    setTooltip({ text, left: Math.max(padding, left), top: Math.max(padding, top), width });
  }

  function hideTooltip() {
    setTooltip(null);
  }

  function hardRestart() {
    localStorage.removeItem(SAVE_KEY);
    window.location.reload();
  }

  function toggleTutorial() {
    setState(prev => ({
      ...prev,
      tutorial: { ...prev.tutorial, enabled: !prev.tutorial.enabled }
    }));
  }

  function setStage(stage) {
    const stageState = getStageState(stage);
    localStorage.setItem(SAVE_KEY, JSON.stringify(stageState));
    window.location.reload();
  }

  return (
    <>
      <header>
        <div>
          <h1>Clansfolk Prototype</h1>
          <div className="meta">Zone {state.world.zone} · Remnants {state.perks.remnants} · {Math.floor(state.time)}s</div>
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
              <button className="ghost" onClick={toggleTutorial}>
                {state.tutorial.enabled ? 'Disable Tutorial' : 'Enable Tutorial'}
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
              {Object.entries(state.resources)
                .filter(([key]) => isResourceUnlocked(state, key))
                .map(([key, value]) => {
                const rate = rates[key] || 0;
                const isCapped = value >= caps[key];
                const waste = Math.max(0, rate);
                const isLeaderTask = state.ui.leaderTask === key;
                const leaderLabel = isLeaderTask ? ' (Leader +2/s)' : '';
                return (
                  <div key={key} className={`resource-card ${isCapped ? 'capped' : ''}`}>
                    <div className="resource-row">
                      <strong>{key.toUpperCase()}</strong>
                      <strong className="resource-cap">{Math.floor(value)} / {caps[key]}</strong>
                    </div>
                    <div className="resource-row meta">
                      <span className={isCapped ? 'waste' : ''}>
                        {isCapped ? `Waste ${waste.toFixed(2)} /s` : `+${rate.toFixed(2)} /s${leaderLabel}`}
                      </span>
                      <button
                        className={`mini ${isLeaderTask ? 'selected' : ''}`}
                        onClick={() => setState(prev => ({
                          ...prev,
                          ui: { ...prev.ui, leaderTask: isLeaderTask ? null : key }
                        }))}
                      >
                        {isLeaderTask ? 'Leading' : 'Lead'}
                      </button>
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
                return (
                  <div className="job-row" key={key}>
                    <div className="job-header">
                      <span>{job.name} {assigned}</span>
                      <div className="job-controls">
                        <button className="ghost mini" onClick={() => assign(key, -1)} disabled={assigned < 1}>−</button>
                        <button className="mini" onClick={() => assign(key, 1)} disabled={state.clansfolk.idle < 1}>+</button>
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
            <h2>Buildings & Upgrades</h2>
            <div className="buildings-list">
              {Object.entries(buildingGroups).map(([group, items]) => (
                <details className="build-group" key={group} open>
                  <summary>{group}</summary>
                  <div className="build-group-items">
                    {items.map(({ id, data }) => {
                      const isUpgrade = Boolean(UPGRADES[id]);
                      const owned = isUpgrade ? (state.upgrades[id] || 0) : (state.buildings[id] || 0);
                      const scaledCost = getScaledCost(data.cost, owned, getScale(isUpgrade, data.group));
                      return (
                      <div className="build-row" key={id}>
                        <div>
                          <strong>{data.name}</strong>
                          <div className="cost">Cost: {Object.entries(scaledCost).map(([r, v]) => `${v} ${r}`).join(', ')}</div>
                        </div>
                        <div className="build-actions">
                          <span className="owned">{isUpgrade ? 'Level' : 'Owned'} {owned}</span>
                          <span
                            className="tooltip-target"
                            onMouseEnter={(event) => showTooltip(
                              `${data.detail || data.desc}${data.unlocks ? ` • Unlocks: ${data.unlocks}` : ''}`,
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
          </section>

          <section className="panel center-section combat-summary">
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
                {Math.round(state.world.enemyHP)} / {state.world.enemyHPMax} · ATK {state.world.enemyAtk.toFixed(1)} · {state.world.enemyIndex || 1}/{state.world.enemiesPerZone || 5}
              </div>
            </div>
            <div className="bar enemy">
              <div style={{ width: `${(state.world.enemyHP / state.world.enemyHPMax) * 100}%` }} />
            </div>

            <div className="combat-row">
              <div className="combat-label">Warband</div>
              <div className="combat-value">{state.clansfolk.armyHP.toFixed(1)} / {state.clansfolk.armyHPMax.toFixed(1)} HP · {army.atk.toFixed(1)} ATK</div>
            </div>
            <div className="bar">
              <div style={{ width: `${Math.min(100, (state.clansfolk.armyHP / Math.max(1, state.clansfolk.armyHPMax)) * 100)}%` }} />
            </div>

            <div className={`forecast ${forecast.tone}`}>{forecast.text}</div>
            <div className="combat-actions">
              <button onClick={startFight} disabled={state.world.fighting || state.clansfolk.army <= 0}>Fight</button>
              <button className="secondary" onClick={() => pushLog('Scouted the zone.')}>Scout</button>
              <button className="ghost" onClick={stopFight} disabled={!state.world.fighting}>Retreat</button>
            </div>
          </section>

          <section className="panel center-section prestige-awareness">
            <div className="cycle-row">
              <div>
                <div className="cycle-title">{cycleName}</div>
                <div className="cycle-time">Cycle Time {cycleTime}</div>
              </div>
              <button className="warn" onClick={prestige} disabled={state.world.zone < 10}>Ascend</button>
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
              <span>Next Memory</span>
              <strong>{Math.max(0, 10 - state.world.zone)} zones</strong>
            </div>
            <div className="meta-effects">
              <div className="meta-title">Active Effects</div>
              <div className="meta-effect">Production x{state.perks.prodMult.toFixed(2)}</div>
              <div className="meta-effect">Attack x{state.perks.atkMult.toFixed(2)}</div>
            </div>
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

function groupBuildings(buildings) {
  const groups = {};
  Object.entries(buildings).forEach(([id, data]) => {
    const group = data.group || 'General';
    if (!groups[group]) groups[group] = [];
    groups[group].push({ id, data });
  });
  return groups;
}

function getVisibleItems(buildings, upgrades, state) {
  const items = {};
  const unlocks = state.unlocks;

  Object.entries(buildings).forEach(([id, data]) => {
    if (id === 'grasshut') {
      items[id] = data;
      return;
    }
    if ((id === 'timberhall' || id === 'storehouse' || id === 'smokehouse') && unlocks.buildingsTier1) {
      items[id] = data;
      return;
    }
    if (id === 'longhouse' && unlocks.buildingsTier2) {
      items[id] = data;
      return;
    }
    if (id === 'stonekeep' && unlocks.buildingsTier3) {
      items[id] = data;
      return;
    }
  });

  Object.entries(upgrades).forEach(([id, data]) => {
    const isForgeUpgrade = id === 'forgeSteelsword' || id === 'forgeIronshield';
    if (data.group !== 'Weapons' && (state.upgrades[id] || 0) > 0) return;
    if (data.group === 'Weapons' && !unlocks.weapons) return;
    if (data.group === 'Upgrades' && !unlocks.upgradesTier1 && !isForgeUpgrade) return;
    if (data.group === 'Travel' && !unlocks.travel) return;
    if (data.cost.knowledge && !unlocks.knowledge && id !== 'lorekeeping') return;
    if (id === 'steelsword' && !unlocks.steelSwords) return;
    if (id === 'woodsword' && unlocks.steelSwords) return;
    if (id === 'ironshield' && !unlocks.ironShields) return;
    if (id === 'woodshield' && unlocks.ironShields) return;
    if (id === 'forgeSteelsword' && (!unlocks.weapons || unlocks.steelSwords || (state.upgrades.woodsword || 0) < 10)) return;
    if (id === 'forgeIronshield' && (!unlocks.weapons || unlocks.ironShields || (state.upgrades.woodshield || 0) < 10)) return;
    if (data.requires && !state.upgrades[data.requires]) return;
    if (data.group === 'Upgrades' && !unlocks.upgradesTier2) {
      const tier2 = ['steelhooks', 'fellingaxes'];
      if (tier2.includes(id)) return;
    }
    items[id] = data;
  });

  return items;
}

function getScale(isUpgrade, group) {
  if (!isUpgrade) return 1.08;
  if (group === 'Weapons') return 1.15;
  if (group === 'Travel') return 1.2;
  return 1.12;
}

function getScaledCost(baseCost, owned, scale) {
  const factor = Math.pow(scale, owned);
  const scaled = {};
  Object.entries(baseCost).forEach(([key, value]) => {
    scaled[key] = Math.max(1, Math.round(value * factor));
  });
  return scaled;
}

function isResourceUnlocked(state, key) {
  if (key === 'food' || key === 'wood') return true;
  return Boolean(state.unlocks[key]);
}

function isJobUnlocked(state, jobKey) {
  if (jobKey === 'forager' || jobKey === 'woodcutter') return true;
  if (jobKey === 'quarry') return state.unlocks.stone;
  if (jobKey === 'smelter') return state.unlocks.metal;
  if (jobKey === 'ashwalker') return state.unlocks.ash;
  if (jobKey === 'lorekeeper') return state.unlocks.knowledge;
  return true;
}


function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
}

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
  return base;
}

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

function getZoneProgress(state) {
  const enemies = state.world.enemiesPerZone || 1;
  const idx = Math.max(1, state.world.enemyIndex || 1);
  const current = 1 - state.world.enemyHP / Math.max(1, state.world.enemyHPMax);
  return Math.min(1, (idx - 1 + current) / enemies);
}

function getCombatScene(state, zoneProgress) {
  if (!state.world.fighting) return stillBg;
  if (zoneProgress > 0.75 && state.world.zone >= 6) return hellBg;
  if (state.world.zone <= 3) return frozenBg;
  return stillBg;
}

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
