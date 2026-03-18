import React from 'react';
import { createHomeRegionMap } from '../data/homeRegionMap.js';

const map = createHomeRegionMap();

export default function TravelStatusPanel() {
  return (
    <section className="panel center-section travel-overlay-bottom travel-home-bottom">
      <h2>Tutorial POIs</h2>
      <div className="travel-poi-list">
        {map.pois.map((poi, index) => (
          <div key={poi.id} className="travel-poi-row">
            <div>
              <strong>{index + 1}. {poi.name}</strong>
              <span>{poi.detail}</span>
            </div>
            <span className={`poi-chip ${poi.tone}`}>{poi.tone === 'watchtower' ? 'Curiosity' : poi.tone === 'animal' ? 'Threat' : 'Human Threat'}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
