export const ROLE_ORDER = ['melee', 'bowmen', 'horsemen', 'spearmen', 'heavy'];

export const WARBAND_ROLES = {
  melee: {
    id: 'melee',
    label: 'Melee',
    stage: 'early',
    unlock: null,
    slots: ['weapon', 'shield', 'armor'],
    job: 'Baseline frontline',
    strongInto: ['light raiders', 'general pressure'],
    weakInto: ['heavy infantry', 'sustained ranged fire']
  },
  bowmen: {
    id: 'bowmen',
    label: 'Bowmen',
    stage: 'mid',
    unlock: 'weaponTier2',
    slots: ['ranged', 'light'],
    job: 'Backline damage',
    strongInto: ['skirmishers', 'beasts', 'exposed units'],
    weakInto: ['cavalry', 'direct frontline pressure']
  },
  horsemen: {
    id: 'horsemen',
    label: 'Horsemen',
    stage: 'mid',
    unlock: 'roleHorsemen',
    slots: ['mount', 'weapon', 'armor'],
    job: 'Flank and chase',
    strongInto: ['bowmen', 'routed units'],
    weakInto: ['spearmen', 'shield walls']
  },
  spearmen: {
    id: 'spearmen',
    label: 'Spearmen',
    stage: 'late',
    unlock: 'roleSpearmen',
    slots: ['weapon', 'shield', 'armor'],
    job: 'Anti-charge line',
    strongInto: ['horsemen', 'beasts', 'aggressive melee'],
    weakInto: ['bows', 'heavy infantry']
  },
  heavy: {
    id: 'heavy',
    label: 'Heavy Infantry',
    stage: 'late',
    unlock: 'roleHeavy',
    slots: ['weapon', 'shield', 'armor'],
    job: 'Durable breaker',
    strongInto: ['melee lines', 'shield walls'],
    weakInto: ['concentrated ranged fire', 'flanks']
  }
};

export const ROLE_SLOT_LABELS = {
  weapon: 'Weapon',
  shield: 'Shield',
  armor: 'Armor',
  ranged: 'Bow',
  light: 'Light Armor',
  mount: 'Mount'
};

export function createEmptyWarbandRoles() {
  return {
    melee: 0,
    bowmen: 0,
    horsemen: 0,
    spearmen: 0,
    heavy: 0
  };
}

export function createEmptyWarbandHealth() {
  return {
    melee: { hp: 0, hpMax: 0 },
    bowmen: { hp: 0, hpMax: 0 },
    horsemen: { hp: 0, hpMax: 0 },
    spearmen: { hp: 0, hpMax: 0 },
    heavy: { hp: 0, hpMax: 0 }
  };
}

export function getUnlockedWarbandRoles(state) {
  return ROLE_ORDER.filter((id) => {
    const role = WARBAND_ROLES[id];
    return !role.unlock || state.unlocks?.[role.unlock];
  });
}
