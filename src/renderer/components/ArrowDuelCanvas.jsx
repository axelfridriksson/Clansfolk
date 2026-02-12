import React, { useEffect, useRef, useState } from 'react';
import shooterIdle from '../assets/minigame/characters/vikingastuff2.png';
import shooterIdleAlt from '../assets/minigame/characters/vikingastuff2 copy.png';
import shooterAim1 from '../assets/minigame/characters/vikingastuff2 copy 2.png';
import shooterAim2 from '../assets/minigame/characters/vikingastuff2 copy 3.png';
import shooterShoot from '../assets/minigame/characters/vikingastuff2 copy 4.png';
import spearSprite from '../assets/minigame/characters/spear.png';
import foeSprite from '../assets/minigame/characters/foe.png';
import foeHitSprite from '../assets/minigame/characters/foe-hit.png';
import foeDeath1 from '../assets/minigame/characters/foe-death1.png';
import foeDeath2 from '../assets/minigame/characters/foe-death2.png';
import foeDeath3 from '../assets/minigame/characters/foe-death3.png';
import axeSprite from '../assets/minigame/characters/axe.png';
import arrowBg from '../assets/minigame/backgrounds/background_arrow_minigame.png';

const CANVAS_W = 520;
const CANVAS_H = 220;
const GRAVITY = 140;
const GROUND_Y = CANVAS_H - 32;
const PLAYER_Y = GROUND_Y - 90;
const PLAYER_RADIUS = 12;
const TARGET_RADIUS = 12;
const ARROW_RADIUS = 4;
const TARGET_X = 1000;
const SHOOTER_SHOT_MS = 350;
const SHOOTER_HEIGHT = 80;
const IDLE_SCALE = 0.85;
const SPEAR_LENGTH = 140;
const SPEAR_TIP_ANCHOR = 0.65;
const FOE_HEIGHT = 140;
const FOE_Y_OFFSET = 10;
const FOE_MAX_HP = 3;
const FOE_HIT_MS = 800;
const FOE_DEATH_FRAME_MS = 600;
const AXE_GRAVITY = 220;
const MAX_ARROWS = 6;
const FOE_HIT_PAUSE_MS = 1200;
const FOE_DEATH_PAUSE_MS = 10000;
const BLOOD_LIFETIME = 600;
const BLOOD_COUNT = 6;
const FOE_SCALE_IDLE = 0.9;
const FOE_SCALE_HIT = 0.75;
const FOE_SCALE_DEATH = 0.85;
const FOE_DEATH_FRAME_SCALES = [0.65, 0.65, 0.35];
const FOE_HIT_Y_OFFSET = -18;
const FOE_DEATH_Y_OFFSET = -20;

export default function ArrowDuelCanvas({ onSuccess, onFail, onFinalHit, onHit, onMiss, resetToken }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const stateRef = useRef(null);
  const shooterImgRef = useRef(null);
  const spearImgRef = useRef(null);
  const foeImgRef = useRef(null);
  const foeMaskRef = useRef(null);
  const foeHitRef = useRef(null);
  const foeDeathRef = useRef([]);
  const axeImgRef = useRef(null);
  const bgImgRef = useRef(null);

  const [angle, setAngle] = useState(45);
  const [power, setPower] = useState(200);
  const [dragging, setDragging] = useState(false);
  const [turn] = useState(0);
  const [status, setStatus] = useState('Aim and shoot.');
  const [resultText, setResultText] = useState('');

  const initState = () => ({
      arrow: null,
      lastTime: performance.now(),
      aim: null,
      pose: 'idle',
      poseUntil: 0,
      foeDown: false,
      foeHp: FOE_MAX_HP,
      foeState: 'idle',
      foeStateUntil: 0,
      foeDeathIndex: 0,
      foeDeathStart: 0,
      axe: null,
      spears: [],
      cameraX: 0,
      hitPauseUntil: 0,
      blood: [],
      arrowsLeft: MAX_ARROWS,
      finished: false,
      successAt: null,
      failAt: null
    });

  if (!stateRef.current) {
    stateRef.current = initState();
  }

  useEffect(() => {
    const idle = new Image();
    idle.src = shooterIdle;
    const idleAlt = new Image();
    idleAlt.src = shooterIdleAlt;
    const aim1 = new Image();
    aim1.src = shooterAim1;
    const aim2 = new Image();
    aim2.src = shooterAim2;
    const shoot = new Image();
    shoot.src = shooterShoot;
    const spear = new Image();
    spear.src = spearSprite;
    const foe = new Image();
    foe.src = foeSprite;
    const foeHit = new Image();
    foeHit.src = foeHitSprite;
    const death1 = new Image();
    death1.src = foeDeath1;
    const death2 = new Image();
    death2.src = foeDeath2;
    const death3 = new Image();
    death3.src = foeDeath3;
    const axe = new Image();
    axe.src = axeSprite;
    const bg = new Image();
    bg.src = arrowBg;
    let loaded = 0;
    const total = 13;
    const check = () => {
      loaded += 1;
      if (loaded === total) {
        shooterImgRef.current = {
          idle,
          idleAlt,
          aim: [aim1, aim2],
          shoot
        };
        spearImgRef.current = spear;
        foeImgRef.current = foe;
        foeHitRef.current = foeHit;
        foeDeathRef.current = [death1, death2, death3];
        axeImgRef.current = axe;
        bgImgRef.current = bg;
      }
    };
    [idle, idleAlt, aim1, aim2, shoot, spear, foe, foeHit, death1, death2, death3, axe, bg].forEach(img => {
      img.onload = () => {
        if (img === foe) {
          foeMaskRef.current = buildMask(foe);
        }
        check();
      };
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    const loop = (now) => {
      const s = stateRef.current;
      const dt = Math.min(0.033, (now - s.lastTime) / 1000);
      s.lastTime = now;

      if (s.pose === 'shoot' && now > s.poseUntil) {
        s.pose = s.arrow ? 'shoot' : 'idle';
      }
      if (!s.arrow && !s.aim && s.pose !== 'shoot') {
        s.pose = 'idle';
      }

      if (s.arrow) {
        let prevX = s.arrow.x;
        let prevY = s.arrow.y;
        s.arrow.vy += GRAVITY * dt;
        s.arrow.x += s.arrow.vx * dt;
        s.arrow.y += s.arrow.vy * dt;

        const hit = s.foeHp > 0 && checkHit(s.arrow, foeImgRef.current, foeMaskRef.current);
        if (hit) {
          const impact = findImpactPoint(prevX, prevY, s.arrow.x, s.arrow.y, s.arrow, foeImgRef.current, foeMaskRef.current);
          const { tipX, tipY, angle } = getSpearTip({ ...s.arrow, x: impact.x, y: impact.y });
          s.spears.push({ x: tipX, y: tipY, angle, vy: 0, falling: false });
          s.arrow = null;
          s.aim = null;
          s.pose = 'idle';
          const nextHp = Math.max(0, s.foeHp - 1);
          s.foeHp = nextHp;
          s.hitPauseUntil = now + (nextHp > 0 ? FOE_HIT_PAUSE_MS : FOE_DEATH_PAUSE_MS);
          s.cameraX = clamp(tipX - CANVAS_W * 0.35, 0, TARGET_X - CANVAS_W * 0.3);
          s.blood.push(...spawnBlood(tipX, tipY, now));
          s.arrowsLeft = Math.max(0, s.arrowsLeft - 1);
          onHit?.(s.arrowsLeft);
          if (nextHp > 0) {
            s.foeState = 'hit';
            s.foeStateUntil = now + FOE_HIT_MS;
            setStatus(`Hit! ${s.foeHp} left.`);
          } else {
            s.foeState = 'death';
            s.foeDeathStart = now;
            s.foeDeathIndex = 0;
            s.foeDown = true;
            s.axe = spawnAxe(now);
            setStatus('Final hit. Foe falls.');
            if (!s.finished) {
              s.finished = true;
              s.successAt = now + FOE_DEATH_PAUSE_MS;
              onFinalHit?.(FOE_DEATH_PAUSE_MS / 1000);
              setStatus('You won.');
              setResultText('You won');
            }
          }
        } else if (s.arrow.y >= GROUND_Y || s.arrow.x < 0 || s.arrow.x > TARGET_X + 80) {
          s.arrow = null;
          s.arrowsLeft = Math.max(0, s.arrowsLeft - 1);
          onMiss?.(s.arrowsLeft);
          setStatus('Miss. Try again.');
        }
        if (s.arrowsLeft <= 0 && s.foeHp > 0 && !s.finished) {
          s.finished = true;
          s.failAt = now + 2000;
          setStatus('You lost.');
          setResultText('You lost');
        }
      }

      if (s.successAt && now >= s.successAt) {
        s.successAt = null;
        setResultText('');
        onSuccess?.();
      }
      if (s.failAt && now >= s.failAt) {
        s.failAt = null;
        setResultText('');
        onFail?.();
      }

      if (s.foeState === 'hit' && now > s.foeStateUntil) {
        s.foeState = 'idle';
      }

      if (s.foeState === 'death') {
        const elapsed = now - s.foeDeathStart;
        const index = Math.min(2, Math.floor(elapsed / FOE_DEATH_FRAME_MS));
        s.foeDeathIndex = index;
        if (index > 0 && s.spears?.length) {
          s.spears.forEach(spear => {
            if (!spear.falling) spear.falling = true;
          });
        }
      }

      if (s.spears?.length) {
        s.spears.forEach(spear => {
          if (!spear.falling) return;
          spear.vy += AXE_GRAVITY * dt * 0.7;
          spear.y += spear.vy * dt;
          if (spear.y >= GROUND_Y + 8) {
            spear.y = GROUND_Y + 8;
            spear.falling = false;
          }
        });
      }

      if (s.axe && !s.axe.stuck) {
        s.axe.vy += AXE_GRAVITY * dt;
        s.axe.x += s.axe.vx * dt;
        s.axe.y += s.axe.vy * dt;
        s.axe.rot += s.axe.vr * dt;
        if (s.axe.y >= GROUND_Y + 8) {
          s.axe.y = GROUND_Y + 8;
          s.axe.stuck = true;
        }
      }

      if (s.blood?.length) {
        s.blood = s.blood.filter((drop) => now - drop.t < BLOOD_LIFETIME);
      }

      if (s.arrow) {
        s.cameraX = clamp(s.arrow.x - CANVAS_W * 0.35, 0, TARGET_X - CANVAS_W * 0.3);
      } else if (s.hitPauseUntil > now) {
        // keep camera at hit point until pause ends
      } else {
        s.cameraX = 0;
      }
      draw(
        ctx,
        s.arrow,
        s.aim,
        s.pose,
        s.foeState,
        s.foeDeathIndex,
        s.axe,
        s.spears,
        s.cameraX,
        s.blood,
        shooterImgRef.current,
        spearImgRef.current,
        foeImgRef.current,
        foeHitRef.current,
        foeDeathRef.current,
        axeImgRef.current,
        bgImgRef.current,
        now
      );
      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [turn]);

  function checkHit(arrow, foeImg, foeMask) {
    const { tipX, tipY } = getSpearTip(arrow);
    if (foeImg && foeMask) {
      const rect = getFoeRect(TARGET_X, PLAYER_Y + 120, foeImg);
      const localX = (tipX - rect.x) / rect.scale;
      const localY = (tipY - rect.y) / rect.scale;
      return hitMask(foeMask, foeImg.width, foeImg.height, localX, localY);
    }
    const dx = tipX - TARGET_X;
    const targetCenterY = (PLAYER_Y + 120) - FOE_HEIGHT / 2 + FOE_Y_OFFSET;
    const dy = tipY - targetCenterY;
    const hitRadius = Math.max(TARGET_RADIUS, FOE_HEIGHT * 0.35);
    return Math.hypot(dx, dy) <= hitRadius + ARROW_RADIUS;
  }

  function findImpactPoint(prevX, prevY, nextX, nextY, arrow, foeImg, foeMask) {
    if (!foeImg || !foeMask) {
      return { x: nextX, y: nextY };
    }
    const steps = 12;
    for (let i = 0; i <= steps; i += 1) {
      const t = i / steps;
      const testX = prevX + (nextX - prevX) * t;
      const testY = prevY + (nextY - prevY) * t;
      const testArrow = { ...arrow, x: testX, y: testY };
      if (checkHit(testArrow, foeImg, foeMask)) {
        return { x: testX, y: testY };
      }
    }
    return { x: nextX, y: nextY };
  }

  function shoot() {
    const s = stateRef.current;
    if (s.arrow) return;
    if (s.arrowsLeft <= 0) return;
    if (s.finished) return;
    const rad = (angle * Math.PI) / 180;
    const dir = 1;
    const startX = 70;
    const startY = PLAYER_Y + 10;
    s.arrow = {
      x: startX,
      y: startY,
      vx: Math.cos(rad) * power * dir,
      vy: -Math.sin(rad) * power,
      stuck: false
    };
    s.pose = 'shoot';
    s.poseUntil = performance.now() + SHOOTER_SHOT_MS;
    setStatus('Spear in flight.');
  }

  function handlePointerDown(e) {
    const s = stateRef.current;
    if (s.arrow) return;
    const pos = getPointerPos(e);
    s.aim = pos;
    s.pose = 'aim';
    setDragging(true);
  }

  function handlePointerMove(e) {
    if (!dragging) return;
    const s = stateRef.current;
    const pos = getPointerPos(e);
    s.aim = pos;
    const { angleDeg, powerVal } = getAimFromPointer(pos);
    setAngle(angleDeg);
    setPower(powerVal);
  }

  function handlePointerUp(e) {
    if (!dragging) return;
    setDragging(false);
    const s = stateRef.current;
    const pos = getPointerPos(e);
    s.aim = pos;
    const { angleDeg, powerVal } = getAimFromPointer(pos);
    setAngle(angleDeg);
    setPower(powerVal);
    shoot();
    s.aim = null;
  }

  function getPointerPos(e) {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }

  function getAimFromPointer(pos) {
    const shooterX = 70;
    const shooterY = PLAYER_Y + 10;
    const dx = pos.x - shooterX;
    const dy = shooterY - pos.y;
    const rawAngle = Math.atan2(dy, dx) * (180 / Math.PI);
    const angleDeg = clamp(rawAngle, 0, 80);
    const dist = Math.hypot(dx, dy);
    const powerVal = clamp(140 + dist * 1.8, 140, 360);
    return { angleDeg, powerVal };
  }

  function resetRound() {
    const s = stateRef.current;
    s.arrow = null;
    s.foeDown = false;
    s.foeHp = FOE_MAX_HP;
    s.foeState = 'idle';
    s.foeStateUntil = 0;
    s.foeDeathIndex = 0;
    s.axe = null;
    s.spears = [];
    s.arrowsLeft = MAX_ARROWS;
    setStatus('Aim and shoot.');
    setResultText('');
  }

  useEffect(() => {
    if (resetToken === undefined) return;
    stateRef.current = initState();
  }, [resetToken]);

  return (
    <div className="arrow-duel">
      <canvas
        ref={canvasRef}
        width={CANVAS_W}
        height={CANVAS_H}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />
      {resultText && (
        <div className="arrow-result">{resultText}</div>
      )}
      <div className="arrow-controls">
        <div className="arrow-actions">
          <button className="mini" onClick={shoot}>Throw</button>
          <button className="ghost mini" onClick={resetRound}>Reset</button>
        </div>
        <div className="arrow-status">Shooter: Left · {status} · Spears {stateRef.current?.arrowsLeft ?? 0}/{MAX_ARROWS}</div>
      </div>
    </div>
  );
}

function draw(ctx, arrow, aim, pose, foeState, foeDeathIndex, axe, spears, cameraX, blood, shooterImg, spearImg, foeImg, foeHitImg, foeDeathImgs, axeImg, bgImg, now) {
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

  ctx.save();
  ctx.translate(-cameraX, 0);

  if (bgImg) {
    const scale = (CANVAS_H / bgImg.height) * 0.7;
    const tileW = bgImg.width * scale;
    const tileH = bgImg.height * scale;
    const startX = cameraX - (cameraX % tileW) - tileW;
    for (let x = startX; x < cameraX + CANVAS_W + tileW; x += tileW) {
      ctx.drawImage(bgImg, x, 0, tileW, CANVAS_H);
    }
  } else {
    ctx.fillStyle = '#0f141c';
    ctx.fillRect(cameraX, 0, CANVAS_W, CANVAS_H);
  }

  ctx.strokeStyle = 'rgba(255,255,255,0.12)';
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y + 10);
  ctx.lineTo(TARGET_X + 120, GROUND_Y + 10);
  ctx.stroke();

  drawShooter(ctx, 70, PLAYER_Y, shooterImg, pose, now);

  if (aim) {
    const shooterX = 75;
    const shooterY = PLAYER_Y + 50;
    ctx.strokeStyle = 'rgba(214, 173, 86, 0.7)';
    ctx.beginPath();
    ctx.moveTo(shooterX, shooterY);
    const dx = aim.x - shooterX;
    const dy = aim.y - shooterY;
    const len = Math.hypot(dx, dy) || 1;
    const maxLen = 140;
    const scale = Math.min(1, maxLen / len);
    const endX = shooterX + dx * scale;
    const endY = shooterY + dy * scale;
    ctx.setLineDash([6, 6]);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(214, 173, 86, 0.3)';
    ctx.beginPath();
    ctx.arc(endX, endY, 6, 0, Math.PI * 2);
    ctx.fill();
  }

  if (arrow) {
    drawSpear(ctx, arrow, spearImg);
  }
  if (spears?.length) {
    spears.forEach((stuck) => {
      drawSpear(ctx, { x: stuck.x, y: stuck.y, vx: Math.cos(stuck.angle), vy: Math.sin(stuck.angle), stuckAngle: stuck.angle }, spearImg);
    });
  }

  drawTarget(ctx, TARGET_X, PLAYER_Y + 120, foeImg, foeHitImg, foeDeathImgs, foeState, foeDeathIndex);
  if (blood?.length) {
    drawBlood(ctx, blood, now);
  }
  if (axe) {
    drawAxe(ctx, axe, axeImg);
  }

  ctx.restore();
}

function drawShooter(ctx, x, y, imgSet, pose, now) {
  if (!imgSet) {
    ctx.fillStyle = '#caa562';
    ctx.beginPath();
    ctx.arc(x, y, PLAYER_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.fillRect(x - 12, y + 10, 24, 6);
    return;
  }
  let img = imgSet.idle;
  let scaleAdjust = IDLE_SCALE;
  if (pose === 'aim') {
    img = imgSet.aim[0] || imgSet.idle;
    scaleAdjust = 1;
  } else if (pose === 'shoot') {
    img = imgSet.shoot;
    scaleAdjust = 1;
  }
  const frameW = img.width;
  const frameH = img.height;
  const scale = (SHOOTER_HEIGHT / frameH) * scaleAdjust;
  const drawW = frameW * scale;
  const drawH = frameH * scale;
  ctx.drawImage(
    img,
    0,
    0,
    frameW,
    frameH,
    x - drawW / 2,
    y - drawH + 105,
    drawW,
    drawH
  );
}

function drawTarget(ctx, x, y, img, hitImg, deathImgs, state, deathIndex) {
  let sprite = img;
  if (state === 'hit' && hitImg) sprite = hitImg;
  if (state === 'death' && deathImgs?.length) {
    sprite = deathImgs[Math.min(deathIndex, deathImgs.length - 1)] || sprite;
  }
  const scaleAdjust = state === 'hit'
    ? FOE_SCALE_HIT
    : state === 'death'
      ? (FOE_DEATH_FRAME_SCALES[deathIndex] ?? FOE_SCALE_DEATH)
      : FOE_SCALE_IDLE;
  if (!sprite) {
    ctx.fillStyle = 'rgba(200, 90, 90, 0.85)';
    ctx.beginPath();
    ctx.arc(x, y, TARGET_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(200, 90, 90, 0.25)';
    ctx.fillRect(x - 8, y + 12, 16, 6);
    return;
  }
  const yAdjust = state === 'hit'
    ? FOE_HIT_Y_OFFSET
    : state === 'death'
      ? FOE_DEATH_Y_OFFSET
      : 0;
  const baseRect = getFoeRect(x, y + yAdjust, sprite, scaleAdjust);
  ctx.drawImage(
    sprite,
    baseRect.x,
    baseRect.y,
    baseRect.drawW,
    baseRect.drawH
  );
}

function drawAxe(ctx, axe, img) {
  if (!img) return;
  ctx.save();
  ctx.translate(axe.x, axe.y);
  ctx.rotate(axe.rot);
  const scale = 100 / img.width;
  const drawW = img.width * scale;
  const drawH = img.height * scale;
  ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
  ctx.restore();
}

function drawSpear(ctx, arrow, img) {
  const angle = arrow.stuckAngle ?? Math.atan2(arrow.vy, arrow.vx);
  const tip = { x: arrow.x, y: arrow.y };
  ctx.save();
  ctx.translate(tip.x, tip.y);
  ctx.rotate(angle);
  if (img) {
    const scale = SPEAR_LENGTH / img.width;
    const drawW = img.width * scale;
    const drawH = img.height * scale;
    ctx.drawImage(img, -drawW * SPEAR_TIP_ANCHOR, -drawH / 2, drawW, drawH);
  } else {
    ctx.strokeStyle = '#e6d1a8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-SPEAR_LENGTH * SPEAR_TIP_ANCHOR, 0);
    ctx.lineTo(SPEAR_LENGTH, 0);
    ctx.stroke();
  }
  ctx.restore();
}

function getSpearTip(arrow) {
  return {
    tipX: arrow.x,
    tipY: arrow.y,
    angle: Math.atan2(arrow.vy, arrow.vx)
  };
}

function drawBlood(ctx, drops, now) {
  drops.forEach((drop) => {
    const life = Math.max(0, 1 - (now - drop.t) / BLOOD_LIFETIME);
    ctx.fillStyle = `rgba(190, 30, 30, ${0.7 * life})`;
    ctx.beginPath();
    ctx.arc(drop.x, drop.y, drop.r, 0, Math.PI * 2);
    ctx.fill();
  });
}

function getFoeRect(x, y, img, scaleAdjust = 1) {
  const scale = (FOE_HEIGHT / img.height) * scaleAdjust;
  const drawW = img.width * scale;
  const drawH = img.height * scale;
  return {
    x: x - drawW / 2,
    y: y - drawH + FOE_Y_OFFSET,
    drawW,
    drawH,
    scale
  };
}

function spawnAxe(now) {
  const handX = TARGET_X - 18;
  const handY = (PLAYER_Y + 120) - FOE_HEIGHT * 0.55;
  return {
    x: handX,
    y: handY,
    vx: -40,
    vy: -140,
    rot: -0.6,
    vr: 3.2,
    stuck: false
  };
}

function buildMask(img) {
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(img, 0, 0);
  const data = ctx.getImageData(0, 0, img.width, img.height).data;
  const mask = new Uint8Array(img.width * img.height);
  for (let i = 0; i < img.width * img.height; i += 1) {
    mask[i] = data[i * 4 + 3] > 20 ? 1 : 0;
  }
  return mask;
}

function hitMask(mask, width, height, x, y) {
  const px = Math.floor(x);
  const py = Math.floor(y);
  if (px < 0 || py < 0 || px >= width || py >= height) return false;
  const offsets = [-2, 0, 2];
  for (let dy = 0; dy < offsets.length; dy += 1) {
    for (let dx = 0; dx < offsets.length; dx += 1) {
      const sx = px + offsets[dx];
      const sy = py + offsets[dy];
      if (sx < 0 || sy < 0 || sx >= width || sy >= height) continue;
      if (mask[sy * width + sx]) return true;
    }
  }
  return false;
}

function spawnBlood(x, y, now) {
  const drops = [];
  for (let i = 0; i < BLOOD_COUNT; i += 1) {
    drops.push({
      x: x + (Math.random() * 14 - 7),
      y: y + (Math.random() * 10 - 5),
      r: 2 + Math.random() * 3,
      t: now
    });
  }
  return drops;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
