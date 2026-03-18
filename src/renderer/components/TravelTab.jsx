import React from 'react';

export default function TravelTab() {
  return (
    <div className="panel" style={{ padding: 24 }}>
      <div className="section-title">Travel</div>
      <div className="muted" style={{ marginTop: 12, lineHeight: 1.6 }}>
        Travel prototype work has been archived to `travel/travel_code/`.
      </div>
      <div className="muted" style={{ marginTop: 8, lineHeight: 1.6 }}>
        This tab is intentionally parked so the main game can move forward without the travel renderer and map systems attached to the live UI.
      </div>
    </div>
  );
}
