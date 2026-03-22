export const COMMANDER_RARITIES = {
  common: { id: 'common', label: 'Common' },
  rare: { id: 'rare', label: 'Rare' },
  epic: { id: 'epic', label: 'Epic' },
  legendary: { id: 'legendary', label: 'Legendary' }
};

export const COMMANDER_DEFS = {
  runa_iceborn: {
    id: 'runa_iceborn',
    name: 'Runa Iceborn',
    rarity: 'rare',
    role: 'melee',
    stats: { might: 6, guard: 5, command: 7 },
    traits: ['Steady Hand', 'Path Reader']
  },
  edda_wolfscar: {
    id: 'edda_wolfscar',
    name: 'Edda Wolf-Scar',
    rarity: 'common',
    role: 'melee',
    stats: { might: 5, guard: 4, command: 3 },
    traits: ['Linebreaker']
  },
  skari_reedeye: {
    id: 'skari_reedeye',
    name: 'Skari Reed-Eye',
    rarity: 'rare',
    role: 'bowmen',
    stats: { might: 5, guard: 3, command: 7 },
    traits: ['Arrow Marshal', 'Cold Tracker']
  },
  yrsa_flintstring: {
    id: 'yrsa_flintstring',
    name: 'Yrsa Flintstring',
    rarity: 'common',
    role: 'bowmen',
    stats: { might: 4, guard: 3, command: 4 },
    traits: ['Volley Keeper']
  },
  hakon_ashlance: {
    id: 'hakon_ashlance',
    name: 'Hakon Ash-Lance',
    rarity: 'epic',
    role: 'spearmen',
    stats: { might: 7, guard: 7, command: 6 },
    traits: ['Brace Line', 'Quartermaster', 'Rally Keeper']
  },
  torhild_ironveil: {
    id: 'torhild_ironveil',
    name: 'Torhild Iron-Veil',
    rarity: 'epic',
    role: 'heavy',
    stats: { might: 8, guard: 8, command: 4 },
    traits: ['Stone Nerve', 'Holdfast', 'Shield Discipline']
  },
  bjorn_saddleborn: {
    id: 'bjorn_saddleborn',
    name: 'Bjorn Saddle-Born',
    rarity: 'rare',
    role: 'horsemen',
    stats: { might: 6, guard: 4, command: 6 },
    traits: ['Fast Screen', 'Pursuit Leader']
  },
  red_warden: {
    id: 'red_warden',
    name: 'The Red Warden',
    rarity: 'legendary',
    role: 'melee',
    stats: { might: 9, guard: 8, command: 8 },
    traits: ['Linebreaker', 'Steady Hand', 'War Voice']
  }
};

export function createStarterCommandState() {
  return {
    seals: 0,
    activeId: 'runa_iceborn',
    ownedIds: ['runa_iceborn'],
    lastRecruit: null,
    gearInventory: {},
    gearEquipped: {}
  };
}

export const COMMANDER_CHARTERS = {
  common: {
    id: 'common',
    label: 'Common Charter',
    cost: 100,
    minRarity: 'common'
  },
  rare: {
    id: 'rare',
    label: 'Rare Charter',
    cost: 300,
    minRarity: 'rare'
  },
  epic: {
    id: 'epic',
    label: 'Epic Charter',
    cost: 800,
    minRarity: 'epic'
  }
};

const RARITY_ORDER = ['common', 'rare', 'epic', 'legendary'];

export function getCharterPool(minRarity) {
  const minIndex = RARITY_ORDER.indexOf(minRarity);
  return Object.values(COMMANDER_DEFS).filter((commander) => RARITY_ORDER.indexOf(commander.rarity) >= minIndex);
}

export function getCommanderBonusPreview(commander) {
  if (!commander) return [];
  return [
    `+${commander.stats.might}% ${commander.role} attack`,
    `-${Math.max(1, Math.floor(commander.stats.guard / 2))}% casualty pressure`,
    `+${commander.stats.command}% command efficiency`
  ];
}
