import React from 'react';

export default function TravelPlanningPanel({ focusCell }) {
  const locationLabel = focusCell?.poi?.name || (focusCell?.zone === 'settlement' ? 'Settlement Core' : focusCell?.zone === 'settlement-edge' ? 'Settlement Edge' : 'Outer Wilds');
  const locationDetail = focusCell?.poi?.detail || (focusCell?.terrain === 'shore-water' || focusCell?.terrain === 'deep-water'
    ? 'The shoreline blocks further movement.'
    : focusCell?.blocked
      ? 'Dense ground or rock blocks the path.'
      : 'Safe enough to scout, but farther from home.');

  return (
    <aside className="travel-overlay-left travel-home-sidebar">
      <section className="panel center-section travel-overlay-card">
        <h2>Home Region</h2>
        <div className="travel-row">
          <span>Start Point</span>
          <strong>Coastal Settlement</strong>
        </div>
        <div className="travel-row">
          <span>Direction of Travel</span>
          <strong>North inland</strong>
        </div>
        <div className="travel-row">
          <span>Early Goal</span>
          <strong>Leave home and scout</strong>
        </div>
      </section>

      <section className="panel center-section travel-overlay-card">
        <h2>Controls</h2>
        <div className="travel-notes">
          <p>`WASD` or arrow keys move the leader one step at a time.</p>
          <p>The shoreline is blocked. Trees and ridge tiles shape the route north.</p>
          <p>The current slice is about movement and map feel, not full interaction yet.</p>
        </div>
      </section>

      <section className="panel center-section travel-overlay-card">
        <h2>Current Tile</h2>
        <div className="travel-row">
          <span>Location</span>
          <strong>{locationLabel}</strong>
        </div>
        <div className="travel-notes">
          <p>{locationDetail}</p>
        </div>
      </section>
    </aside>
  );
}
