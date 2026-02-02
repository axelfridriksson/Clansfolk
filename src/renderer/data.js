import grassHutIcon from './assets/icons/grasshut.png';
import timberHallsIcon from './assets/icons/timberhalls.png';
import smokehouseIcon from './assets/icons/smokehouse.png';
import warcampIcon from './assets/icons/warcamp.png';
import stonekeepIcon from './assets/icons/stonehouse.png';
import woodcuttersShedIcon from './assets/icons/woodcutters_shed.png';
import storehouseIcon from './assets/icons/storehouse.png';
import skaldHallIcon from './assets/icons/skaldhall.png';

export const BUILDINGS = {
  grasshut: { name: 'Grass Huts', desc: '+4 Clansfolk cap', detail: 'Adds room for 4 more clansfolk.', cost: { wood: 20, food: 10 }, group: 'Buildings', unlocks: 'Timber Halls', icon: grassHutIcon },
  timberhall: { name: 'Timber Halls', desc: '+6 Clansfolk cap', detail: 'Adds room for 6 more clansfolk.', cost: { wood: 60, food: 30 }, group: 'Buildings', unlocks: 'Longhouse', icon: timberHallsIcon },
  longhouse: { name: 'Longhouse', desc: '+8 Clansfolk cap', detail: 'Adds room for 8 more clansfolk.', cost: { wood: 120, food: 60 }, group: 'Buildings', unlocks: 'Warcamp, Storehouse' },
  stonekeep: { name: 'Stone Keep', desc: '+10 Clansfolk cap', detail: 'Adds room for 10 more clansfolk.', cost: { wood: 180, stone: 120 }, group: 'Buildings', requires: ['longhouse', 'sheepfarming'], icon: stonekeepIcon },
  storehouse: { name: 'Storehouse', desc: '+50% resource cap per level', detail: 'Increases food/wood/stone/metal caps by 50% per level.', cost: { wood: 180, stone: 120 }, group: 'Buildings', requires: 'longhouse', icon: storehouseIcon },
  smokehouse: { name: 'Smokehouse', desc: '+200 food cap', detail: 'Raises food storage by 200.', cost: { wood: 80, food: 60 }, group: 'Buildings', requires: 'nets', icon: smokehouseIcon },
  woodcuttershed: { name: 'Woodcutter\'s Shed', desc: '+200 wood storage', detail: 'Raises wood storage by 200.', cost: { wood: 120, food: 40 }, group: 'Buildings', requires: 'axes', icon: woodcuttersShedIcon },
  warcamp: { name: 'Warcamp', desc: '+1 warband slot first, then +2 per level', detail: 'Expands the warband cap.', cost: { wood: 140, food: 80 }, group: 'Buildings', requires: 'longhouse', icon: warcampIcon },
  skaldhall: { name: 'Skald Hall', desc: '+200 knowledge storage per level', detail: 'Increases knowledge storage by 200 per level.', cost: { wood: 160, stone: 100, knowledge: 20 }, group: 'Buildings', requires: 'lorekeeping', icon: skaldHallIcon }
};

export const UPGRADES = {
  nets: { name: 'Fishing Nets', desc: '+10% food production per level', detail: 'Each level makes food gathering 10% faster.', cost: { food: 80, wood: 60, knowledge: 5 }, group: 'Innovation', unlocks: 'Smokehouse' },
  steelhooks: { name: 'Steel Hooks', desc: '+20% food production per level', detail: 'Each level makes food gathering 20% faster.', cost: { metal: 80, wood: 80, knowledge: 10 }, group: 'Innovation', requires: 'nets' },
  axes: { name: 'Sharpened Axes', desc: '+10% wood production per level', detail: 'Each level makes wood gathering 10% faster.', cost: { wood: 90, food: 40, knowledge: 5 }, group: 'Innovation', unlocks: 'Woodcutter\'s Shed' },
  fellingaxes: { name: 'Felling Axes', desc: '+20% wood production per level', detail: 'Each level makes wood gathering 20% faster.', cost: { wood: 140, stone: 80, knowledge: 10 }, group: 'Innovation', requires: 'axes' },
  woodcutting1: { name: 'Woodcutting I', desc: '+12% wood production per level', detail: 'Woodcutters work 12% faster per level.', cost: { wood: 120, food: 60, knowledge: 6 }, group: 'Innovation', requires: 'woodcuttershed' },
  sheepfarming: { name: 'Sheep Farming', desc: 'Unlocks wool gear and agriculture', detail: 'Enables wool armor and agriculture upgrades.', cost: { food: 140, wood: 120, knowledge: 8 }, group: 'Innovation', requires: ['smokehouse', 'woodcutting1'], unlocks: 'Wool Armor, Agriculture, Stone Keep' },
  agriculture: { name: 'Agriculture', desc: '+15% food production per level', detail: 'Each level makes food gathering 15% faster.', cost: { food: 120, wood: 80, knowledge: 10 }, group: 'Innovation', requires: 'sheepfarming' },
  scholars: { name: 'Skald Scholars', desc: '+10% knowledge production per level', detail: 'Each level makes knowledge gathering 10% faster.', cost: { food: 60, wood: 60, knowledge: 5 }, group: 'Innovation' },
  growthrites: { name: 'Growth Rites', desc: '+20% clansfolk growth per level', detail: 'Each level fills the growth bar 20% faster.', cost: { food: 100, wood: 80, knowledge: 8 }, group: 'Innovation' },
  workrhythm: { name: 'Work Rhythm', desc: '+10% worker efficiency per level', detail: 'Each level makes all worker production 10% faster.', cost: { food: 80, wood: 80, knowledge: 8 }, group: 'Innovation' },
  stoneworking: { name: 'Stoneworking', desc: 'Unlock Stone', detail: 'Enables stone gathering and storage.', cost: { food: 60, wood: 60 }, group: 'Innovation', requires: 'woodcutting1' },
  mining: { name: 'Mining', desc: 'Unlock Metal', detail: 'Enables metal gathering and storage.', cost: { wood: 100, stone: 80 }, group: 'Innovation', requires: 'stoneworking' },
  ashgathering: { name: 'Ash Gathering', desc: 'Unlock Ash', detail: 'Enables ash collection from later zones.', cost: { wood: 120, stone: 120 }, group: 'Innovation', requires: 'mining' },
  lorekeeping: { name: 'Old World Knowledge', desc: 'Unlock Knowledge', detail: 'Enables knowledge storage and tracking.', cost: { food: 80, wood: 80 }, group: 'Innovation' },
  skaldtraining: { name: 'Skald Training', desc: 'Unlock Lorekeepers', detail: 'Allows clansfolk to work as lorekeepers.', cost: { food: 100, wood: 100, knowledge: 20 }, group: 'Innovation', requires: 'lorekeeping' },
  armory1: { name: 'Armory Craft I', desc: 'Unlock Reinforced Gear', detail: 'Unlocks reinforced swords, shields, and armor in the blacksmith.', cost: { wood: 140, stone: 80, knowledge: 20 }, group: 'Innovation', requires: 'stoneworking', requiresZone: 6 },
  armory2: { name: 'Armory Craft II', desc: 'Unlock Iron Gear', detail: 'Unlocks iron swords, shields, and armor in the blacksmith.', cost: { wood: 180, metal: 140, knowledge: 35 }, group: 'Innovation', requires: 'armory1', requiresZone: 12 },
  longboats: { name: 'Longboats', desc: 'Travel time −20%', detail: 'Warband travel and scouting is 20% faster.', cost: { wood: 120, food: 80, knowledge: 8 }, group: 'Travel', unlocks: 'Ice Sleds' },
  icesleds: { name: 'Ice Sleds', desc: 'Travel time −35%', detail: 'Warband travel and scouting is 35% faster.', cost: { wood: 160, stone: 80, knowledge: 12 }, group: 'Travel', requires: 'longboats' }
};

export const BLACKSMITH_ITEMS = {
  woodsword: { name: 'Wood Sword', cost: { wood: 40 }, slot: 'weapon', atk: 2, unlock: null },
  woodshield: { name: 'Wood Shield', cost: { wood: 40 }, slot: 'shield', hp: 2, unlock: null },
  woolarmor: { name: 'Wool Armor', cost: { food: 50 }, slot: 'armor', hp: 4, unlock: null },
  reinforcedsword: { name: 'Reinforced Sword', cost: { wood: 90, stone: 40, knowledge: 8 }, slot: 'weapon', atk: 4, unlock: 'weaponTier2' },
  reinforcedshield: { name: 'Reinforced Shield', cost: { wood: 80, stone: 50, knowledge: 8 }, slot: 'shield', hp: 5, unlock: 'weaponTier2' },
  paddedarmor: { name: 'Padded Armor', cost: { food: 100, wood: 70, knowledge: 10 }, slot: 'armor', hp: 8, unlock: 'weaponTier2' },
  ironsword: { name: 'Iron Sword', cost: { metal: 100, wood: 60, knowledge: 15 }, slot: 'weapon', atk: 7, unlock: 'weaponTier3' },
  ironshield: { name: 'Iron Shield', cost: { metal: 110, wood: 50, knowledge: 15 }, slot: 'shield', hp: 9, unlock: 'weaponTier3' },
  chainarmor: { name: 'Chain Armor', cost: { metal: 120, food: 80, knowledge: 18 }, slot: 'armor', hp: 14, unlock: 'weaponTier3' }
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
