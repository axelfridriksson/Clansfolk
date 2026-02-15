import grassHutIcon from './assets/icons/grasshut.png';
import timberHallsIcon from './assets/icons/timberhalls.png';
import smokehouseIcon from './assets/icons/smokehouse.png';
import warcampIcon from './assets/icons/warcamp.png';
import stonekeepIcon from './assets/icons/stonehouse.png';
import woodcuttersShedIcon from './assets/icons/woodcutters_shed.png';
import storehouseIcon from './assets/icons/storehouse.png';
import skaldHallIcon from './assets/icons/skaldhall.png';

export const PATRONS = [
  {
    id: 'hearth',
    name: 'Hearthwarden',
    desc: 'Ritual reward: +10% food, +10% wood, +10% growth',
    detail: 'The hearth keeps the clansfolk fed and growing.',
    cost: { ash: 40 },
    effects: { foodMult: 0.1, woodMult: 0.1, growthMult: 0.1 }
  },
  {
    id: 'storm',
    name: 'Stormbound',
    desc: 'Ritual reward: +12% warband ATK, +8% warband HP',
    detail: 'The storm hardens the warband for battle.',
    cost: { ash: 50 },
    effects: { atkMult: 0.12, hpMult: 0.08 }
  },
  {
    id: 'veil',
    name: 'Veil of Ash',
    desc: 'Ritual reward: +20% knowledge, +20% ash gain',
    detail: 'The ash remembers. Knowledge and embers linger.',
    cost: { ash: 45 },
    effects: { knowledgeMult: 0.2, ashGainMult: 0.2 }
  }
];

export const RITES_BUILDINGS = {
  ashshrine: {
    name: 'Ash Shrine',
    desc: '+6% patron effect per level',
    detail: 'Deepens your chosen patron’s gifts.',
    cost: { ash: 35, wood: 80 },
    scale: 1.18
  },
  embercairn: {
    name: 'Ember Cairn',
    desc: '+50 ash storage per level',
    detail: 'Holds more ash and keeps embers from blowing away.',
    cost: { ash: 50, stone: 90 },
    scale: 1.2
  },
  hymnhall: {
    name: 'Hymn Hall',
    desc: '+8% growth per level',
    detail: 'Steadies clansfolk growth through ritual.',
    cost: { ash: 60, food: 120, wood: 70 },
    scale: 1.2
  }
};

export const BUILDINGS = {
  grasshut: { name: 'Grass Huts', desc: '+4 Clansfolk cap', detail: 'Adds room for 4 more clansfolk.', cost: { wood: 90, food: 45 }, group: 'Buildings', unlocks: 'Timber Halls', icon: grassHutIcon, scale: 1.03 },
  timberhall: { name: 'Timber Halls', desc: '+6 Clansfolk cap', detail: 'Adds room for 6 more clansfolk.', cost: { wood: 180, food: 90 }, group: 'Buildings', unlocks: 'Longhouse', icon: timberHallsIcon },
  longhouse: { name: 'Longhouse', desc: '+8 Clansfolk cap', detail: 'Adds room for 8 more clansfolk.', cost: { wood: 280, food: 140 }, group: 'Buildings', unlocks: 'Warcamp, Storehouse' },
  stonekeep: { name: 'Stone Keep', desc: '+10 Clansfolk cap', detail: 'Adds room for 10 more clansfolk.', cost: { wood: 420, stone: 240 }, group: 'Buildings', requires: ['longhouse', 'sheepfarming'], icon: stonekeepIcon },
  storehouse: { name: 'Storehouse', desc: '+50% resource cap per level', detail: 'Increases food/wood/stone/metal caps by 50% per level.', cost: { wood: 240, stone: 160 }, group: 'Buildings', requires: 'longhouse', icon: storehouseIcon },
  smokehouse: { name: 'Smokehouse', desc: '+200 food cap', detail: 'Raises food storage by 200.', cost: { wood: 120, food: 80 }, group: 'Buildings', requires: 'nets', icon: smokehouseIcon, scale: 1.12 },
  woodcuttershed: { name: 'Woodcutter\'s Shed', desc: '+200 wood storage', detail: 'Raises wood storage by 200.', cost: { wood: 140, food: 60 }, group: 'Buildings', requires: 'axes', icon: woodcuttersShedIcon, scale: 1.12 },
  granaryhall: { name: 'Granary Hall', desc: '+250 food storage and +8% food output per level', detail: 'Expands food reserves and improves food processing.', cost: { wood: 260, stone: 160, knowledge: 22 }, group: 'Buildings', requires: ['croprotation', 'longhouse'], scale: 1.14 },
  timberyard: { name: 'Timber Yard', desc: '+250 wood storage and +8% wood output per level', detail: 'Improves lumber flow and wood reserves.', cost: { wood: 300, stone: 140, knowledge: 22 }, group: 'Buildings', requires: ['lumbergrading', 'longhouse'], scale: 1.14 },
  masonryard: { name: 'Mason\'s Yard', desc: '+150 stone storage and +10% stone output per level', detail: 'Improves quarry shaping and stone throughput.', cost: { wood: 280, stone: 220, knowledge: 26 }, group: 'Buildings', requires: ['stonesurveying', 'longhouse'], scale: 1.15 },
  smeltery: { name: 'Smeltery', desc: '+150 metal storage and +10% metal output per level', detail: 'Refines metal flow and furnace output.', cost: { wood: 320, stone: 260, metal: 120, knowledge: 30 }, group: 'Buildings', requires: ['bloomerymethods', 'longhouse'], scale: 1.16 },
  warcamp: { name: 'Warcamp', desc: '+1 warband slot first, then +2 per level', detail: 'Expands the warband cap.', cost: { wood: 200, food: 120 }, group: 'Buildings', requires: 'longhouse', icon: warcampIcon },
  skaldhall: { name: 'Skald Hall', desc: '+200 knowledge storage per level', detail: 'Increases knowledge storage by 200 per level.', cost: { wood: 200, stone: 140, knowledge: 25 }, group: 'Buildings', requires: 'lorekeeping', icon: skaldHallIcon },
  quarrycamp: { name: 'Quarry Camp', desc: '+12% stone output and +150 stone storage per level', detail: 'Improves quarry output and expands stone storage.', cost: { wood: 220, stone: 120, knowledge: 18 }, group: 'Buildings', requires: ['quarrylogistics', 'longhouse'], scale: 1.14 },
  foundry: { name: 'Foundry', desc: '+12% metal output and +150 metal storage per level', detail: 'Refines ore flow and expands metal storage.', cost: { wood: 260, stone: 180, metal: 80, knowledge: 24 }, group: 'Buildings', requires: ['forgeprotocols', 'longhouse'], scale: 1.15 },
  ashaltar: { name: 'Ash Altar', desc: '+15% ash gain and +60 ash storage per level', detail: 'Deepens ash rites and improves ash spoils from battle.', cost: { wood: 220, stone: 200, ash: 80, knowledge: 30 }, group: 'Buildings', requires: ['ashdoctrine', 'stonekeep'], scale: 1.16 }
};

export const UPGRADES = {
  nets: { name: 'Fishing Nets', desc: '+10% food production per level', detail: 'Each level makes food gathering 10% faster.', cost: { food: 100, wood: 80, knowledge: 5 }, group: 'Innovation', unlocks: 'Smokehouse' },
  steelhooks: { name: 'Steel Hooks', desc: '+20% food production per level', detail: 'Each level makes food gathering 20% faster.', cost: { metal: 80, wood: 80, knowledge: 10 }, group: 'Innovation', requires: 'nets' },
  axes: { name: 'Sharpened Axes', desc: '+10% wood production per level', detail: 'Each level makes wood gathering 10% faster.', cost: { wood: 100, food: 60, knowledge: 5 }, group: 'Innovation', unlocks: 'Woodcutter\'s Shed' },
  fellingaxes: { name: 'Felling Axes', desc: '+20% wood production per level', detail: 'Each level makes wood gathering 20% faster.', cost: { wood: 140, stone: 80, knowledge: 10 }, group: 'Innovation', requires: 'axes' },
  woodcutting1: { name: 'Woodcutting I', desc: '+12% wood production per level', detail: 'Woodcutters work 12% faster per level.', cost: { wood: 120, food: 80, knowledge: 6 }, group: 'Innovation', requires: 'woodcuttershed' },
  croprotation: { name: 'Crop Rotation', desc: '+8% food production per level, unlocks Granary Hall', detail: 'Stabilizes food cycles and unlocks Granary Hall.', cost: { food: 180, wood: 140, knowledge: 16 }, group: 'Innovation', requires: 'agriculture', requiresZone: 5, unlocks: 'Granary Hall' },
  lumbergrading: { name: 'Lumber Grading', desc: '+8% wood production per level, unlocks Timber Yard', detail: 'Improves timber sorting and unlocks Timber Yard.', cost: { wood: 190, food: 120, knowledge: 16 }, group: 'Innovation', requires: 'woodcutting1', requiresZone: 5, unlocks: 'Timber Yard' },
  stonesurveying: { name: 'Stone Surveying', desc: '+8% stone production per level, unlocks Mason\'s Yard', detail: 'Maps quarry veins and unlocks Mason\'s Yard.', cost: { wood: 220, stone: 180, knowledge: 20 }, group: 'Innovation', requires: 'stoneworking', requiresZone: 6, unlocks: 'Mason\'s Yard' },
  bloomerymethods: { name: 'Bloomery Methods', desc: '+8% metal production per level, unlocks Smeltery', detail: 'Improves bloomery output and unlocks Smeltery.', cost: { wood: 260, stone: 220, metal: 90, knowledge: 24 }, group: 'Innovation', requires: ['mining', 'stonesurveying'], requiresZone: 8, unlocks: 'Smeltery' },
  packdiscipline: { name: 'Pack Discipline', desc: 'Logistics pressure impact reduced by 25%', detail: 'Supply chains hold steady under strain.', cost: { food: 220, wood: 220, stone: 160, knowledge: 22 }, group: 'Innovation', requires: ['croprotation', 'lumbergrading'], requiresZone: 7 },
  skaldcodex: { name: 'Skald Codex', desc: '+15% knowledge production', detail: 'Formalizes records and teaching methods.', cost: { wood: 200, stone: 160, knowledge: 28 }, group: 'Innovation', requires: 'skaldtraining', requiresZone: 8 },
  sheepfarming: { name: 'Sheep Farming', desc: 'Unlocks wool gear and agriculture', detail: 'Enables wool armor and agriculture upgrades.', cost: { food: 140, wood: 120, knowledge: 8 }, group: 'Innovation', requires: ['smokehouse', 'woodcutting1'], unlocks: 'Wool Armor, Agriculture, Stone Keep' },
  agriculture: { name: 'Agriculture', desc: '+15% food production per level', detail: 'Each level makes food gathering 15% faster.', cost: { food: 140, wood: 90, knowledge: 10 }, group: 'Innovation', requires: 'sheepfarming' },
  scholars: { name: 'Skald Scholars', desc: '+10% knowledge production per level', detail: 'Each level makes knowledge gathering 10% faster.', cost: { food: 60, wood: 60, knowledge: 5 }, group: 'Innovation' },
  growthrites: { name: 'Growth Rites', desc: '+20% clansfolk growth per level', detail: 'Each level fills the growth bar 20% faster.', cost: { food: 120, wood: 90, knowledge: 8 }, group: 'Innovation' },
  workrhythm: { name: 'Work Rhythm', desc: '+10% worker efficiency per level', detail: 'Each level makes all worker production 10% faster.', cost: { food: 100, wood: 100, knowledge: 8 }, group: 'Innovation' },
  stoneworking: { name: 'Stoneworking', desc: 'Unlock Stone', detail: 'Enables stone gathering and storage.', cost: { food: 120, wood: 80 }, group: 'Innovation', requires: 'woodcutting1' },
  mining: { name: 'Mining', desc: 'Unlock Metal', detail: 'Enables metal gathering and storage.', cost: { wood: 100, stone: 80 }, group: 'Innovation', requires: 'stoneworking' },
  ashgathering: { name: 'Ash Gathering', desc: 'Unlock Ash', detail: 'Enables ash collection from later zones.', cost: { wood: 120, stone: 120 }, group: 'Innovation', requires: 'mining' },
  lorekeeping: { name: 'Old World Knowledge', desc: 'Unlock Knowledge', detail: 'Enables knowledge storage and tracking.', cost: { food: 100, wood: 80 }, group: 'Innovation' },
  skaldtraining: { name: 'Skald Training', desc: 'Unlock Lorekeepers', detail: 'Allows clansfolk to work as lorekeepers.', cost: { food: 120, wood: 100, knowledge: 20 }, group: 'Innovation', requires: 'lorekeeping' },
  blacksmithing: { name: 'Blacksmithing', desc: 'Unlock Blacksmith', detail: 'Allows crafting weapons and armor.', cost: { wood: 120, stone: 80, knowledge: 15 }, group: 'Innovation', requires: 'stoneworking' },
  armory1: { name: 'Armory Craft I', desc: 'Unlock Reinforced Gear', detail: 'Unlocks reinforced swords, shields, and armor in the blacksmith.', cost: { wood: 160, stone: 100, knowledge: 20 }, group: 'Innovation', requires: 'stoneworking', requiresZone: 6 },
  armory2: { name: 'Armory Craft II', desc: 'Unlock Iron Gear', detail: 'Unlocks iron swords, shields, and armor in the blacksmith.', cost: { wood: 200, metal: 150, knowledge: 32 }, group: 'Innovation', requires: 'armory1', requiresZone: 12 },
  quarrylogistics: { name: 'Quarry Logistics', desc: 'Unlock Quarry Camp', detail: 'Unlocks Quarry Camp for scalable stone output and storage.', cost: { wood: 420, stone: 360, knowledge: 70 }, group: 'Innovation', requires: 'stoneworking', requiresZone: 5, unlocks: 'Quarry Camp' },
  forgeprotocols: { name: 'Forge Protocols', desc: 'Unlock Foundry', detail: 'Unlocks Foundry for scalable metal output and storage.', cost: { wood: 700, stone: 620, metal: 280, knowledge: 120 }, group: 'Innovation', requires: ['mining', 'quarrylogistics'], requiresZone: 9, unlocks: 'Foundry' },
  ashdoctrine: { name: 'Ash Doctrine', desc: 'Unlock Ash Altar', detail: 'Unlocks Ash Altar for scalable ash gain and storage.', cost: { wood: 980, stone: 860, ash: 420, knowledge: 180 }, group: 'Innovation', requires: ['ashgathering', 'forgeprotocols'], requiresZone: 13, unlocks: 'Ash Altar' },
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
