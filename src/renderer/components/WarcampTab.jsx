import React from 'react';
import stillBg from '../assets/images/Still.png';
import { BLACKSMITH_ITEMS } from '../data.js';
import { getUnlockedWarbandRoles, ROLE_ORDER, WARBAND_ROLES } from '../combat/roles.js';
import { canAfford } from '../systems.js';

/**
 * Warcamp tab layout: roster/equipment center, blacksmith right.
 */
export default function WarcampTab({
  state,
  army,
  equipSlots,
  equipmentTiers,
  blacksmithItems,
  availableBlacksmithRoles,
  selectedBlacksmithRole,
  availableBlacksmithTiers,
  selectedBlacksmithTier,
  blacksmithItemsByTier,
  applyEquipSlot,
  adjustEquip,
  autoEquip,
  craftItem,
  onSetCraftStep,
  onSetBlacksmithRole,
  onSetBlacksmithTier,
  setWarbandRole
}) {
  const meleeCount = state.warband?.roles?.melee || 0;
  const meleeCoverage = meleeCount > 0
    ? Math.round((Object.values(state.equipment).reduce((sum, count) => sum + count, 0) / (meleeCount * 3)) * 100)
    : 0;
  const unlockedRoles = getUnlockedWarbandRoles(state);
  const roleCapacity = state.warband?.roles?.[selectedBlacksmithRole] || 0;
  const roleSummary = ROLE_ORDER.map((id) => ({
    id,
    label: WARBAND_ROLES[id].label,
    count: state.warband?.roles?.[id] || 0,
    unlocked: unlockedRoles.includes(id)
  }));

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
            <div className="warband-doctrine">
              <div>
                <div className="doctrine-title">Current Doctrine</div>
                <div className="doctrine-name">Melee Line</div>
              </div>
              <div className="doctrine-meta">
                <span>Frontline generalists</span>
                <strong>{meleeCount} melee</strong>
              </div>
            </div>
            <div className="equipment-summary">
              {equipSlots.map(({ id: slot, label }) => {
                const equippedItems = Object.entries(state.equipment)
                  .filter(([id, count]) => {
                    const item = BLACKSMITH_ITEMS[id];
                    return item && item.role === selectedBlacksmithRole && item.slot === slot && count > 0;
                  })
                  .map(([id, count]) => `${BLACKSMITH_ITEMS[id].name} x${count}`);
                const equippedCount = Object.entries(state.equipment).reduce((sum, [id, count]) => {
                  const item = BLACKSMITH_ITEMS[id];
                  if (!item || item.role !== selectedBlacksmithRole || item.slot !== slot) return sum;
                  return sum + count;
                }, 0);
                const fill = roleCapacity > 0 ? Math.min(100, (equippedCount / roleCapacity) * 100) : 0;
                return (
                  <div key={slot} className="equipment-summary-row">
                    <span className="summary-label">{label}</span>
                    <span className="summary-value">{equippedItems.length ? equippedItems.join(', ') : 'None'}</span>
                    <span className="summary-count">{equippedCount}/{roleCapacity}</span>
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
                      return item && item.role === selectedBlacksmithRole ? { id, ...item } : null;
                    })
                    .filter(Boolean);
                  if (tierItems.length === 0) return null;
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
                            if (!equipItem || equipItem.role !== item.role || equipItem.slot !== item.slot) return sum;
                            return sum + count;
                          }, 0);
                          const slotRemaining = Math.max(0, roleCapacity - equippedInSlot);
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
            <div className="roster-summary-row">
              <span>Role mix</span>
              <strong>Melee x{meleeCount}</strong>
              <span>Kit coverage {meleeCoverage}%</span>
            </div>
            <div className="role-pill-row">
              {roleSummary.map((role) => (
                <span key={role.id} className={`role-pill ${role.count > 0 ? 'active' : 'inactive'} ${role.unlocked ? '' : 'locked'}`}>
                  {role.label} x{role.count}
                </span>
              ))}
            </div>
            <div className="role-composition">
              <div className="stat-label">Composition</div>
              <div className="role-composition-list">
                {roleSummary.map((role) => {
                  const lockedReason = role.unlocked ? null : `${role.label} unlocks later`;
                  const editable = role.unlocked && role.id !== 'melee';
                  return (
                    <div key={`comp-${role.id}`} className={`role-row ${role.unlocked ? '' : 'locked'}`}>
                      <div>
                        <div className="role-row-title">{role.label}</div>
                        <div className="role-row-meta">{WARBAND_ROLES[role.id].job}</div>
                      </div>
                      <div className="role-row-actions">
                        <button
                          className="ghost mini"
                          onClick={() => setWarbandRole(role.id, -1)}
                          disabled={!editable || role.count <= 0 || state.world.fighting}
                        >
                          −
                        </button>
                        <strong>{role.count}</strong>
                        <button
                          className="mini"
                          onClick={() => setWarbandRole(role.id, 1)}
                          disabled={!editable || state.world.fighting}
                        >
                          +
                        </button>
                      </div>
                      <div className="role-row-note">{lockedReason || (role.id === 'melee' ? 'Current baseline warband role. Shift units out of melee when other roles unlock.' : 'Shift units from melee into this role.')}</div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="roster-grid roster-backdrop" style={{ backgroundImage: `url(${stillBg})` }}>
              <div className="roster-dots melee-field">
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
                      className={`roster-dot melee ${index % 4 === 0 ? 'shield' : ''}`}
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
              <span>Role</span>
              <div className="assign-buttons">
                {availableBlacksmithRoles.map((roleId) => (
                  <button
                    key={roleId}
                    className={`mini ${selectedBlacksmithRole === roleId ? 'selected' : ''}`}
                    onClick={() => onSetBlacksmithRole(roleId)}
                  >
                    {WARBAND_ROLES[roleId].label}
                  </button>
                ))}
              </div>
            </div>
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
            <div className="blacksmith-role-summary">
              <div className="stat-label">{WARBAND_ROLES[selectedBlacksmithRole].label} Kit</div>
              <div className="cost">{WARBAND_ROLES[selectedBlacksmithRole].job}</div>
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
      </div>
    </>
  );
}
