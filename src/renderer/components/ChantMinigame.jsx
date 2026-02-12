import React, { useEffect, useRef, useState } from 'react';
import chantBg from '../assets/minigame/backgrounds/cathredal.png';

export default function ChantMinigame({
  ritual,
  onChant,
  onFlashTier
}) {
  const ritualMeterRef = useRef(null);
  const ritualPointerRef = useRef(null);
  const flashTimeoutRef = useRef(null);
  const [flash, setFlash] = useState(false);
  const [tier, setTier] = useState(0);

  useEffect(() => () => {
    if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
  }, []);

  useEffect(() => {
    if (!ritual?.active || ritual.type !== 'chant') return undefined;
    const meterEl = ritualMeterRef.current;
    const pointerEl = ritualPointerRef.current;
    if (!meterEl || !pointerEl) return undefined;

    let rafId;
    const tick = () => {
      const meter = getRitualMeter(performance.now() / 1000, ritual);
      const maxX = meterEl.clientWidth || 1;
      const x = Math.max(0, Math.min(1, meter)) * maxX;
      pointerEl.style.transform = `translateX(${x}px)`;
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [ritual?.active, ritual?.startTime, ritual?.period, ritual?.bandCenter, ritual?.bandWidth, ritual?.type]);

  useEffect(() => {
    if (!ritual?.active || ritual.type !== 'chant') return;
    if (ritual.hits === 4 || ritual.hits === 8) {
      const nextTier = ritual.hits === 8 ? 2 : 1;
      setTier(nextTier);
      setFlash(true);
      if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
      flashTimeoutRef.current = setTimeout(() => setFlash(false), 350);
      onFlashTier?.(nextTier);
    }
  }, [ritual?.hits, ritual?.active, ritual?.type, onFlashTier]);

  return (
    <>
      <div className={`ritual-chant ${flash ? 'flash' : ''} tier-${tier}`}>
        <div className="ritual-chant-bg" style={{ backgroundImage: `url(${chantBg})` }} />
        <div className="ritual-chant-frame">
          <div className="ritual-chant-label">Chant Alignment</div>
          <div className="ritual-meter" ref={ritualMeterRef}>
            <div className="ritual-band" style={getRitualBandStyle(ritual)} />
            <div className="ritual-pointer" ref={ritualPointerRef} />
          </div>
        </div>
      </div>
      <button className="ghost mini" onClick={onChant}>
        Chant
      </button>
    </>
  );
}

function getRitualMeter(time, ritual) {
  const period = ritual?.period || 4;
  const phase = ((time - (ritual?.startTime || 0)) % period) / period;
  return phase <= 0.5 ? phase * 2 : (1 - phase) * 2;
}

function getRitualBandStyle(ritual) {
  const width = Math.max(0.05, Math.min(0.6, ritual?.bandWidth || 0.14));
  const left = Math.max(0, Math.min(1 - width, (ritual?.bandCenter || 0.5) - width / 2));
  return { width: `${width * 100}%`, left: `${left * 100}%` };
}
