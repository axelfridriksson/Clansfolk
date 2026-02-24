import React from 'react';
import stillBg from '../assets/images/Still.png';
import { BLACKSMITH_ITEMS } from '../data.js';
import { canAfford } from '../systems.js';

/**
 * Warcamp tab layout: roster/equipment center, blacksmith/command right.
 */
export default function WarcampTab({
  state,
  army,
  equipSlots,
  equipmentTiers,
  blacksmithItems,
  availableBlacksmithTiers,
  selectedBlacksmithTier,
  blacksmithItemsByTier,
  applyEquipSlot,
  adjustEquip,
  autoEquip,
  craftItem,
  onSetCraftStep,
  onSetBlacksmithTier
}) {
  return (
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
                    onClick={() => onSetCraftStep(step)}
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
                    onClick={() => onSetBlacksmithTier(tier.id)}
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
  );
}
