import React from 'react';
import { PATRONS } from '../data.js';
import { ROLE_ORDER, WARBAND_ROLES } from '../combat/roles.js';

/**
 * Overview tab layout: world state center and interpretation/meta right column.
 */
export default function OverviewTab({
  state,
  zoneName,
  zoneProgress,
  blocker,
  logisticsTooltipText,
  overcrowdingTooltipText,
  logisticsPressure,
  overcrowdingTone,
  overcrowdingDangerLevel,
  crowdFillPercent,
  scene,
  army,
  forecast,
  combatTimes,
  scoutReport,
  recommendedBattlePlan,
  cycleName,
  cycleTime,
  modifiers,
  forecasts,
  milestones,
  runeDefs,
  ritesBuildings,
  patron,
  showTooltip,
  hideTooltip,
  setWarbandSend,
  scoutSend,
  setScoutSend,
  startFight,
  advanceFight,
  stopFight,
  scout,
  setCombatStance,
  setBattlePlan,
  prestige,
  craftRune,
  formatTime
}) {
  const encounterVisual = getEncounterVisual(state, army);
  const battlePlans = [
    { id: 'hold', label: 'Hold Line', desc: 'Trade speed for staying power.' },
    { id: 'press', label: 'Press Forward', desc: 'Push harder and take more losses.' },
    { id: 'volley', label: 'Volley First', desc: 'Lean on bowmen for the opening clash.' }
  ];

  return (
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
          <div
            className="logistics-center-row"
            onMouseEnter={(event) => showTooltip(logisticsTooltipText, event.currentTarget.getBoundingClientRect())}
            onMouseLeave={hideTooltip}
          >
            <span>Logistics Pressure</span>
            <strong>{Math.round(logisticsPressure * 100)}%</strong>
          </div>
          <div
            className={`logistics-center-row overcrowding ${overcrowdingTone}`}
            style={{ '--danger-level': overcrowdingDangerLevel }}
            onMouseEnter={(event) => showTooltip(overcrowdingTooltipText, event.currentTarget.getBoundingClientRect())}
            onMouseLeave={hideTooltip}
          >
            <span>Overcrowding</span>
            <strong>{crowdFillPercent}% full</strong>
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
                        onChange={(event) => setWarbandSend(Math.max(1, Number(event.target.value || 1)))}
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
            <div className="combat-scene-hud">
              <div>
                <div className="combat-scene-title">{encounterVisual.title}</div>
                <div className="combat-scene-subtitle">{encounterVisual.subtitle}</div>
              </div>
              <div className={`combat-scene-threat ${encounterVisual.threatTone}`}>{encounterVisual.threatText}</div>
            </div>
            <div className="combat-ground combat-ground-back" />
            <div className="combat-ground combat-ground-front" />
            <div className="combat-scene-actors">
              <div className="combat-rank allies">
                {encounterVisual.allies.map((unit, index) => (
                  <span
                    key={`ally-${unit.role}-${index}`}
                    className={`fighter ally ${unit.role} ${index > 0 ? `delay-${Math.min(index, 2)}` : ''}`}
                    style={{ left: `${unit.offset}%` }}
                  />
                ))}
              </div>
              <div className="combat-rank enemies">
                {encounterVisual.enemies.map((unit, index) => (
                  <span
                    key={`enemy-${unit.role}-${index}`}
                    className={`fighter enemy ${unit.role} ${index > 0 ? `delay-${Math.min(index, 2)}` : ''}`}
                    style={{ right: `${unit.offset}%` }}
                  />
                ))}
              </div>
            </div>
            <div className="combat-scene-footer">
              <span>{encounterVisual.weather}</span>
              <span>{encounterVisual.front}</span>
              <span>{encounterVisual.stepText}</span>
            </div>
          </div>
          <div className="combat-row">
            <div className="combat-label">Enemy Group</div>
            <div className="combat-value">
              <strong>{state.world.enemyForceLabel || 'hostile group'}</strong>
              <span className="combat-inline-meta">{Math.round(state.world.enemyHP)} / {state.world.enemyHPMax} HP · ATK {state.world.enemyAtk.toFixed(1)}</span>
              <span className="enemy-count">Enemy {state.world.enemyIndex || 1} of {state.world.enemiesPerZone || 5}</span>
            </div>
          </div>
          {!!state.world.enemyTraits?.length && (
            <div className="combat-tags">
              <span className="combat-tag">{state.world.enemyName || 'Hostile'} x{state.world.enemyCount || 1}</span>
              {state.world.enemyTraits.map(trait => (
                <span key={trait} className="combat-tag">{trait}</span>
              ))}
            </div>
          )}
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
          <div className="combat-tags">
            {ROLE_ORDER
              .filter((roleId) => (army.roleStats?.[roleId]?.count || 0) > 0)
              .map((roleId) => (
                <span key={roleId} className="combat-tag">
                  {roleId} x{army.roleStats?.[roleId]?.currentCount ?? army.roleStats?.[roleId]?.count ?? 0}
                </span>
              ))}
            <span className="combat-tag">matchup x{army.matchup.toFixed(2)}</span>
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
          <div className="combat-role-health">
            {ROLE_ORDER
              .filter((roleId) => (army.roleStats?.[roleId]?.count || 0) > 0)
              .map((roleId) => {
                const role = army.roleStats?.[roleId];
                const health = state.warband?.health?.[roleId] || { hp: 0, hpMax: 0 };
                const fill = health.hpMax > 0 ? (health.hp / health.hpMax) * 100 : 0;
                return (
                  <div key={roleId} className="combat-role-health-row">
                    <div className="combat-role-health-head">
                      <span>{role.currentCount} / {role.count} {WARBAND_ROLES[roleId]?.label || roleId}</span>
                      <span>{health.hp.toFixed(1)} / {health.hpMax.toFixed(1)} HP</span>
                    </div>
                    <div className="bar role">
                      <div style={{ width: `${Math.max(0, Math.min(100, fill))}%` }} />
                    </div>
                  </div>
                );
              })}
          </div>

          <div className={`forecast ${forecast.tone}`}>{forecast.text}</div>
          {!!scoutReport?.length && (
            <div className="combat-scout">
              <div className="combat-scout-title">
                Scout Read
                {state.world.scouting?.quality && (
                  <span className="combat-scout-quality">{formatScoutQuality(state.world.scouting.quality)}</span>
                )}
              </div>
              <div className="combat-scout-list">
                {scoutReport.map((line) => (
                  <div key={line} className="combat-scout-line">{line}</div>
                ))}
              </div>
            </div>
          )}
          <div className="combat-times">
            <span>TTK {combatTimes.ttk}s</span>
            <span>TTL {combatTimes.ttl}s</span>
          </div>
          <div className={`combat-outcome ${combatTimes.outcomeTone}`}>{combatTimes.outcomeText}</div>
          {state.world.combatState === 'victory' && state.world.lastVictory && (
            <div className="combat-resolution">
              <div className="combat-resolution-title">{state.world.lastVictory.enemyName} broken</div>
              <div className="combat-resolution-loot">
                <span>+{state.world.lastVictory.food} food</span>
                <span>+{state.world.lastVictory.wood} wood</span>
                {state.world.lastVictory.stone > 0 && <span>+{state.world.lastVictory.stone} stone</span>}
                {state.world.lastVictory.metal > 0 && <span>+{state.world.lastVictory.metal} metal</span>}
                {state.world.lastVictory.ash > 0 && <span>+{state.world.lastVictory.ash} ash</span>}
                {state.world.lastVictory.knowledge > 0 && <span>+{state.world.lastVictory.knowledge} knowledge</span>}
              </div>
              {!!Object.keys(state.world.lastVictory.losses || {}).length && (
                <div className="combat-resolution-losses">
                  {ROLE_ORDER
                    .filter((roleId) => (state.world.lastVictory.losses?.[roleId] || 0) > 0)
                    .map((roleId) => (
                      <span key={roleId}>-{state.world.lastVictory.losses[roleId]} {WARBAND_ROLES[roleId]?.label || roleId}</span>
                    ))}
                </div>
              )}
            </div>
          )}
          {state.world.combatState === 'defeat' && state.world.lastDefeat && (
            <div className="combat-resolution defeat">
              <div className="combat-resolution-title">Warband broken by {state.world.lastDefeat.enemyName}</div>
              {!!Object.keys(state.world.lastDefeat.losses || {}).length && (
                <div className="combat-resolution-losses">
                  {ROLE_ORDER
                    .filter((roleId) => (state.world.lastDefeat.losses?.[roleId] || 0) > 0)
                    .map((roleId) => (
                      <span key={roleId}>-{state.world.lastDefeat.losses[roleId]} {WARBAND_ROLES[roleId]?.label || roleId}</span>
                    ))}
                </div>
              )}
            </div>
          )}
          <div className="combat-actions">
            <button onClick={state.world.combatState === 'victory' ? advanceFight : startFight} disabled={state.world.fighting || state.clansfolk.army <= 0}>
              {state.world.combatState === 'victory' ? 'Advance' : 'Fight'}
            </button>
            <button className="secondary" onClick={scout} disabled={state.world.scouting?.active || state.world.fighting || state.clansfolk.army <= 0}>Scout</button>
            <button className="ghost" onClick={stopFight} disabled={!state.world.fighting}>Retreat</button>
          </div>
          <div className="combat-scout-controls">
            <span>Scout Party</span>
            <div className="assign-buttons">
              {[1, 3, 5].map((size) => (
                <button
                  key={size}
                  className={`mini ${scoutSend === size ? 'selected' : ''}`}
                  onClick={() => setScoutSend(size)}
                  disabled={state.world.scouting?.active || size > (state.warband?.roles?.melee || 0)}
                >
                  {size}
                </button>
              ))}
            </div>
            <span>Melee available {state.warband?.roles?.melee || 0}</span>
            {state.world.scouting?.active && (
              <strong>Returning in {Math.ceil(state.world.scouting.timeLeft)}s</strong>
            )}
          </div>
          <div className="combat-plan">
            {battlePlans.map((plan) => (
              <button
                key={plan.id}
                className={`mini ${state.ui?.battlePlan === plan.id ? 'selected' : ''}`}
                onClick={() => setBattlePlan(plan.id)}
              >
                {plan.label}
              </button>
            ))}
          </div>
          <div className="combat-plan-desc">
            {battlePlans.find((plan) => plan.id === (state.ui?.battlePlan || 'hold'))?.desc}
          </div>
          {recommendedBattlePlan && (
            <div className="combat-plan-recommendation">
              <strong>Recommended:</strong> {recommendedBattlePlan.label} - {recommendedBattlePlan.reason}
            </div>
          )}
          <div className="combat-stance">
            {['aggressive', 'balanced', 'defensive'].map(stance => (
              <button
                key={stance}
                className={`mini ${state.ui.combatStance === stance ? 'selected' : ''}`}
                onClick={() => setCombatStance(stance)}
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
  );
}

function formatScoutQuality(quality) {
  if (quality === 'full') return 'precise';
  if (quality === 'mid') return 'partial';
  return 'rough';
}

function getEncounterVisual(state, army) {
  const zone = Math.max(1, state.world.zone || 1);
  const enemyIndex = Math.max(1, state.world.enemyIndex || 1);
  const enemiesPerZone = Math.max(1, state.world.enemiesPerZone || 1);
  const threat = state.world.enemyAtk / Math.max(1, army.atk);
  const themes = [
    { title: 'Rime Raiders', subtitle: 'fast skirmish line', weather: 'Crosswind', front: 'Loose formation', roles: ['raider', 'raider', 'skirmish'] },
    { title: 'Broken Shieldwall', subtitle: 'disciplined hold', weather: 'Cold rain', front: 'Shield pressure', roles: ['shield', 'shield', 'brute'] },
    { title: 'Frostpack', subtitle: 'animal rush', weather: 'Frost drift', front: 'Beast surge', roles: ['beast', 'beast', 'raider'] },
    { title: 'Ashbound Scouts', subtitle: 'embers and hooks', weather: 'Ash gusts', front: 'Harrier screen', roles: ['skirmish', 'raider', 'skirmish'] },
    { title: 'Grave Guard', subtitle: 'slow crushing advance', weather: 'Still air', front: 'Heavy pressure', roles: ['brute', 'shield', 'shield'] }
  ];
  const theme = themes[(zone + enemyIndex - 1) % themes.length];
  const allyCount = Math.max(1, Math.min(5, Object.values(army.roleStats || {}).reduce((sum, role) => sum + (role.currentCount || 0), 0)));
  const enemyCount = Math.max(1, Math.min(5, state.world.enemyCount || (2 + ((zone + enemyIndex) % 3))));
  const allyRoles = getAllyRoles(army, state.ui?.combatStance || 'balanced', allyCount);
  const enemyRoles = Array.from({ length: enemyCount }, (_, index) => theme.roles[index % theme.roles.length]);

  return {
    title: theme.title,
    subtitle: theme.subtitle,
    weather: theme.weather,
    front: theme.front,
    stepText: `Encounter ${enemyIndex} / ${enemiesPerZone}`,
    threatText: threat >= 1.1 ? 'High threat' : threat >= 0.75 ? 'Even clash' : 'Press advantage',
    threatTone: threat >= 1.1 ? 'danger' : threat >= 0.75 ? 'warn' : 'good',
    allies: buildFormation(allyRoles, 'ally'),
    enemies: buildFormation(enemyRoles, 'enemy')
  };
}

function getAllyRoles(army, stance, count) {
  const pool = [];
  const roleMap = {
    melee: 'raider',
    bowmen: 'skirmish',
    horsemen: 'raider',
    spearmen: 'shield',
    heavy: 'brute'
  };
  ROLE_ORDER.forEach((roleId) => {
    const currentCount = army.roleStats?.[roleId]?.currentCount || 0;
    const visualCount = Math.max(0, Math.min(5, currentCount));
    for (let i = 0; i < visualCount; i += 1) {
      pool.push(roleMap[roleId] || 'raider');
    }
  });
  if (pool.length === 0) return ['shield'];
  const ordered = orderAllyRolesByStance(pool, stance);
  return ordered.slice(0, count);
}

function orderAllyRolesByStance(roles, stance) {
  const order = stance === 'aggressive'
    ? ['brute', 'raider', 'shield', 'skirmish']
    : stance === 'defensive'
      ? ['shield', 'brute', 'raider', 'skirmish']
      : ['shield', 'raider', 'brute', 'skirmish'];
  return [...roles].sort((a, b) => order.indexOf(a) - order.indexOf(b));
}

function buildFormation(roles, side) {
  const offsets = side === 'ally'
    ? [12, 20, 30, 40, 50]
    : [12, 22, 34, 46, 58];
  return roles.map((role, index) => ({ role, offset: offsets[index] || (12 + index * 10) }));
}
