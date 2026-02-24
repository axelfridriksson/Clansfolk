import React from 'react';
import { PATRONS } from '../data.js';

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
  startFight,
  stopFight,
  scout,
  setCombatStance,
  prestige,
  craftRune,
  formatTime
}) {
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
            <button className="secondary" onClick={scout}>Scout</button>
            <button className="ghost" onClick={stopFight} disabled={!state.world.fighting}>Retreat</button>
          </div>
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
