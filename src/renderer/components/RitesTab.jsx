import React from 'react';
import { PATRONS, RITES_BUILDINGS } from '../data.js';
import { canAfford } from '../systems.js';
import ArrowDuelCanvas from './ArrowDuelCanvas.jsx';
import ChantMinigame from './ChantMinigame.jsx';

/**
 * Rites tab layout: patrons, ritual minigame, and rites buildings.
 */
export default function RitesTab({
  state,
  patron,
  ritesBuildings,
  choosePatron,
  devotePatron,
  startRitual,
  chantRitual,
  buildRite,
  getScaledCost,
  onArcheryHit,
  onArcheryMiss,
  onArcheryFinalHit,
  onArcherySuccess,
  onArcheryFail
}) {
  return (
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
                <ArrowDuelCanvas
                  resetToken={state.religion.ritual.startTime}
                  onHit={onArcheryHit}
                  onMiss={onArcheryMiss}
                  onFinalHit={onArcheryFinalHit}
                  onSuccess={onArcherySuccess}
                  onFail={onArcheryFail}
                />
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
              {(ritesBuildings || Object.entries(RITES_BUILDINGS).map(([id, data]) => ({ id, ...data }))).map(item => {
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
  );
}
