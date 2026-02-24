import React from 'react';

/**
 * Top header with title, tabs, resource chips, and settings.
 */
export default function AppHeader({
  state,
  tabs,
  activeTab,
  formatShort,
  isResourceUnlocked,
  onTabChange,
  prestige,
  hardRestart,
  setStage,
  toggleTutorial,
  toggleDevMode,
  onDevAddAsh,
  onToggleLowFx
}) {
  return (
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
              onClick={() => onTabChange(tab.id)}
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
            <button className="ghost" onClick={onDevAddAsh}>Dev: +200 Ash</button>
            <button className="ghost" onClick={toggleTutorial}>
              {state.tutorial.enabled ? 'Disable Tutorial' : 'Enable Tutorial'}
            </button>
            <button className="ghost" onClick={toggleDevMode}>
              {state.dev.showAll ? 'Disable Dev Mode' : 'Enable Dev Mode'}
            </button>
            <button className="ghost" onClick={onToggleLowFx}>
              {state.ui?.lowFx ? 'Disable Low FX' : 'Enable Low FX'}
            </button>
          </div>
        </details>
      </div>
    </header>
  );
}
