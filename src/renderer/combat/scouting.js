import { WARBAND_ROLES } from './roles.js';

const SCOUT_PATTERNS = {
  melee: ['a loose melee line', 'a shielded host', 'a grinding frontline'],
  bowmen: ['rear archers', 'harrying skirmishers', 'ranged pressure'],
  horsemen: ['fast flankers', 'beast riders', 'wide pursuit lines'],
  spearmen: ['braced spears', 'anti-charge ranks', 'hooked polearms'],
  heavy: ['heavy breakers', 'armored elites', 'captain-led pressure']
};

export function getScoutReport(state, quality = 'full') {
  const enemyRole = state.world.enemyArchetype
    ? inferEnemyRole(state.world.enemyArchetype)
    : 'melee';
  const zone = Math.max(1, state.world.zone || 1);
  const enemyIndex = Math.max(1, state.world.enemyIndex || 1);
  const lines = [];

  const rolePattern = pickFrom(SCOUT_PATTERNS[enemyRole] || SCOUT_PATTERNS.melee, zone + enemyIndex);
  const groupLabel = state.world.enemyForceLabel || 'hostile group';
  const countText = getScoutCountText(state.world.enemyCount || 1, quality);
  lines.push(`Scouts report ${groupLabel} of ${countText} led by ${state.world.enemyName || 'a hostile leader'}.`);
  if (quality !== 'low') {
    lines.push(`The group shows ${rolePattern}.`);
  }

  if (quality !== 'low' && state.world.enemyTraits?.includes('shielded')) {
    lines.push('Frontline looks steady and hard to break.');
  } else if (quality !== 'low' && (state.world.enemyTraits?.includes('fast') || state.world.enemyTraits?.includes('harrier'))) {
    lines.push('Expect quick pressure and loose movement.');
  } else if (quality !== 'low' && (state.world.enemyTraits?.includes('heavy') || state.world.enemyTraits?.includes('elite'))) {
    lines.push('Enemy weight is high; this will not break fast.');
  } else if (quality !== 'low' && (state.world.enemyTraits?.includes('beast') || state.world.enemyTraits?.includes('pouncing'))) {
    lines.push('The pack looks ready to rush exposed lines.');
  }

  const knownCounter = quality === 'full' ? getCounterHint(enemyRole) : null;
  if (knownCounter) {
    lines.push(knownCounter);
  }

  return lines.slice(0, quality === 'full' ? 3 : quality === 'mid' ? 2 : 1);
}

function inferEnemyRole(archetype) {
  if (archetype === 'skirmish') return 'bowmen';
  if (archetype === 'beast') return 'horsemen';
  if (archetype === 'brute' || archetype === 'captain') return 'heavy';
  return 'melee';
}

function getCounterHint(role) {
  if (role === 'bowmen') return 'A tighter line should close on them cleanly.';
  if (role === 'horsemen') return 'Longer reach and tighter ranks would help absorb the rush.';
  if (role === 'heavy') return 'Expect a grind; do not rely on a quick collapse.';
  return 'A disciplined melee line should hold if your kit is sound.';
}

function pickFrom(items, seed) {
  return items[seed % items.length];
}

export function getRoleScoutLabel(roleId) {
  return WARBAND_ROLES[roleId]?.label || roleId;
}

function getScoutCountText(count, quality) {
  if (quality === 'full') return `${count}`;
  if (quality === 'mid') {
    if (count <= 2) return '1-2';
    if (count <= 4) return '3-4';
    return '5+';
  }
  if (count <= 2) return 'a few';
  if (count <= 4) return 'several';
  return 'many';
}
