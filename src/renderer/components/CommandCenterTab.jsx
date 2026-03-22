import React from 'react';
import { COMMANDER_CHARTERS, COMMANDER_DEFS, COMMANDER_RARITIES, getCommanderBonusPreview } from '../commanders/data.js';
import { BUILDINGS } from '../data.js';
import { canAfford } from '../systems.js';

export default function CommandCenterTab({ state, army, setActiveCommander, recruitCommander, build, getScaledCost, getScale, applyWoodDiscount }) {
  const commanderLevel = state.buildings.commander || 0;
  const warcampLevel = state.buildings.warcamp || 0;
  const commandCapacity = state.clansfolk.maxArmy || 0;
  const activeForces = Object.entries(state.warband?.roles || {}).filter(([, count]) => count > 0).length;
  const unlocked = commanderLevel > 0;
  const ownedIds = state.command?.ownedIds || [];
  const activeId = state.command?.activeId || null;
  const roster = ownedIds.map((id) => COMMANDER_DEFS[id]).filter(Boolean);
  const activeCommander = activeId ? COMMANDER_DEFS[activeId] : null;
  const activeBonuses = getCommanderBonusPreview(activeCommander);
  const commanderDef = BUILDINGS.commander;
  const scaledCost = getScaledCost(
    commanderDef.cost,
    commanderLevel,
    getScale(false, commanderDef.group, commanderDef),
    'commander'
  );
  const woodDiscount = Math.min(0.35, (state.buildings.timberyard || 0) * 0.04);
  const finalCost = applyWoodDiscount(scaledCost, woodDiscount);
  const canBuildCommander = canAfford(state, finalCost);

  return (
    <>
      <div className="center-column">
        <section className="panel center-section warcamp-overview">
          <div className="placeholder-title">Command Center</div>
          <div className="warcamp-stats">
            <div>
              <div className="stat-label">Commander Post</div>
              <div className="stat-value">{unlocked ? `Level ${commanderLevel}` : 'Not built'}</div>
            </div>
            <div>
              <div className="stat-label">Command Seals</div>
              <div className="stat-value">{state.command?.seals || 0}</div>
            </div>
            <div>
              <div className="stat-label">Warband Capacity</div>
              <div className="stat-value">{state.clansfolk.army} / {commandCapacity}</div>
            </div>
            <div>
              <div className="stat-label">Active Force Roles</div>
              <div className="stat-value">{activeForces}</div>
            </div>
          </div>
          <div className="placeholder-subtitle">
            Commander's Post effect: +1 warband slot per level. Current bonus: +{commanderLevel}.
          </div>
        </section>

        <section className="panel center-section">
          <h2>Commander</h2>
          {unlocked ? (
            <div className="command-card">
              <div className="stat-label">Assigned Commander</div>
              <div className="command-hero">
                <div className="command-avatar" />
                <div>
                  <div className="command-name">{activeCommander?.name || 'None Assigned'}</div>
                  <div className="command-title">
                    {activeCommander ? `${COMMANDER_RARITIES[activeCommander.rarity]?.label || activeCommander.rarity} ${activeCommander.role} commander` : 'No active commander'}
                  </div>
                  <div className="command-traits">
                    {activeCommander ? (
                      <>
                        <span>Might {activeCommander.stats.might}</span>
                        <span>Guard {activeCommander.stats.guard}</span>
                        <span>Command {activeCommander.stats.command}</span>
                      </>
                    ) : (
                      <span>No commander bonuses active</span>
                    )}
                  </div>
                </div>
              </div>
              {!!activeCommander?.traits?.length && (
                <div className="command-traits">
                  {activeCommander.traits.map((trait) => (
                    <span key={trait}>{trait}</span>
                  ))}
                </div>
              )}
              {!!activeBonuses.length && (
                <div className="command-traits">
                  {activeBonuses.map((bonus) => (
                    <span key={bonus}>{bonus}</span>
                  ))}
                </div>
              )}
              <div className="command-actions">
                <button className="ghost mini" disabled>Commander Gear</button>
                <button className="ghost mini" disabled>Archive Commander</button>
              </div>
            </div>
          ) : (
            <div className="command-card">
              <div className="stat-label">Locked</div>
              <div className="placeholder-subtitle">
                Build the `Commander's Post` to unlock commanders, command traits, and later battle formations.
              </div>
              <div className="build-meta">
                <strong>{commanderDef.name}</strong>
                <div className="role-row-meta">{commanderDef.desc}</div>
                <div className="cost">
                  {Object.entries(finalCost).map(([key, value]) => (
                    <span key={key}>{key} {value}</span>
                  ))}
                </div>
              </div>
              <div className="command-actions">
                <button className="mini" onClick={() => build('commander')} disabled={!canBuildCommander}>
                  Build Commander's Post
                </button>
              </div>
            </div>
          )}
        </section>
      </div>

      <div className="right-column">
        <section className="panel section">
          <h2>Commander Roster</h2>
          {unlocked ? (
            <div className="role-composition-list">
              {roster.map((commander) => (
                <div key={commander.id} className={`role-row ${commander.id === activeId ? 'selected' : ''}`}>
                  <div>
                    <div className="role-row-title">{commander.name}</div>
                    <div className="role-row-meta">
                      {COMMANDER_RARITIES[commander.rarity]?.label || commander.rarity} · {commander.role} · Might {commander.stats.might} / Guard {commander.stats.guard} / Command {commander.stats.command}
                    </div>
                  </div>
                  <div className="role-row-actions">
                    <button
                      className="mini"
                      onClick={() => setActiveCommander(commander.id)}
                      disabled={commander.id === activeId}
                    >
                      {commander.id === activeId ? 'Active' : 'Assign'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="placeholder-subtitle">Commander roster unlocks when the Commander's Post is built.</div>
          )}
        </section>

        <section className="panel section">
          <h2>Recruitment</h2>
          {unlocked ? (
            <div className="role-composition-list">
              {Object.values(COMMANDER_CHARTERS).map((charter) => (
                <div key={charter.id} className="role-row">
                  <div>
                    <div className="role-row-title">{charter.label}</div>
                    <div className="role-row-meta">
                      {charter.cost} Command Seals · {charter.minRarity}+ commander
                    </div>
                  </div>
                  <div className="role-row-actions">
                    <button
                      className="mini"
                      onClick={() => recruitCommander(charter.id)}
                      disabled={(state.command?.seals || 0) < charter.cost}
                    >
                      Open
                    </button>
                  </div>
                </div>
              ))}
              {state.command?.lastRecruit && (
                <div className="command-card">
                  <div className="stat-label">Last Recruitment</div>
                  <div className="command-name">{state.command.lastRecruit.name}</div>
                  <div className="command-title">
                    {state.command.lastRecruit.duplicate
                      ? `${state.command.lastRecruit.rarity} duplicate · +${state.command.lastRecruit.refund} seals`
                      : `${state.command.lastRecruit.rarity} ${state.command.lastRecruit.role} commander`}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="placeholder-subtitle">Recruitment unlocks when the Commander's Post is built.</div>
          )}
        </section>

        <section className="panel section">
          <h2>Command Read</h2>
          <div className="mod-group">
            <div className="mod-row">
              <span>Warcamp Level</span>
              <span className="mod-value">{warcampLevel}</span>
            </div>
            <div className="mod-row">
              <span>Commander Post</span>
              <span className="mod-value">{commanderLevel}</span>
            </div>
            <div className="mod-row">
              <span>Warband Attack</span>
              <span className="mod-value">{army.atk.toFixed(1)}</span>
            </div>
          </div>
        </section>

        <section className="panel section">
          <h2>Planned Systems</h2>
          <div className="placeholder-subtitle">
            This tab is the home for commanders, traits, formations, command upgrades, and later large-force deployment.
          </div>
          <div className="role-composition-list">
            <div className="role-row">
              <div>
                <div className="role-row-title">Commander Roster</div>
                <div className="role-row-meta">Recruit, assign, and retire commanders.</div>
              </div>
            </div>
            <div className="role-row">
              <div>
                <div className="role-row-title">Battle Orders</div>
                <div className="role-row-meta">Attach plan bonuses and formation doctrine to specific commanders.</div>
              </div>
            </div>
            <div className="role-row">
              <div>
                <div className="role-row-title">Late-Game Deployment</div>
                <div className="role-row-meta">Large-force grid combat belongs here, not in the early warcamp flow.</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
