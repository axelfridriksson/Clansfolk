import React, { useEffect, useRef, useState } from 'react';
import { UPGRADES } from '../data.js';
import { canAfford } from '../systems.js';

/**
 * Travel tab with expedition planning and status.
 */
export default function TravelTab({
  state,
  travelPartyCap,
  onSetExpeditionSend,
  onStartExpedition,
  build,
  getScaledCost,
  getScale,
  applyWoodDiscount
}) {
  const mapRef = useRef(null);
  const canvasRef = useRef(null);
  const dragRef = useRef(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);

  const expedition = state.world?.expedition || { active: false, type: null, timeLeft: 0, duration: 0, party: 0 };
  const army = state.clansfolk.army || 0;
  const sendCap = Math.max(1, Math.min(army, travelPartyCap || 10));
  const send = Math.max(1, Math.min(sendCap, state.ui?.expeditionSend || 1));
  const activePct = expedition.active && expedition.duration > 0
    ? Math.max(0, Math.min(100, ((expedition.duration - expedition.timeLeft) / expedition.duration) * 100))
    : 0;

  const canStart = !expedition.active && !state.world.fighting && army > 0;

  function clampPan(nextPan) {
    const mapEl = mapRef.current;
    const canvasEl = canvasRef.current;
    if (!mapEl || !canvasEl) return nextPan;
    const minX = Math.min(0, mapEl.clientWidth - canvasEl.offsetWidth);
    const minY = Math.min(0, mapEl.clientHeight - canvasEl.offsetHeight);
    return {
      x: Math.max(minX, Math.min(0, nextPan.x)),
      y: Math.max(minY, Math.min(0, nextPan.y))
    };
  }

  function centerMap() {
    const mapEl = mapRef.current;
    const canvasEl = canvasRef.current;
    if (!mapEl || !canvasEl) return;
    const minX = Math.min(0, mapEl.clientWidth - canvasEl.offsetWidth);
    const minY = Math.min(0, mapEl.clientHeight - canvasEl.offsetHeight);
    setPan({
      x: minX / 2,
      y: minY / 2
    });
  }

  useEffect(() => {
    centerMap();
    window.addEventListener('resize', centerMap);
    return () => window.removeEventListener('resize', centerMap);
  }, []);

  const travelUpgrades = ['longboats', 'icesleds']
    .filter((id) => {
      const data = UPGRADES[id];
      if (!data) return false;
      if (data.requires) {
        if (Array.isArray(data.requires)) return data.requires.every((req) => (state.upgrades?.[req] || 0) > 0 || (state.buildings?.[req] || 0) > 0);
        return (state.upgrades?.[data.requires] || 0) > 0 || (state.buildings?.[data.requires] || 0) > 0;
      }
      return true;
    })
    .map((id) => {
      const data = UPGRADES[id];
      const owned = state.upgrades?.[id] || 0;
      const scaledCost = getScaledCost(data.cost, owned, getScale(true, data.group, data), id);
      const timberYardDiscount = Math.min(0.35, (state.buildings.timberyard || 0) * 0.04);
      const finalCost = applyWoodDiscount(scaledCost, timberYardDiscount);
      return { id, data, owned, finalCost, affordable: canAfford(state, finalCost) };
    });

  return (
    <div className="travel-overlay-screen panel">
      <div className="travel-map-stage">
        <div
          ref={mapRef}
          className={`travel-map ${dragging ? 'dragging' : ''}`}
          onPointerDown={(event) => {
            if (event.button !== 0) return;
            dragRef.current = {
              id: event.pointerId,
              startX: event.clientX,
              startY: event.clientY,
              originX: pan.x,
              originY: pan.y
            };
            event.currentTarget.setPointerCapture(event.pointerId);
            setDragging(true);
          }}
          onPointerMove={(event) => {
            if (!dragRef.current || dragRef.current.id !== event.pointerId) return;
            const dx = event.clientX - dragRef.current.startX;
            const dy = event.clientY - dragRef.current.startY;
            setPan(clampPan({
              x: dragRef.current.originX + dx,
              y: dragRef.current.originY + dy
            }));
          }}
          onPointerUp={(event) => {
            if (dragRef.current?.id === event.pointerId) {
              dragRef.current = null;
              setDragging(false);
            }
          }}
          onPointerCancel={(event) => {
            if (dragRef.current?.id === event.pointerId) {
              dragRef.current = null;
              setDragging(false);
            }
          }}
        >
          <div
            ref={canvasRef}
            className="travel-map-canvas"
            style={{ transform: `translate(${Math.round(pan.x)}px, ${Math.round(pan.y)}px)` }}
          >
            <div className="map-node home">Settlement</div>
            <div className="map-node scout">Scout Route</div>
            <div className="map-node salvage">Salvage Site</div>
            <div className="map-node embers">Ash Field</div>
          </div>
        </div>
      </div>

      <aside className="travel-overlay-left">
        <section className="panel center-section travel-overlay-card">
          <h2>Party Planning</h2>
          <div className="travel-row">
            <span>Warband Ready</span>
            <strong>{army}</strong>
          </div>
          <div className="travel-row">
            <span>Travel Party Cap</span>
            <strong>{travelPartyCap}</strong>
          </div>
          <div className="travel-row">
            <span>Expedition Size</span>
            <strong>{send}</strong>
          </div>
          <div className="assign-step">
            <span>Send</span>
            <div className="assign-buttons">
              <button className={`mini ${send === 1 ? 'selected' : ''}`} onClick={() => onSetExpeditionSend(1)} disabled={army < 1}>x1</button>
              <button className={`mini ${send === Math.min(5, sendCap) ? 'selected' : ''}`} onClick={() => onSetExpeditionSend(5)} disabled={army < 1}>x5</button>
              <button className={`mini ${send === Math.min(10, sendCap) ? 'selected' : ''}`} onClick={() => onSetExpeditionSend(10)} disabled={army < 1}>x10</button>
              <button className={`mini ${(state.ui?.expeditionSend || 1) >= sendCap && army > 0 ? 'selected' : ''}`} onClick={() => onSetExpeditionSend('max')} disabled={army < 1}>Max</button>
            </div>
          </div>
        </section>

        <section className="panel center-section travel-overlay-card">
          <h2>Travel Upgrades</h2>
          <div className="buildings-list">
            {travelUpgrades.map(({ id, data, owned, finalCost, affordable }) => (
              <div className="build-row" key={id}>
                <div className="build-info">
                  <div className="item-title"><strong>{data.name}</strong></div>
                  <div className="cost">{Object.entries(finalCost).map(([r, v]) => `${v} ${r}`).join(', ')}</div>
                </div>
                <div className="build-actions">
                  <span className="owned">Level {owned}</span>
                  <button className="ghost mini" onClick={() => build(id, 1)} disabled={!affordable}>Upgrade</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </aside>

      <section className="panel center-section travel-overlay-bottom">
        <h2>Expedition Control</h2>
        <div className="travel-status">
          <div className="travel-row">
            <span>State</span>
            <strong>{expedition.active ? `Running (${expedition.type === 'salvage' ? 'raid' : expedition.type})` : 'Idle'}</strong>
          </div>
          <div className="travel-row">
            <span>Party</span>
            <strong>{expedition.active ? expedition.party : send} clansfolk</strong>
          </div>
          <div className="travel-row">
            <span>Time Left</span>
            <strong>{expedition.active ? `${Math.ceil(expedition.timeLeft)}s` : '—'}</strong>
          </div>
          <div className="resource-bar travel-progress">
            <div style={{ width: `${activePct}%` }} />
          </div>
        </div>
        <div className="grid grid-3">
          <button className="ghost" onClick={() => onStartExpedition('scout')} disabled={!canStart}>Scout</button>
          <button className="ghost" onClick={() => onStartExpedition('salvage')} disabled={!canStart}>Raid</button>
          <button className="ghost" onClick={() => onStartExpedition('embers')} disabled={!canStart || !state.unlocks.ash}>Embers</button>
        </div>
      </section>
    </div>
  );
}
