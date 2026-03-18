import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createHomeRegionMap } from '../data/homeRegionMap.js';
import watchtowerImgUrl from '../../../assets/Travel images/watchtower.png';
import timertownImgUrl from '../../../assets/Travel images/timertown.png';
import mountaintopImgUrl from '../../../assets/Travel images/mountaintop.png';
import mainMapImgUrl from '../../../assets/Travel images/main-map.png';
import mapMaskImgUrl from '../../../assets/Travel images/map_mask.png';

const TILE_SIZE = 100;
const MOVE_SPEED = 240;
const CAMERA_LERP = 0.12;
const VIEW_BUFFER = 2;

function cellKey(x, y) {
  return `${x},${y}`;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

class Camera {
  constructor(viewWidth = 0, viewHeight = 0) {
    this.viewWidth = viewWidth;
    this.viewHeight = viewHeight;
    this.x = 0;
    this.y = 0;
    this.smoothing = CAMERA_LERP;
  }

  resize(viewWidth, viewHeight) {
    this.viewWidth = viewWidth;
    this.viewHeight = viewHeight;
  }

  update(targetX, targetY, worldWidth, worldHeight) {
    const desiredX = targetX - this.viewWidth / 2;
    const desiredY = targetY - this.viewHeight / 2;
    const maxX = Math.max(0, worldWidth - this.viewWidth);
    const maxY = Math.max(0, worldHeight - this.viewHeight);
    const clampedX = clamp(desiredX, 0, maxX);
    const clampedY = clamp(desiredY, 0, maxY);

    this.x = Math.abs(clampedX - this.x) < 0.5 ? clampedX : lerp(this.x, clampedX, this.smoothing);
    this.y = Math.abs(clampedY - this.y) < 0.5 ? clampedY : lerp(this.y, clampedY, this.smoothing);
  }

  getVisibleTileBounds(mapWidth, mapHeight) {
    return {
      minTileX: clamp(worldToTile(this.x) - VIEW_BUFFER, 0, mapWidth - 1),
      maxTileX: clamp(worldToTile(this.x + this.viewWidth) + VIEW_BUFFER, 0, mapWidth - 1),
      minTileY: clamp(worldToTile(this.y) - VIEW_BUFFER, 0, mapHeight - 1),
      maxTileY: clamp(worldToTile(this.y + this.viewHeight) + VIEW_BUFFER, 0, mapHeight - 1)
    };
  }
}

function seededRandom(seed) {
  const x = Math.sin(seed * 127.1) * 43758.5453123;
  return x - Math.floor(x);
}

function worldToTile(value) {
  return Math.floor(value / TILE_SIZE);
}

function getTileAtPosition(cellIndex, x, y) {
  return cellIndex.get(cellKey(worldToTile(x), worldToTile(y)));
}

function getTileCenter(cell) {
  return {
    x: cell.x * TILE_SIZE + TILE_SIZE / 2,
    y: cell.y * TILE_SIZE + TILE_SIZE / 2
  };
}

function useTravelSpriteSet() {
  const [sprites, setSprites] = useState({});

  useEffect(() => {
    let cancelled = false;
    const entries = [
      ['mainmap', mainMapImgUrl],
      ['watchtower', watchtowerImgUrl],
      ['timertown', timertownImgUrl],
      ['mountaintop', mountaintopImgUrl]
    ];

    Promise.all(
      entries.map(
        ([key, src]) =>
          new Promise((resolve) => {
            const image = new Image();
            image.onload = () => resolve([key, image]);
            image.onerror = () => resolve([key, null]);
            image.src = src;
          })
      )
    ).then((loaded) => {
      if (cancelled) return;
      setSprites(Object.fromEntries(loaded.filter(([, image]) => image)));
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return sprites;
}

function useMapMask() {
  const [mask, setMask] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const image = new Image();
    image.onload = () => {
      if (cancelled) return;
      const canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(image, 0, 0);
      const imageData = ctx.getImageData(0, 0, image.width, image.height);
      setMask({
        width: image.width,
        height: image.height,
        data: imageData.data
      });
    };
    image.src = mapMaskImgUrl;

    return () => {
      cancelled = true;
    };
  }, []);

  return mask;
}

function isWalkableInMask(mask, worldX, worldY, worldWidth, worldHeight) {
  if (!mask) return true;

  const imageX = clamp(Math.floor((worldX / worldWidth) * mask.width), 0, mask.width - 1);
  const imageY = clamp(Math.floor((worldY / worldHeight) * mask.height), 0, mask.height - 1);
  const offset = (imageY * mask.width + imageX) * 4;
  const r = mask.data[offset];
  const g = mask.data[offset + 1];
  const b = mask.data[offset + 2];
  const a = mask.data[offset + 3];
  const brightness = (r + g + b) / 3;

  // This mask uses dark = land/walkable and light = blocked water.
  return a > 0 && brightness <= 127;
}

function findNearestWalkablePosition(start, mask, worldWidth, worldHeight) {
  if (!mask) return start;

  if (isWalkableInMask(mask, start.x, start.y, worldWidth, worldHeight)) {
    return start;
  }

  const maxRadius = 24;
  for (let radius = 1; radius <= maxRadius; radius += 1) {
    for (let dy = -radius; dy <= radius; dy += 1) {
      for (let dx = -radius; dx <= radius; dx += 1) {
        if (Math.abs(dx) !== radius && Math.abs(dy) !== radius) continue;

        const candidate = {
          x: clamp(start.x + dx * (TILE_SIZE / 3), 0, worldWidth - 1),
          y: clamp(start.y + dy * (TILE_SIZE / 3), 0, worldHeight - 1)
        };

        if (isWalkableInMask(mask, candidate.x, candidate.y, worldWidth, worldHeight)) {
          return candidate;
        }
      }
    }
  }

  return start;
}

function getTerrainPalette(terrain) {
  switch (terrain) {
    case 'deep-water':
      return { base: '#2555a8', shade: '#1a3f80', glow: '#79a8ef' };
    case 'shore-water':
      return { base: '#72bdd9', shade: '#4d91af', glow: '#c0ecf6' };
    case 'mountain':
      return { base: '#8c857b', shade: '#6d665f', glow: '#beb7aa' };
    case 'trees':
      return { base: '#476d49', shade: '#335235', glow: '#7f9d7f' };
    case 'settlement':
      return { base: '#56733d', shade: '#314726', glow: '#7fa25f' };
    case 'meadow':
    default:
      return { base: '#5b7c46', shade: '#466237', glow: '#82a965' };
  }
}

function drawRoundedRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function hasWaterNeighbor(cellIndex, cell) {
  const neighbors = [
    cellIndex.get(cellKey(cell.x, cell.y - 1)),
    cellIndex.get(cellKey(cell.x + 1, cell.y)),
    cellIndex.get(cellKey(cell.x, cell.y + 1)),
    cellIndex.get(cellKey(cell.x - 1, cell.y))
  ];

  return neighbors.some((neighbor) => neighbor && (neighbor.terrain === 'shore-water' || neighbor.terrain === 'deep-water'));
}

function makeOffscreenCanvas(width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, width);
  canvas.height = Math.max(1, height);
  return canvas;
}

function drawBaseGround(ctx, minWorldX, minWorldY, width, height) {
  ctx.fillStyle = '#587847';
  ctx.fillRect(minWorldX, minWorldY, width, height);

  const brushStep = 72;
  const startX = Math.floor(minWorldX / brushStep) * brushStep;
  const startY = Math.floor(minWorldY / brushStep) * brushStep;

  for (let gy = startY; gy <= minWorldY + height + brushStep; gy += brushStep) {
    for (let gx = startX; gx <= minWorldX + width + brushStep; gx += brushStep) {
      const seed = gx * 0.017 + gy * 0.023 + 41;
      const x = gx + seededRandom(seed) * brushStep;
      const y = gy + seededRandom(seed + 5) * brushStep;
      const rotation = seededRandom(seed + 8) * Math.PI;
      const length = 18 + seededRandom(seed + 11) * 26;
      const widthScale = 4 + seededRandom(seed + 15) * 7;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);

      const brush = ctx.createLinearGradient(-length / 2, 0, length / 2, 0);
      brush.addColorStop(0, 'rgba(0, 0, 0, 0)');
      brush.addColorStop(0.3, 'rgba(179, 204, 136, 0.05)');
      brush.addColorStop(0.7, 'rgba(58, 83, 43, 0.04)');
      brush.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = brush;
      drawRoundedRect(ctx, -length / 2, -widthScale / 2, length, widthScale, widthScale / 2);
      ctx.fill();
      ctx.restore();
    }
  }
}

function drawConnectedPatch(ctx, cellIndex, cell, worldX, worldY, fillStyle, inset, radius) {
  const north = cellIndex.get(cellKey(cell.x, cell.y - 1))?.terrain === cell.terrain;
  const south = cellIndex.get(cellKey(cell.x, cell.y + 1))?.terrain === cell.terrain;
  const west = cellIndex.get(cellKey(cell.x - 1, cell.y))?.terrain === cell.terrain;
  const east = cellIndex.get(cellKey(cell.x + 1, cell.y))?.terrain === cell.terrain;

  ctx.fillStyle = fillStyle;

  drawRoundedRect(ctx, worldX + inset, worldY + inset, TILE_SIZE - inset * 2, TILE_SIZE - inset * 2, radius);
  ctx.fill();

  if (north) {
    ctx.fillRect(worldX + inset, worldY, TILE_SIZE - inset * 2, TILE_SIZE / 2);
  }
  if (south) {
    ctx.fillRect(worldX + inset, worldY + TILE_SIZE / 2, TILE_SIZE - inset * 2, TILE_SIZE / 2);
  }
  if (west) {
    ctx.fillRect(worldX, worldY + inset, TILE_SIZE / 2, TILE_SIZE - inset * 2);
  }
  if (east) {
    ctx.fillRect(worldX + TILE_SIZE / 2, worldY + inset, TILE_SIZE / 2, TILE_SIZE - inset * 2);
  }
}

function drawShoreBlend(ctx, cellIndex, cell, worldX, worldY) {
  if ((cell.terrain !== 'meadow' && cell.terrain !== 'settlement') || !hasWaterNeighbor(cellIndex, cell)) {
    return;
  }

  const northWater = ['shore-water', 'deep-water'].includes(cellIndex.get(cellKey(cell.x, cell.y - 1))?.terrain);
  const southWater = ['shore-water', 'deep-water'].includes(cellIndex.get(cellKey(cell.x, cell.y + 1))?.terrain);
  const westWater = ['shore-water', 'deep-water'].includes(cellIndex.get(cellKey(cell.x - 1, cell.y))?.terrain);
  const eastWater = ['shore-water', 'deep-water'].includes(cellIndex.get(cellKey(cell.x + 1, cell.y))?.terrain);

  const paintEdge = (x0, y0, x1, y1) => {
    const gradient = ctx.createLinearGradient(x0, y0, x1, y1);
    gradient.addColorStop(0, 'rgba(224, 201, 144, 0.34)');
    gradient.addColorStop(0.45, 'rgba(215, 192, 136, 0.16)');
    gradient.addColorStop(1, 'rgba(215, 192, 136, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(worldX, worldY, TILE_SIZE, TILE_SIZE);
  };

  if (northWater) paintEdge(worldX, worldY, worldX, worldY + 28);
  if (southWater) paintEdge(worldX, worldY + TILE_SIZE, worldX, worldY + TILE_SIZE - 28);
  if (westWater) paintEdge(worldX, worldY, worldX + 28, worldY);
  if (eastWater) paintEdge(worldX + TILE_SIZE, worldY, worldX + TILE_SIZE - 28, worldY);
}

function drawMergedWaterRegions(ctx, cellIndex, minTileX, minTileY, maxTileX, maxTileY, now) {
  const minWorldX = minTileX * TILE_SIZE;
  const minWorldY = minTileY * TILE_SIZE;
  const width = (maxTileX - minTileX + 1) * TILE_SIZE;
  const height = (maxTileY - minTileY + 1) * TILE_SIZE;

  const deepMask = makeOffscreenCanvas(width, height);
  const shoreMask = makeOffscreenCanvas(width, height);
  const deepCtx = deepMask.getContext('2d');
  const shoreCtx = shoreMask.getContext('2d');

  if (!deepCtx || !shoreCtx) {
    return;
  }

  for (let y = minTileY; y <= maxTileY; y += 1) {
    for (let x = minTileX; x <= maxTileX; x += 1) {
      const cell = cellIndex.get(cellKey(x, y));
      if (!cell || (cell.terrain !== 'deep-water' && cell.terrain !== 'shore-water')) {
        continue;
      }

      const localX = (x - minTileX) * TILE_SIZE;
      const localY = (y - minTileY) * TILE_SIZE;
      const targetCtx = cell.terrain === 'deep-water' ? deepCtx : shoreCtx;

      // Slight overdraw merges neighboring cells into a continuous mass.
      targetCtx.fillStyle = '#ffffff';
      targetCtx.fillRect(localX - 14, localY - 14, TILE_SIZE + 28, TILE_SIZE + 28);

    }
  }

  const paintMask = (maskCanvas, fillStops, blurPx, alpha) => {
    const paintCanvas = makeOffscreenCanvas(width, height);
    const paintCtx = paintCanvas.getContext('2d');
    if (!paintCtx) return;

    const gradient = paintCtx.createLinearGradient(0, 0, 0, height);
    fillStops.forEach(([stop, color]) => gradient.addColorStop(stop, color));
    paintCtx.fillStyle = gradient;
    paintCtx.fillRect(0, 0, width, height);
    paintCtx.globalCompositeOperation = 'destination-in';
    paintCtx.drawImage(maskCanvas, 0, 0);

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.filter = `blur(${blurPx}px)`;
    ctx.drawImage(paintCanvas, minWorldX, minWorldY);
    ctx.restore();

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.drawImage(paintCanvas, minWorldX, minWorldY);
    ctx.restore();
  };

  paintMask(
    deepMask,
    [
      [0, 'rgba(66, 114, 201, 0.96)'],
      [1, 'rgba(29, 61, 138, 0.98)']
    ],
    16,
    1
  );

  paintMask(
    shoreMask,
    [
      [0, 'rgba(138, 211, 233, 0.96)'],
      [1, 'rgba(95, 170, 210, 0.96)']
    ],
    18,
    0.96
  );

  // Draw direct gradients along deep-water -> shore-water boundaries.
  for (let y = minTileY; y <= maxTileY; y += 1) {
    for (let x = minTileX; x <= maxTileX; x += 1) {
      const cell = cellIndex.get(cellKey(x, y));
      if (!cell || cell.terrain !== 'deep-water') continue;

      const worldX = x * TILE_SIZE;
      const worldY = y * TILE_SIZE;
      const north = cellIndex.get(cellKey(x, y - 1));
      const east = cellIndex.get(cellKey(x + 1, y));
      const south = cellIndex.get(cellKey(x, y + 1));
      const west = cellIndex.get(cellKey(x - 1, y));

      if (north?.terrain === 'shore-water') {
        const gradient = ctx.createLinearGradient(0, worldY, 0, worldY + TILE_SIZE * 0.42);
        gradient.addColorStop(0, 'rgba(121, 198, 228, 0.85)');
        gradient.addColorStop(1, 'rgba(121, 198, 228, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(worldX - 8, worldY - 2, TILE_SIZE + 16, TILE_SIZE * 0.48);
      }

      if (south?.terrain === 'shore-water') {
        const gradient = ctx.createLinearGradient(0, worldY + TILE_SIZE, 0, worldY + TILE_SIZE * 0.58);
        gradient.addColorStop(0, 'rgba(121, 198, 228, 0.85)');
        gradient.addColorStop(1, 'rgba(121, 198, 228, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(worldX - 8, worldY + TILE_SIZE * 0.52, TILE_SIZE + 16, TILE_SIZE * 0.5);
      }

      if (west?.terrain === 'shore-water') {
        const gradient = ctx.createLinearGradient(worldX, 0, worldX + TILE_SIZE * 0.42, 0);
        gradient.addColorStop(0, 'rgba(121, 198, 228, 0.85)');
        gradient.addColorStop(1, 'rgba(121, 198, 228, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(worldX - 2, worldY - 8, TILE_SIZE * 0.48, TILE_SIZE + 16);
      }

      if (east?.terrain === 'shore-water') {
        const gradient = ctx.createLinearGradient(worldX + TILE_SIZE, 0, worldX + TILE_SIZE * 0.58, 0);
        gradient.addColorStop(0, 'rgba(121, 198, 228, 0.85)');
        gradient.addColorStop(1, 'rgba(121, 198, 228, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(worldX + TILE_SIZE * 0.52, worldY - 8, TILE_SIZE * 0.5, TILE_SIZE + 16);
      }
    }
  }

  const drift = (now || 0) * 0.03;
  for (let y = minTileY; y <= maxTileY; y += 1) {
    for (let x = minTileX; x <= maxTileX; x += 1) {
      const cell = cellIndex.get(cellKey(x, y));
      if (!cell || (cell.terrain !== 'deep-water' && cell.terrain !== 'shore-water')) {
        continue;
      }

      const worldX = x * TILE_SIZE;
      const worldY = y * TILE_SIZE;
      const northLand = !['deep-water', 'shore-water'].includes(cellIndex.get(cellKey(x, y - 1))?.terrain);
      const southLand = !['deep-water', 'shore-water'].includes(cellIndex.get(cellKey(x, y + 1))?.terrain);
      const westLand = !['deep-water', 'shore-water'].includes(cellIndex.get(cellKey(x - 1, y))?.terrain);
      const eastLand = !['deep-water', 'shore-water'].includes(cellIndex.get(cellKey(x + 1, y))?.terrain);

      const drawFoamLine = (x0, y0, x1, y1, cpOffsetX, cpOffsetY) => {
        ctx.strokeStyle = cell.terrain === 'shore-water' ? 'rgba(246, 244, 229, 0.18)' : 'rgba(201, 222, 255, 0.1)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.bezierCurveTo(x0 + cpOffsetX, y0 + cpOffsetY, x1 - cpOffsetX, y1 - cpOffsetY, x1, y1);
        ctx.stroke();
      };

      if (northLand) drawFoamLine(worldX + 10 + (drift % 14), worldY + 18, worldX + 88, worldY + 15, 18, -4);
      if (southLand) drawFoamLine(worldX + 12 + (drift % 12), worldY + 82, worldX + 86, worldY + 79, 16, 4);
      if (westLand) drawFoamLine(worldX + 16, worldY + 12 + (drift % 12), worldX + 14, worldY + 86, -4, 18);
      if (eastLand) drawFoamLine(worldX + 84, worldY + 10 + (drift % 10), worldX + 82, worldY + 84, 4, 18);
    }
  }
}

function drawTerrainPatch(ctx, cellIndex, cell, worldX, worldY, timeMs) {
  if (cell.terrain === 'meadow' || cell.terrain === 'shore-water' || cell.terrain === 'deep-water') {
    return;
  }

  const palette = getTerrainPalette(cell.terrain);
  const centerX = worldX + TILE_SIZE / 2;
  const centerY = worldY + TILE_SIZE / 2;

  if (cell.terrain === 'mountain') {
    drawConnectedPatch(ctx, cellIndex, cell, worldX, worldY, palette.base, 12, 18);
    ctx.fillStyle = 'rgba(67, 61, 56, 0.92)';
    ctx.beginPath();
    ctx.moveTo(worldX + 14, worldY + 82);
    ctx.lineTo(worldX + 38, worldY + 28);
    ctx.lineTo(worldX + 56, worldY + 62);
    ctx.lineTo(worldX + 82, worldY + 22);
    ctx.lineTo(worldX + 88, worldY + 84);
    ctx.lineTo(worldX + 14, worldY + 84);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(223, 215, 203, 0.26)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(worldX + 39, worldY + 28);
    ctx.lineTo(worldX + 48, worldY + 48);
    ctx.lineTo(worldX + 36, worldY + 58);
    ctx.stroke();
    return;
  }

  if (cell.terrain === 'trees') {
    drawConnectedPatch(ctx, cellIndex, cell, worldX, worldY, palette.base, 10, 18);
    return;
  }

  if (cell.terrain === 'settlement') {
    drawConnectedPatch(ctx, cellIndex, cell, worldX, worldY, 'rgba(108, 133, 85, 0.22)', 12, 18);
    return;
  }

  const blot = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, 52);
  blot.addColorStop(0, palette.glow);
  blot.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = blot;
  ctx.beginPath();
  ctx.arc(centerX, centerY, 52, 0, Math.PI * 2);
  ctx.fill();
}

function drawClutter(ctx, cell, worldX, worldY, sprites) {
  const seed = cell.x * 1000 + cell.y * 17;

  if (cell.terrain === 'meadow' || cell.terrain === 'settlement') {
    const count = cell.terrain === 'settlement' ? 2 : 4;
    for (let index = 0; index < count; index += 1) {
      const offsetX = 8 + seededRandom(seed + index * 2) * (TILE_SIZE - 16);
      const offsetY = 8 + seededRandom(seed + index * 3 + 1) * (TILE_SIZE - 16);
      const height = 8 + seededRandom(seed + index * 5 + 4) * 12;
      ctx.strokeStyle = cell.terrain === 'settlement' ? 'rgba(177, 148, 91, 0.12)' : 'rgba(170, 198, 122, 0.1)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(worldX + offsetX, worldY + offsetY + height * 0.5);
      ctx.lineTo(worldX + offsetX - 2, worldY + offsetY - height * 0.25);
      ctx.moveTo(worldX + offsetX, worldY + offsetY + height * 0.5);
      ctx.lineTo(worldX + offsetX + 2, worldY + offsetY - height * 0.3);
      ctx.stroke();
    }
  }

  if (cell.terrain === 'trees') {
    for (let index = 0; index < 7; index += 1) {
      const offsetX = 14 + seededRandom(seed + index) * 72;
      const offsetY = 14 + seededRandom(seed + index + 9) * 72;
      const size = 18 + seededRandom(seed + index + 21) * 10;
      ctx.fillStyle = 'rgba(19, 54, 18, 0.95)';
      ctx.beginPath();
      ctx.moveTo(worldX + offsetX, worldY + offsetY - size);
      ctx.lineTo(worldX + offsetX - size * 0.8, worldY + offsetY + size * 0.2);
      ctx.lineTo(worldX + offsetX + size * 0.8, worldY + offsetY + size * 0.2);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = 'rgba(58, 114, 42, 0.95)';
      ctx.beginPath();
      ctx.moveTo(worldX + offsetX, worldY + offsetY - size * 0.7);
      ctx.lineTo(worldX + offsetX - size * 0.55, worldY + offsetY + size * 0.15);
      ctx.lineTo(worldX + offsetX + size * 0.55, worldY + offsetY + size * 0.15);
      ctx.closePath();
      ctx.fill();
    }
  }

  if (cell.terrain === 'mountain') {
    if (sprites.mountaintop) {
      ctx.save();
      ctx.globalAlpha = 0.92;
      ctx.drawImage(sprites.mountaintop, worldX + 8, worldY + 8, TILE_SIZE - 16, TILE_SIZE - 16);
      ctx.restore();
    } else {
      ctx.fillStyle = 'rgba(223, 215, 203, 0.08)';
      ctx.fillRect(worldX + 12, worldY + 12, TILE_SIZE - 24, TILE_SIZE - 24);
    }
  }
}

function drawRoads(ctx, roads) {
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  roads.forEach((segment) => {
    const points = segment.map((point) => ({
      x: point.x * TILE_SIZE + TILE_SIZE / 2,
      y: point.y * TILE_SIZE + TILE_SIZE / 2
    }));

    if (points.length < 2) {
      return;
    }

    ctx.strokeStyle = 'rgba(88, 66, 43, 0.2)';
    ctx.lineWidth = 20;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    for (let index = 0; index < points.length - 1; index += 1) {
      const current = points[index];
      const next = points[index + 1];
      const prev = points[index - 1] ?? current;
      const after = points[index + 2] ?? next;

      const cp1x = current.x + (next.x - prev.x) / 6;
      const cp1y = current.y + (next.y - prev.y) / 6;
      const cp2x = next.x - (after.x - current.x) / 6;
      const cp2y = next.y - (after.y - current.y) / 6;

      ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, next.x, next.y);
    }

    ctx.stroke();

    ctx.strokeStyle = 'rgba(187, 167, 126, 0.28)';
    ctx.lineWidth = 6;
    ctx.stroke();

    ctx.setLineDash([8, 18]);
    ctx.strokeStyle = 'rgba(235, 225, 203, 0.15)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.setLineDash([]);
  });

  ctx.restore();
}

function drawFeature(ctx, feature, worldX, worldY, sprites) {
  const centerX = worldX + TILE_SIZE / 2;
  const centerY = worldY + TILE_SIZE / 2;

  if (feature.type === 'hub') {
    if (sprites.timertown && (feature.tone === 'timber' || feature.tone === 'home' || feature.tone === 'coast')) {
      ctx.save();
      ctx.globalAlpha = 0.96;
      ctx.drawImage(sprites.timertown, worldX - 8, worldY - 30, 116, 116);
      ctx.restore();
      return;
    }

    const toneColor = {
      home: '#f0dfb0',
      coast: '#8dd1fb',
      timber: '#a2d985',
      ash: '#e58c8c',
      dwarf: '#d9d4c8',
      orc: '#e6ac73'
    }[feature.tone] || '#f2f2f2';

    ctx.fillStyle = 'rgba(11, 14, 19, 0.78)';
    drawRoundedRect(ctx, worldX + 32, worldY + 32, 36, 36, 10);
    ctx.fill();
    ctx.strokeStyle = toneColor;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = toneColor;
    ctx.beginPath();
    ctx.moveTo(worldX + 50, worldY + 39);
    ctx.lineTo(worldX + 61, worldY + 49);
    ctx.lineTo(worldX + 61, worldY + 62);
    ctx.lineTo(worldX + 39, worldY + 62);
    ctx.lineTo(worldX + 39, worldY + 49);
    ctx.closePath();
    ctx.fill();
    return;
  }

  if (feature.tone === 'watchtower' && sprites.watchtower) {
    ctx.save();
    ctx.globalAlpha = 0.96;
    ctx.drawImage(sprites.watchtower, worldX - 10, worldY - 22, 120, 120);
    ctx.restore();
    return;
  }

  const toneColor = {
    watchtower: '#e3b261',
    animal: '#8fc489',
    bandit: '#ff8d8d',
    coast: '#8dd1fb',
    ash: '#e58c8c'
  }[feature.tone] || '#ffffff';

  ctx.fillStyle = 'rgba(8, 11, 16, 0.64)';
  ctx.beginPath();
  ctx.arc(centerX, centerY, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = toneColor;
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawLeader(ctx, leader) {
  ctx.save();
  ctx.translate(leader.x, leader.y);

  ctx.fillStyle = 'rgba(58, 68, 84, 0.98)';
  ctx.beginPath();
  ctx.arc(0, -6, 11, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(244, 237, 215, 0.95)';
  ctx.beginPath();
  ctx.arc(0, -8, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = 'rgba(124, 192, 255, 0.9)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, 16, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}

export default function HomeRegionMapStage({ onFocusChange }) {
  const map = useMemo(() => createHomeRegionMap(), []);
  const sprites = useTravelSpriteSet();
  const mapMask = useMapMask();
  const canvasRef = useRef(null);
  const viewportRef = useRef(null);
  const cellIndex = useMemo(() => new Map(map.cells.map((cell) => [cellKey(cell.x, cell.y), cell])), [map]);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const [leader, setLeader] = useState(() => {
    const spawnCell = cellIndex.get(cellKey(map.settlement.spawn.x, map.settlement.spawn.y));
    return getTileCenter(spawnCell);
  });
  const cameraRef = useRef(new Camera());
  const [cameraVersion, setCameraVersion] = useState(0);
  const [activeFeature, setActiveFeature] = useState(null);
  const pressedKeys = useRef(new Set());
  const animationFrameRef = useRef(0);
  const lastFrameRef = useRef(0);

  const worldWidth = map.width * TILE_SIZE;
  const worldHeight = map.height * TILE_SIZE;
  const leaderTile = getTileAtPosition(cellIndex, leader.x, leader.y);
  const promptFeature = leaderTile?.feature ?? null;

  useEffect(() => {
    setLeader((prev) => findNearestWalkablePosition(prev, mapMask, worldWidth, worldHeight));
  }, [mapMask, worldHeight, worldWidth]);

  useEffect(() => {
    onFocusChange?.(leaderTile);
  }, [leaderTile, onFocusChange]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return undefined;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const nextWidth = Math.round(entry.contentRect.width);
      const nextHeight = Math.round(entry.contentRect.height);
      setViewportSize((prev) => {
        if (prev.width === nextWidth && prev.height === nextHeight) {
          return prev;
        }
        cameraRef.current.resize(nextWidth, nextHeight);
        return { width: nextWidth, height: nextHeight };
      });
    });

    observer.observe(viewport);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'e' || event.key === 'E') {
        if (promptFeature) {
          setActiveFeature(promptFeature);
          event.preventDefault();
        }
        return;
      }

      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd', 'W', 'A', 'S', 'D'].includes(event.key)) {
        pressedKeys.current.add(event.key.toLowerCase());
        event.preventDefault();
      }
    }

    function handleKeyUp(event) {
      pressedKeys.current.delete(event.key.toLowerCase());
    }

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [promptFeature]);

  useEffect(() => {
    function frame(now) {
      const last = lastFrameRef.current || now;
      const deltaSeconds = Math.min((now - last) / 1000, 0.05);
      lastFrameRef.current = now;

      setLeader((prev) => {
        let directionX = 0;
        let directionY = 0;
        const keys = pressedKeys.current;

        if (keys.has('arrowup') || keys.has('w')) directionY -= 1;
        if (keys.has('arrowdown') || keys.has('s')) directionY += 1;
        if (keys.has('arrowleft') || keys.has('a')) directionX -= 1;
        if (keys.has('arrowright') || keys.has('d')) directionX += 1;

        if (!directionX && !directionY) {
          return prev;
        }

        const length = Math.hypot(directionX, directionY) || 1;
        const velocityX = (directionX / length) * MOVE_SPEED * deltaSeconds;
        const velocityY = (directionY / length) * MOVE_SPEED * deltaSeconds;
        let nextX = prev.x;
        let nextY = prev.y;

        const candidateX = clamp(prev.x + velocityX, 0, worldWidth - 1);
        const candidateY = clamp(prev.y + velocityY, 0, worldHeight - 1);

        const tileForX = getTileAtPosition(cellIndex, candidateX, prev.y);
        if (tileForX && !tileForX.blocked && isWalkableInMask(mapMask, candidateX, prev.y, worldWidth, worldHeight)) {
          nextX = candidateX;
        }

        const tileForY = getTileAtPosition(cellIndex, nextX, candidateY);
        if (tileForY && !tileForY.blocked && isWalkableInMask(mapMask, nextX, candidateY, worldWidth, worldHeight)) {
          nextY = candidateY;
        }

        if (nextX !== prev.x || nextY !== prev.y) {
          setActiveFeature(null);
        }

        return nextX === prev.x && nextY === prev.y ? prev : { x: nextX, y: nextY };
      });

      animationFrameRef.current = window.requestAnimationFrame(frame);
    }

    animationFrameRef.current = window.requestAnimationFrame(frame);
    return () => {
      window.cancelAnimationFrame(animationFrameRef.current);
    };
  }, [cellIndex, mapMask, worldHeight, worldWidth]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !viewportSize.width || !viewportSize.height) return;

    canvas.width = viewportSize.width;
    canvas.height = viewportSize.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    const camera = cameraRef.current;
    camera.resize(viewportSize.width, viewportSize.height);
    camera.update(leader.x, leader.y, worldWidth, worldHeight);
    ctx.translate(-camera.x, -camera.y);

    const { minTileX, maxTileX, minTileY, maxTileY } = camera.getVisibleTileBounds(map.width, map.height);
    const minWorldX = minTileX * TILE_SIZE;
    const minWorldY = minTileY * TILE_SIZE;
    const visibleWorldWidth = (maxTileX - minTileX + 1) * TILE_SIZE;
    const visibleWorldHeight = (maxTileY - minTileY + 1) * TILE_SIZE;
    const now = performance.now();

    if (sprites.mainmap) {
      ctx.drawImage(sprites.mainmap, 0, 0, worldWidth, worldHeight);
    } else {
      drawBaseGround(ctx, minWorldX, minWorldY, visibleWorldWidth, visibleWorldHeight);
      drawMergedWaterRegions(ctx, cellIndex, minTileX, minTileY, maxTileX, maxTileY, now);

      for (let y = minTileY; y <= maxTileY; y += 1) {
        for (let x = minTileX; x <= maxTileX; x += 1) {
          const cell = cellIndex.get(cellKey(x, y));
          if (!cell) continue;
          const worldX = x * TILE_SIZE;
          const worldY = y * TILE_SIZE;
          drawTerrainPatch(ctx, cellIndex, cell, worldX, worldY, now);
        }
      }

      for (let y = minTileY; y <= maxTileY; y += 1) {
        for (let x = minTileX; x <= maxTileX; x += 1) {
          const cell = cellIndex.get(cellKey(x, y));
          if (!cell) continue;
          const worldX = x * TILE_SIZE;
          const worldY = y * TILE_SIZE;
          if (cell.terrain !== 'shore-water' && cell.terrain !== 'deep-water') {
            drawShoreBlend(ctx, cellIndex, cell, worldX, worldY);
          }
          drawClutter(ctx, cell, worldX, worldY, sprites);
        }
      }

      drawRoads(ctx, map.roads);
    }

    for (let y = minTileY; y <= maxTileY; y += 1) {
      for (let x = minTileX; x <= maxTileX; x += 1) {
        const cell = cellIndex.get(cellKey(x, y));
        if (!cell?.feature) continue;
        drawFeature(ctx, cell.feature, x * TILE_SIZE, y * TILE_SIZE, sprites);
      }
    }

    drawLeader(ctx, leader);
    ctx.restore();
  }, [cameraVersion, cellIndex, leader, map.height, map.roads, map.width, sprites, viewportSize, worldHeight, worldWidth]);

  useEffect(() => {
    if (!viewportSize.width || !viewportSize.height) return undefined;

    let rafId = 0;
    const renderTick = () => {
      setCameraVersion((value) => value + 1);
      rafId = window.requestAnimationFrame(renderTick);
    };
    rafId = window.requestAnimationFrame(renderTick);
    return () => window.cancelAnimationFrame(rafId);
  }, [viewportSize]);

  return (
    <div className="travel-map-stage home-region-stage">
      <div ref={viewportRef} className="travel-map-canvas-shell">
        <canvas ref={canvasRef} className="travel-map-canvas" />

        {promptFeature && (
          <div className="travel-map-prompt">
            <span className={`prompt-chip ${promptFeature.type} ${promptFeature.tone}`}>{promptFeature.type === 'hub' ? 'Settlement' : 'POI'}</span>
            <strong>{promptFeature.name}</strong>
            <span>Press `E` to inspect</span>
          </div>
        )}

        {activeFeature && (
          <div className="travel-feature-panel">
            <div className="travel-feature-panel-header">
              <span className={`prompt-chip ${activeFeature.type} ${activeFeature.tone}`}>
                {activeFeature.type === 'hub' ? activeFeature.people : 'Point of Interest'}
              </span>
              <button type="button" className="travel-feature-close" onClick={() => setActiveFeature(null)}>
                Close
              </button>
            </div>
            <h3>{activeFeature.name}</h3>
            <p>{activeFeature.detail}</p>
          </div>
        )}
      </div>
    </div>
  );
}
