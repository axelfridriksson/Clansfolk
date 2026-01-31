export const BUILDINGS = {
  grasshut: { name: 'Grass Huts', desc: '+4 Clansfolk cap', detail: 'Adds room for 4 more clansfolk.', cost: { wood: 20, food: 10 }, group: 'Buildings', unlocks: 'Timber Halls, Storehouse, Smokehouse' },
  timberhall: { name: 'Timber Halls', desc: '+6 Clansfolk cap', detail: 'Adds room for 6 more clansfolk.', cost: { wood: 60, food: 30 }, group: 'Buildings', unlocks: 'Longhouse' },
  longhouse: { name: 'Longhouse', desc: '+8 Clansfolk cap', detail: 'Adds room for 8 more clansfolk.', cost: { wood: 120, food: 60 }, group: 'Buildings', unlocks: 'Stone Keep' },
  stonekeep: { name: 'Stone Keep', desc: '+10 Clansfolk cap', detail: 'Adds room for 10 more clansfolk.', cost: { wood: 180, stone: 120 }, group: 'Buildings' },
  storehouse: { name: 'Storehouse', desc: '+150 storage to food/wood/stone/metal', detail: 'Raises storage cap for core materials by 150.', cost: { wood: 90, stone: 40 }, group: 'Buildings' },
  smokehouse: { name: 'Smokehouse', desc: '+200 food cap', detail: 'Raises food storage by 200.', cost: { wood: 80, food: 60 }, group: 'Buildings' }
};

export const UPGRADES = {
  woodsword: { name: 'Wood Sword', desc: '+5% warband damage per level', detail: 'Each level improves warband damage by 5%.', cost: { wood: 40, knowledge: 5 }, group: 'Weapons', unlocks: 'Steel Sword' },
  woodshield: { name: 'Wood Shield', desc: '+5% warband health per level', detail: 'Each level improves warband health by 5%.', cost: { wood: 40, knowledge: 5 }, group: 'Weapons', unlocks: 'Iron Shield' },
  woolarmor: { name: 'Wool Armor', desc: '+5% warband health per level', detail: 'Each level improves warband health by 5%.', cost: { food: 50, knowledge: 5 }, group: 'Weapons' },
  steelsword: { name: 'Steel Sword', desc: '+15% warband damage per level', detail: 'Each level improves warband damage by 15%.', cost: { metal: 80, wood: 60, knowledge: 10 }, group: 'Weapons' },
  ironshield: { name: 'Iron Shield', desc: '+15% warband health per level', detail: 'Each level improves warband health by 15%.', cost: { metal: 90, wood: 60, knowledge: 10 }, group: 'Weapons' },
  nets: { name: 'Fishing Nets', desc: '+10% food production per level', detail: 'Each level makes food gathering 10% faster.', cost: { food: 80, wood: 60, knowledge: 5 }, group: 'Upgrades', unlocks: 'Steel Hooks' },
  steelhooks: { name: 'Steel Hooks', desc: '+20% food production per level', detail: 'Each level makes food gathering 20% faster.', cost: { metal: 80, wood: 80, knowledge: 10 }, group: 'Upgrades', requires: 'nets' },
  axes: { name: 'Sharpened Axes', desc: '+10% wood production per level', detail: 'Each level makes wood gathering 10% faster.', cost: { wood: 90, stone: 40, knowledge: 5 }, group: 'Upgrades', unlocks: 'Felling Axes' },
  fellingaxes: { name: 'Felling Axes', desc: '+20% wood production per level', detail: 'Each level makes wood gathering 20% faster.', cost: { wood: 140, stone: 80, knowledge: 10 }, group: 'Upgrades', requires: 'axes' },
  scholars: { name: 'Skald Scholars', desc: '+10% knowledge production per level', detail: 'Each level makes knowledge gathering 10% faster.', cost: { food: 60, wood: 60, knowledge: 5 }, group: 'Upgrades' },
  growthrites: { name: 'Growth Rites', desc: '+20% clansfolk growth per level', detail: 'Each level fills the growth bar 20% faster.', cost: { food: 100, wood: 80, knowledge: 8 }, group: 'Upgrades' },
  workrhythm: { name: 'Work Rhythm', desc: '+10% worker efficiency per level', detail: 'Each level makes all worker production 10% faster.', cost: { food: 80, wood: 80, knowledge: 8 }, group: 'Upgrades' },
  stoneworking: { name: 'Stoneworking', desc: 'Unlock Stone', detail: 'Enables stone gathering and storage.', cost: { food: 60, wood: 60 }, group: 'Upgrades' },
  mining: { name: 'Mining', desc: 'Unlock Metal', detail: 'Enables metal gathering and storage.', cost: { wood: 100, stone: 80 }, group: 'Upgrades', requires: 'stoneworking' },
  ashgathering: { name: 'Ash Gathering', desc: 'Unlock Ash', detail: 'Enables ash collection from later zones.', cost: { wood: 120, stone: 120 }, group: 'Upgrades', requires: 'mining' },
  lorekeeping: { name: 'Lorekeeping', desc: 'Unlock Knowledge', detail: 'Enables knowledge gathering.', cost: { food: 80, wood: 80 }, group: 'Upgrades', requires: 'stoneworking' },
  forgeSteelsword: { name: 'Forge Steel Swords', desc: 'Upgrade Wood Swords → Steel Swords', detail: 'Replaces Wood Swords with Steel Swords.', cost: { metal: 120, wood: 80, knowledge: 15 }, group: 'Upgrades' },
  forgeIronshield: { name: 'Forge Iron Shields', desc: 'Upgrade Wood Shields → Iron Shields', detail: 'Replaces Wood Shields with Iron Shields.', cost: { metal: 120, wood: 80, knowledge: 15 }, group: 'Upgrades' },
  longboats: { name: 'Longboats', desc: 'Travel time −20%', detail: 'Warband travel and scouting is 20% faster.', cost: { wood: 120, food: 80, knowledge: 8 }, group: 'Travel', unlocks: 'Ice Sleds' },
  icesleds: { name: 'Ice Sleds', desc: 'Travel time −35%', detail: 'Warband travel and scouting is 35% faster.', cost: { wood: 160, stone: 80, knowledge: 12 }, group: 'Travel', requires: 'longboats' }
};

export const JOBS = {
  forager: { name: 'Forager', desc: '+1 food/s' },
  woodcutter: { name: 'Woodcutter', desc: '+1 wood/s' },
  quarry: { name: 'Quarry Worker', desc: '+1 stone/s' },
  smelter: { name: 'Smelter', desc: '+1 metal/s' },
  lorekeeper: { name: 'Lorekeeper', desc: '+1 rune knowledge/s' },
  ashwalker: { name: 'Ashwalker', desc: '+1 ash/s' },
  drillmaster: { name: 'Drillmaster', desc: '+0.12 warband atk/s' }
};

export const TECHS = {
  thawing: {
    name: 'Thawing Rites',
    desc: 'Heat losses soften when warmth is above 60%.',
    cost: { ash: 30, knowledge: 20 },
    unlocks: ['rune-scalar']
  },
  ridgepaths: {
    name: 'Ridgepaths',
    desc: '+1 supply range, -5% attrition.',
    cost: { food: 120, wood: 120 },
    unlocks: []
  },
  deepkiln: {
    name: 'Deep Kiln',
    desc: '+10% furnace efficiency, +1 heat cap.',
    cost: { wood: 200, stone: 160, metal: 60 },
    unlocks: []
  }
};

export const MEMORIES = {
  emberway: {
    name: 'Emberway Memory',
    desc: 'Heat curve softens above 70% warmth.',
    effect: { type: 'curve', target: 'heat', value: 0.12 }
  },
  ashbond: {
    name: 'Ashbond Memory',
    desc: 'Rune knowledge also adds +0.5% production each.',
    effect: { type: 'add', target: 'prodMult', value: 0.005 }
  },
  ironseason: {
    name: 'Iron Season Memory',
    desc: 'Warband gear scales with sqrt(metal).',
    effect: { type: 'curve', target: 'gearPower', value: 0.5 }
  }
};
