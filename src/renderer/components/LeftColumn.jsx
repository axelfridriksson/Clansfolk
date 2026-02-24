import React, { useEffect, useMemo, useRef, useState } from 'react';
import { JOBS, UPGRADES } from '../data.js';

/**
 * Left column with resources, jobs, buildings, and automation placeholder.
 */
export default function LeftColumn({
  state,
  caps,
  rates,
  netRates,
  resourceOrder,
  formatShort,
  isResourceUnlocked,
  maxTrimps,
  totalAssigned,
  assignStep,
  setAssignStep,
  assign,
  sendArmy,
  recallArmy,
  isJobUnlocked,
  buildingGroups,
  getScaledCost,
  getScale,
  applyWoodDiscount,
  getBuildingTintClass,
  showTooltip,
  hideTooltip,
  getItemTooltipText,
  build,
  onToggleLeaderTask,
  onSetBuildCategory
}) {
  const easingEnabled = state.ui?.counterEasing !== false;
  const [displayResources, setDisplayResources] = useState(() => ({ ...state.resources }));
  const [buildStep, setBuildStep] = useState(1);
  const displayRef = useRef({ ...state.resources });
  const targetRef = useRef({ ...state.resources });
  const rafRef = useRef(0);
  const animatingRef = useRef(false);
  const startLoopRef = useRef(() => {});
  const lastFrameRef = useRef(0);
  const frameAccumulatorRef = useRef(0);
  const resourceKeys = useMemo(() => resourceOrder.filter(key => isResourceUnlocked(state, key)), [resourceOrder, state.unlocks]);
  const resourceKeySignature = useMemo(() => resourceKeys.join('|'), [resourceKeys]);
  const [buildCategory, setBuildCategory] = useState(() => normalizeBuildCategory(state.ui?.buildCategory));

  useEffect(() => {
    setBuildCategory(normalizeBuildCategory(state.ui?.buildCategory));
  }, [state.ui?.buildCategory]);

  useEffect(() => {
    const fixedStep = 1 / 30;
    const smoothing = 12;
    const epsilon = 0.001;
    const tick = (timestamp) => {
      if (!animatingRef.current) return;
      if (document.hidden) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      const last = lastFrameRef.current || timestamp;
      let dt = (timestamp - last) / 1000;
      lastFrameRef.current = timestamp;
      if (!Number.isFinite(dt) || dt < 0) dt = 0;
      dt = Math.min(0.1, dt);
      frameAccumulatorRef.current += dt;

      let changed = false;
      while (frameAccumulatorRef.current >= fixedStep) {
        frameAccumulatorRef.current -= fixedStep;
        const next = { ...displayRef.current };
        resourceKeys.forEach((key) => {
          const target = targetRef.current[key] || 0;
          const current = next[key] || 0;
          let value = target;
          if (easingEnabled) {
            const alpha = 1 - Math.exp(-smoothing * fixedStep);
            value = current + (target - current) * alpha;
            if (Math.abs(target - value) < epsilon) value = target;
          }
          if (value !== current) {
            next[key] = value;
            changed = true;
          }
        });
        displayRef.current = next;
      }

      if (changed) {
        const snapshot = displayRef.current;
        setDisplayResources((prev) => {
          let hasDiff = false;
          const next = { ...prev };
          resourceKeys.forEach((key) => {
            const value = snapshot[key] || 0;
            if (Math.abs((prev[key] || 0) - value) >= epsilon) {
              next[key] = value;
              hasDiff = true;
            }
          });
          return hasDiff ? next : prev;
        });
      }
      const stillAnimating = resourceKeys.some((key) => {
        const target = targetRef.current[key] || 0;
        const current = displayRef.current[key] || 0;
        return Math.abs(target - current) >= epsilon;
      });
      if (stillAnimating) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        animatingRef.current = false;
        rafRef.current = 0;
        lastFrameRef.current = 0;
        frameAccumulatorRef.current = 0;
      }
    };

    startLoopRef.current = () => {
      if (animatingRef.current) return;
      animatingRef.current = true;
      rafRef.current = requestAnimationFrame(tick);
    };

    return () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
      animatingRef.current = false;
      lastFrameRef.current = 0;
      frameAccumulatorRef.current = 0;
    };
  }, [resourceKeySignature, easingEnabled]);

  useEffect(() => {
    targetRef.current = { ...targetRef.current, ...state.resources };
    Object.keys(state.resources).forEach((key) => {
      if (displayRef.current[key] === undefined) {
        displayRef.current[key] = state.resources[key] || 0;
      }
    });

    if (!easingEnabled) {
      displayRef.current = { ...displayRef.current, ...state.resources };
      setDisplayResources((prev) => {
        let hasDiff = false;
        const next = { ...prev };
        resourceKeys.forEach((key) => {
          const value = state.resources[key] || 0;
          if (next[key] !== value) {
            next[key] = value;
            hasDiff = true;
          }
        });
        return hasDiff ? next : prev;
      });
      return;
    }

    const hasDrift = resourceKeys.some((key) => {
      const target = targetRef.current[key] || 0;
      const current = displayRef.current[key] || 0;
      return Math.abs(target - current) >= 0.001;
    });
    if (hasDrift) {
      startLoopRef.current();
    }
  });

  return (
    <div className="left-column">
      <section className="panel section">
        <h2>Resources</h2>
        <div className="resource-list">
          {resourceKeys
            .map((key) => {
              const value = state.resources[key] || 0;
              const shownValue = displayResources[key] ?? value;
              const baseRate = rates[key] || 0;
              const rate = netRates?.[key] ?? baseRate;
              const isCapped = value >= caps[key];
              const waste = Math.max(0, baseRate);
              const isLeaderTask = state.ui.leaderTask === key;
              const leaderLabel = isLeaderTask ? ' (Leader +2/s)' : '';
              return (
                <div key={key} className={`resource-card ${isCapped ? 'capped' : ''}`}>
                  <div className="resource-row">
                    <strong>{key.toUpperCase()}</strong>
                    <strong className="resource-cap">{formatCounter(shownValue)} / {formatCounter(caps[key])} storage</strong>
                  </div>
                  <div className="resource-row meta">
                    <span className={isCapped ? 'waste' : ''}>
                      {isCapped && baseRate > 0
                        ? `Waste ${formatRate(waste)} /s`
                        : `${rate >= 0 ? '+' : ''}${formatRate(rate)} /s${leaderLabel}`}
                    </span>
                    <span className="storage-meta"></span>
                    {key !== 'ash' && (
                      <button
                        className={`mini ${isLeaderTask ? 'selected' : ''}`}
                        onClick={() => onToggleLeaderTask(key, isLeaderTask)}
                      >
                        {isLeaderTask ? 'Leading' : 'Lead'}
                      </button>
                    )}
                  </div>
                  <div className="resource-bar">
                    <div style={{ width: `${Math.min(100, (shownValue / Math.max(1, caps[key])) * 100)}%` }} />
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
        <div className={`growth-bar ${state.world?.populationDeclining ? 'declining' : ''}`}>
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
        <div className="assign-step build-filter-row">
          <span>View</span>
          <select
            className="build-filter-select"
            value={buildCategory}
            onChange={(event) => {
              const nextCategory = normalizeBuildCategory(event.target.value);
              setBuildCategory(nextCategory);
              onSetBuildCategory(nextCategory);
            }}
          >
            <option value="all">All</option>
            <option value="housing">Housing</option>
            <option value="storage">Storage</option>
            <option value="logistics">Logistics</option>
            <option value="war">War</option>
            <option value="knowledge">Knowledge</option>
            <option value="ash">Ash</option>
            <option value="innovation">Innovation</option>
            <option value="travel">Travel</option>
          </select>
        </div>
        <div className="assign-step">
          <span>Buy</span>
          <div className="assign-buttons">
            <button className={`mini ${buildStep === 1 ? 'selected' : ''}`} onClick={() => setBuildStep(1)}>x1</button>
            <button className={`mini ${buildStep === 5 ? 'selected' : ''}`} onClick={() => setBuildStep(5)}>x5</button>
            <button className={`mini ${buildStep === 10 ? 'selected' : ''}`} onClick={() => setBuildStep(10)}>x10</button>
            <button className={`mini ${buildStep === 'max' ? 'selected' : ''}`} onClick={() => setBuildStep('max')}>Max</button>
          </div>
        </div>
        <div className="buildings-list">
          {(() => {
            const selectedCategory = buildCategory;
            const groups = Object.entries(buildingGroups);
            const visibleGroups = selectedCategory === 'all'
              ? groups
              : [[getBuildCategoryLabel(selectedCategory), groups
                .flatMap(([, items]) => items)
                .filter(({ id, data }) => getBuildCategory(id, Boolean(UPGRADES[id]), data) === selectedCategory)]];

            return visibleGroups.map(([group, items]) => {
              if (!items.length) return null;
              return (
                <details className="build-group" key={group} open>
                  <summary>{group}</summary>
                  <div className="build-group-items">
                    {items.map(({ id, data }) => {
                      const isUpgrade = Boolean(UPGRADES[id]);
                      const owned = isUpgrade ? (state.upgrades[id] || 0) : (state.buildings[id] || 0);
                      const scaledCost = getScaledCost(data.cost, owned, getScale(isUpgrade, data.group, data), id);
                      const timberYardDiscount = Math.min(0.35, (state.buildings.timberyard || 0) * 0.04);
                      const finalCost = applyWoodDiscount(scaledCost, timberYardDiscount);
                      const purchasePreview = getPurchasePreview({
                        state,
                        id,
                        data,
                        isUpgrade,
                        buildStep,
                        getScaledCost,
                        getScale,
                        applyWoodDiscount,
                        getWarcampCap
                      });
                      const previewCost = purchasePreview.count > 0 ? purchasePreview.totalCost : finalCost;
                      const tintClass = !isUpgrade ? getBuildingTintClass(id) : '';
                      const costEntries = Object.entries(previewCost);
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
                            <span className="owned">
                              {isUpgrade ? 'Level' : 'Owned'} {owned}
                              {!isUpgrade && id === 'warcamp' && ` / ${getWarcampCap(state)} cap`}
                            </span>
                            <span
                              className="tooltip-target"
                              onMouseEnter={(event) => showTooltip(
                                getItemTooltipText(data, id, owned, state, scaledCost, finalCost),
                                event.currentTarget.getBoundingClientRect()
                              )}
                              onMouseLeave={hideTooltip}
                            >
                              <button
                                className="ghost mini"
                                onClick={() => build(id, buildStep)}
                                disabled={purchasePreview.count < 1 || (!isUpgrade && id === 'warcamp' && owned >= getWarcampCap(state))}
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
              );
            });
          })()}
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
  );
}

function formatCounter(value) {
  if (!Number.isFinite(value)) return '0';
  const abs = Math.abs(value);
  const units = [
    { limit: 1e15, suffix: 'q' },
    { limit: 1e12, suffix: 't' },
    { limit: 1e9, suffix: 'b' },
    { limit: 1e6, suffix: 'm' },
    { limit: 1e3, suffix: 'k' }
  ];
  for (const unit of units) {
    if (abs >= unit.limit) {
      const scaled = value / unit.limit;
      const text = Math.abs(scaled) >= 100 ? scaled.toFixed(0) : scaled.toFixed(1);
      return `${text}${unit.suffix}`;
    }
  }
  if (abs >= 100) return value.toFixed(1);
  return value.toFixed(2);
}

function formatRate(value) {
  const abs = Math.abs(value);
  if (abs >= 100) return value.toFixed(0);
  if (abs >= 10) return value.toFixed(1);
  return value.toFixed(2);
}

function getWarcampCap(state) {
  if ((state.upgrades?.warlogistics2 || 0) > 0) return 15;
  if ((state.upgrades?.warlogistics1 || 0) > 0) return 10;
  return 5;
}

function getBuildCategory(id, isUpgrade, data) {
  if (isUpgrade) {
    if (data.group === 'Innovation') return 'innovation';
    if (data.group === 'Travel') return 'travel';
    return 'all';
  }
  if (id === 'grasshut' || id === 'timberhall' || id === 'longhouse' || id === 'stonekeep') return 'housing';
  if (id === 'storehouse' || id === 'smokehouse' || id === 'woodcuttershed' || id === 'masonryard' || id === 'smeltery' || id === 'sewer') return 'storage';
  if (id === 'granaryhall' || id === 'timberyard') return 'logistics';
  if (id === 'warcamp' || id === 'commander') return 'war';
  if (id === 'skaldhall') return 'knowledge';
  if (id === 'ashaltar') return 'ash';
  return 'all';
}

function getBuildCategoryLabel(category) {
  const labels = {
    housing: 'Housing',
    storage: 'Storage',
    logistics: 'Logistics',
    war: 'War',
    knowledge: 'Knowledge',
    ash: 'Ash',
    innovation: 'Innovation',
    travel: 'Travel'
  };
  return labels[category] || 'All';
}

function normalizeBuildCategory(category) {
  const value = typeof category === 'string' ? category.toLowerCase().trim() : 'all';
  const allowed = new Set(['all', 'housing', 'storage', 'logistics', 'war', 'knowledge', 'ash', 'innovation', 'travel']);
  return allowed.has(value) ? value : 'all';
}

function getPurchasePreview({
  state,
  id,
  data,
  isUpgrade,
  buildStep,
  getScaledCost,
  getScale,
  applyWoodDiscount,
  getWarcampCap
}) {
  const target = buildStep === 'max' ? Number.MAX_SAFE_INTEGER : Math.max(1, Number(buildStep) || 1);
  const oneTimeInnovation = isUpgrade && data.group === 'Innovation';
  let owned = isUpgrade ? (state.upgrades[id] || 0) : (state.buildings[id] || 0);
  const wallet = { ...state.resources };
  const totalCost = {};
  let count = 0;
  while (count < target) {
    if (!isUpgrade && id === 'warcamp' && owned >= getWarcampCap(state)) break;
    if (oneTimeInnovation && owned > 0) break;
    const scaledCost = getScaledCost(data.cost, owned, getScale(isUpgrade, data.group, data), id);
    const timberYardDiscount = Math.min(0.35, (state.buildings.timberyard || 0) * 0.04);
    const finalCost = applyWoodDiscount(scaledCost, timberYardDiscount);
    if (!canAffordResources(wallet, finalCost)) break;
    Object.entries(finalCost).forEach(([key, value]) => {
      wallet[key] = Math.max(0, (wallet[key] || 0) - value);
      totalCost[key] = (totalCost[key] || 0) + value;
    });
    owned += 1;
    count += 1;
    if (oneTimeInnovation) break;
  }
  return { count, totalCost };
}

function canAffordResources(resources, cost) {
  return Object.entries(cost).every(([key, value]) => (resources[key] || 0) >= value);
}
