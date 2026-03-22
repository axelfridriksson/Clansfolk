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
    effects: { foodMult: 0.1, woodMult: 0.1, growthMult: 0.1 },
    tier: 'common'
  },
  {
    id: 'storm',
    name: 'Stormbound',
    desc: 'Ritual reward: +12% warband ATK, +8% warband HP',
    detail: 'The storm hardens the warband for battle.',
    cost: { ash: 50 },
    effects: { atkMult: 0.12, hpMult: 0.08 },
    tier: 'uncommon'
  },
  {
    id: 'veil',
    name: 'Veil of Ash',
    desc: 'Ritual reward: +20% knowledge, +20% ash gain',
    detail: 'The ash remembers. Knowledge and embers linger.',
    cost: { ash: 45 },
    effects: { knowledgeMult: 0.2, ashGainMult: 0.2 },
    tier: 'uncommon'
  },
  // Shop patron ideas or future ritual spin shop gods:
  {
    id: 'wild',
    name: 'Wildspeaker',
    desc: 'Ritual reward: +15% food, +15% wood, +10% growth',
    detail: 'The wilds nurture growth and resourcefulness.',
    cost: { ash: 45 },
    effects: { foodMult: 0.15, woodMult: 0.15, growthMult: 0.1 },
    tier: 'uncommon'
  },
  {
    id: 'forge',
    name: 'Forgefather',
    desc: 'Ritual reward: +15% warband ATK, +10% warband HP',
    detail: 'The forge tempers the warband for battle.',
    cost: { ash: 55 },
    effects: { atkMult: 0.15, hpMult: 0.1 },
    tier: 'rare'
  },
  {    
    id: 'shaper',
    name: 'Shaper of Ash',
    desc: 'Ritual reward: +25% knowledge, +25% ash gain',
    detail: 'The shaper molds ash and memory to their will.',
    cost: { ash: 60 },
    effects: { knowledgeMult: 0.25, ashGainMult: 0.25 },
    tier: 'epic'
  },
  {
    id: 'shadow',
    name: 'Shadow of the Lost',
    desc: 'Ritual reward: +10% food, +10% wood, +10% growth, +10% warband ATK, +10% warband HP, +10% knowledge, +10% ash gain',
    detail: 'The shadow offers balanced blessings across all domains.',
    cost: { ash: 70 },
    effects: { foodMult: 0.1, woodMult: 0.1, growthMult: 0.1, atkMult: 0.1, hpMult: 0.1, knowledgeMult: 0.1, ashGainMult: 0.1 },
    tier: 'legendary'
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
  },
  lorecairn: {
    name: 'Lore Cairn',
    desc: '+50 knowledge storage per level',
    detail: 'Preserves more of the old world’s wisdom.',
    cost: { ash: 55, wood: 90, stone: 60 },
    scale: 1.2
  }
};

export const BUILDINGS = {
  //early buildings:
  grasshut: { name: 'Grass Huts', desc: '+4 Clansfolk cap', role: 'Housing: expands early settlement capacity.', detail: 'Adds room for 4 more clansfolk.', cost: { wood: 90, food: 45 }, group: 'Buildings', unlocks: 'Timber Halls', icon: grassHutIcon, scale: 1.03 },
  timberhall: { name: 'Timber Halls', desc: '+6 Clansfolk cap', role: 'Housing: supports village-scale growth.', detail: 'Adds room for 6 more clansfolk.', cost: { wood: 180, food: 90 }, group: 'Buildings', unlocks: 'Longhouse', icon: timberHallsIcon },
  longhouse: { name: 'Longhouse', desc: '+8 Clansfolk cap', role: 'Housing: unlocks war and storage branches.', detail: 'Adds room for 8 more clansfolk.', cost: { wood: 280, food: 140 }, group: 'Buildings', unlocks: 'Warcamp, Storehouse' },
  stonekeep: { name: 'Stone Keep', desc: '+10 Clansfolk cap', role: 'Housing tier jump: anchors late settlement.', detail: 'Adds room for 10 more clansfolk.', cost: { wood: 420, stone: 240 }, group: 'Buildings', requires: ['longhouse', 'sheepfarming'], icon: stonekeepIcon },
  storehouse: { name: 'Storehouse', desc: '+50% resource cap per level', role: 'Storage core: multiplies key resource storage.', detail: 'Increases food/wood/stone/metal caps by 50% per level.', cost: { wood: 240, stone: 160 }, group: 'Buildings', requires: 'longhouse', icon: storehouseIcon },
  smokehouse: { name: 'Smokehouse', desc: '+200 food cap', role: 'Storage: prevents food waste spikes.', detail: 'Raises food storage by 200.', cost: { wood: 120, food: 80 }, group: 'Buildings', requires: 'nets', icon: smokehouseIcon, scale: 1.12 },
  woodcuttershed: { name: 'Woodcutter\'s Shed', desc: '+200 wood storage', role: 'Storage: stabilizes wood reserves.', detail: 'Raises wood storage by 200.', cost: { wood: 140, food: 60 }, group: 'Buildings', requires: 'axes', icon: woodcuttersShedIcon, scale: 1.12 },
  warcamp: { name: 'Warcamp', desc: '+1 warband slot first, then +2 per level', role: 'Military: raises warband deployment capacity.', detail: 'Expands the warband cap.', cost: { wood: 200, food: 120 }, group: 'Buildings', requires: 'longhouse', icon: warcampIcon },
  //midgame buildings:
  granaryhall: { name: 'Winter Larder', desc: 'Reduces overcrowding food drain per level', role: 'Pressure control: buffers famine under crowding.', detail: 'Each level softens food penalties from overcrowding.', cost: { wood: 260, stone: 160, knowledge: 22 }, group: 'Buildings', requires: ['croprotation', 'longhouse'], scale: 1.14 },
  timberyard: { name: 'Timber Yard', desc: 'Reduces wood costs on builds/upgrades per level', role: 'Economy: lowers wood spend across development.', detail: 'Each level lowers wood costs for buildings and innovations.', cost: { wood: 300, stone: 140, knowledge: 22 }, group: 'Buildings', requires: ['lumbergrading', 'longhouse'], scale: 1.14 },
  masonryard: { name: 'Mason\'s Yard', desc: '+150 stone storage per level', role: 'Storage: expands stone reserves for midgame.', detail: 'Expands stone reserves.', cost: { wood: 280, stone: 220, knowledge: 26 }, group: 'Buildings', requires: ['stonesurveying', 'longhouse'], scale: 1.15 },
  smeltery: { name: 'Smeltery', desc: '+150 metal storage per level', role: 'Storage: expands metal reserves for gear tiers.', detail: 'Expands metal reserves.', cost: { wood: 320, stone: 260, metal: 120, knowledge: 30 }, group: 'Buildings', requires: ['bloomerymethods', 'longhouse'], scale: 1.16 },
  skaldhall: { name: 'Skald Hall', desc: '+200 knowledge storage per level', role: 'Knowledge: supports deeper innovation spend.', detail: 'Increases knowledge storage by 200 per level.', cost: { wood: 200, stone: 140, knowledge: 25 }, group: 'Buildings', requires: 'lorekeeping', icon: skaldHallIcon },
  ashaltar: { name: 'Ash Altar', desc: '+15% ash gain and +60 ash storage per level', role: 'Rites economy: converts combat into ash momentum.', detail: 'Deepens ash rites and improves ash spoils from battle.', cost: { wood: 220, stone: 200, ash: 80, knowledge: 30 }, group: 'Buildings', requires: ['ashdoctrine', 'stonekeep'], scale: 1.16 },
  sewer: { name: 'Sewer', desc: 'Reduces overcrowding unrest per level', role: 'Pressure control: mitigates unrest from overcrowding.', detail: 'Each level reduces unrest caused by overcrowding.', cost: { wood: 240, stone: 180, knowledge: 24 }, group: 'Buildings', requires: ['granaryhall', 'longhouse'], scale: 1.14 },
  commander: { name: 'Commander\'s Post', desc: '+1 warband slot per level', role: 'Military: further expands warband capacity.', detail: 'Each level adds 1 more warband slot.', cost: { wood: 300, stone: 240, knowledge: 30 }, group: 'Buildings', requires: ['warcamp', 'stonekeep'] },

  
  // Future building ideas:
  // - "Ritual Circle": +10% patron effect per level, unlocks with Ash Altar for deeper rites synergy.
  // - "Clansfolk Quarters": +5 clansfolk cap per level, unlocks with Stone Keep for late-game population growth.
  // - "Armory": unlocks blacksmith crafting and gear upgrades, requires Stone Keep for military expansion.

};

export const UPGRADES = {
  //early innovations:
  nets: { name: 'Fishing Nets', desc: '+10% food production per level', detail: 'Each level makes food gathering 10% faster.', cost: { food: 100, wood: 80, knowledge: 5 }, group: 'Innovation', unlocks: 'Smokehouse' },
  steelhooks: { name: 'Steel Hooks', desc: '+20% food production per level', detail: 'Each level makes food gathering 20% faster.', cost: { metal: 80, wood: 80, knowledge: 10 }, group: 'Innovation', requires: 'nets' },
  axes: { name: 'Sharpened Axes', desc: '+10% wood production per level', detail: 'Each level makes wood gathering 10% faster.', cost: { wood: 100, food: 60, knowledge: 5 }, group: 'Innovation', unlocks: 'Woodcutter\'s Shed' },
  fellingaxes: { name: 'Felling Axes', desc: '+20% wood production per level', detail: 'Each level makes wood gathering 20% faster.', cost: { wood: 140, stone: 80, knowledge: 10 }, group: 'Innovation', requires: 'axes' },
  woodcutting1: { name: 'Woodcutting I', desc: '+12% wood production per level', detail: 'Woodcutters work 12% faster per level.', cost: { wood: 120, food: 80, knowledge: 6 }, group: 'Innovation', requires: 'woodcuttershed' },
  croprotation: { name: 'Crop Rotation', desc: '+8% food production per level, unlocks Winter Larder', detail: 'Stabilizes food cycles and unlocks Winter Larder.', cost: { food: 180, wood: 140, knowledge: 16 }, group: 'Innovation', requires: 'agriculture', requiresZone: 5, unlocks: 'Winter Larder' },
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
  warlogistics1: { name: 'War Logistics I', desc: 'Raise warcamp cap to 10', detail: 'Expands campaign supply lines. Maximum warcamps: 10.', cost: { wood: 260, stone: 180, knowledge: 24 }, group: 'Innovation', requires: 'warcamp', requiresZone: 6, unlocks: 'Warcamp cap 10' },
  warlogistics2: { name: 'War Logistics II', desc: 'Raise warcamp cap to 15', detail: 'Standardizes command routes. Maximum warcamps: 15.', cost: { wood: 420, stone: 320, metal: 140, knowledge: 42 }, group: 'Innovation', requires: 'warlogistics1', requiresZone: 10, unlocks: 'Warcamp cap 15' },
  armory1: { name: 'Armory Craft I', desc: 'Unlock Reinforced Gear', detail: 'Unlocks reinforced swords, shields, and armor in the blacksmith.', cost: { wood: 160, stone: 100, knowledge: 20 }, group: 'Innovation', requires: 'stoneworking', requiresZone: 6 },
  armory2: { name: 'Armory Craft II', desc: 'Unlock Iron Gear', detail: 'Unlocks iron swords, shields, and armor in the blacksmith.', cost: { wood: 200, metal: 150, knowledge: 32 }, group: 'Innovation', requires: 'armory1', requiresZone: 12 },
  ashdoctrine: { name: 'Ash Doctrine', desc: 'Unlock Ash Altar', detail: 'Unlocks Ash Altar for scalable ash gain and storage.', cost: { wood: 980, stone: 860, ash: 420, knowledge: 180 }, group: 'Innovation', requires: ['ashgathering', 'bloomerymethods'], requiresZone: 13, unlocks: 'Ash Altar' },
  //midgame innovations:
  armory3: { name: 'Armory Craft III', desc: 'Unlock Steel Gear', detail: 'Unlocks steel swords, shields, and armor in the blacksmith.', cost: { wood: 300, metal: 250, knowledge: 50 }, group: 'Innovation', requires: 'armory2', requiresZone: 18 },
  armory4: { name: 'Armory Craft IV', desc: 'Unlock Mythril Gear', detail: 'Unlocks mythril swords, shields, and armor in the blacksmith.', cost: { wood: 400, metal: 350, knowledge: 80 }, group: 'Innovation', requires: 'armory3', requiresZone: 25 },
  axes2: { name: 'Battle Axes', desc: '+30% wood production per level', detail: 'Each level makes wood gathering 30% faster.', cost: { wood: 400, stone: 200, knowledge: 40 }, group: 'Innovation', requires: 'fellingaxes', requiresZone: 20 },
  pickaxes: { name: 'Pickaxes', desc: '+30% stone production per level', detail: 'Each level makes stone gathering 30% faster.', cost: { wood: 350, stone: 300, knowledge: 40 }, group: 'Innovation', requires: 'stonesurveying', requiresZone: 20 },
  drills: { name: 'Drills', desc: '+30% metal production per level', detail: 'Each level makes metal gathering 30% faster.', cost: { wood: 300, stone: 350, metal: 200, knowledge: 50 }, group: 'Innovation', requires: 'bloomerymethods', requiresZone: 22 },
  siege: { name: 'Siegecraft', desc: 'Unlock siege weapons', detail: 'Unlocks catapults and ballistae in the blacksmith.', cost: { wood: 500, stone: 400, metal: 300, knowledge: 100 }, group: 'Innovation', requires: ['armory3', 'warlogistics2'], requiresZone: 30 },
  
  //late game innovations:
  armory5: { name: 'Armory Craft V', desc: 'Unlock Adamant Gear', detail: 'Unlocks adamant swords, shields, and armor in the blacksmith.', cost: { wood: 500, metal: 450, knowledge: 120 }, group: 'Innovation', requires: 'armory4', requiresZone: 35 },
  armory6: { name: 'Armory Craft VI', desc: 'Unlock Obsidian Gear', detail: 'Unlocks obsidian swords, shields, and armor in the blacksmith.', cost: { wood: 600, metal: 550, knowledge: 200 }, group: 'Innovation', requires: 'armory5', requiresZone: 50 },

  // Future innovation ideas:
  armory7: { name: 'Armory Craft VII', desc: 'Unlock Legendary Gear', detail: 'Unlocks legendary swords, shields, and armor in the blacksmith.', cost: { wood: 800, metal: 750, knowledge: 300 }, group: 'Innovation', requires: 'armory6', requiresZone: 75 },
  armory8: { name: 'Armory Craft VIII', desc: 'Unlock Ascendant Gear', detail: 'Unlocks ascendant swords, shields, and armor in the blacksmith.', cost: { wood: 1000, metal: 900, knowledge: 500 }, group: 'Innovation', requires: 'armory7', requiresZone: 100 },
  armory9: { name: 'Armory Craft IX', desc: 'Unlock Mythic Gear', detail: 'Unlocks mythic swords, shields, and armor in the blacksmith.', cost: { wood: 1200, metal: 1100, knowledge: 800 }, group: 'Innovation', requires: 'armory8', requiresZone: 150 },
  armory10: { name: 'Armory Craft X', desc: 'Unlock Eternal Gear', detail: 'Unlocks eternal swords, shields, and armor in the blacksmith.', cost: { wood: 1500, metal: 1400, knowledge: 1200 }, group: 'Innovation', requires: 'armory9', requiresZone: 200 },

  //travel innovations:
  longboats: { name: 'Longboats', desc: 'Travel time −20%', detail: 'Warband travel and scouting is 20% faster.', cost: { wood: 120, food: 80, knowledge: 8 }, group: 'Travel', unlocks: 'Ice Sleds' },
  icesleds: { name: 'Ice Sleds', desc: 'Travel time −35%', detail: 'Warband travel and scouting is 35% faster.', cost: { wood: 160, stone: 80, knowledge: 12 }, group: 'Travel', requires: 'longboats' }
};

export const BLACKSMITH_ITEMS = {
  // early game gear:
  woodsword: { name: 'Wood Sword', role: 'melee', tierGroup: 'wood', cost: { wood: 40 }, slot: 'weapon', atk: 2, unlock: null },
  woodshield: { name: 'Wood Shield', role: 'melee', tierGroup: 'wood', cost: { wood: 40 }, slot: 'shield', hp: 2, unlock: null },
  woolarmor: { name: 'Wool Armor', role: 'melee', tierGroup: 'wood', cost: { food: 50 }, slot: 'armor', hp: 4, unlock: null },
  shortbow: { name: 'Shortbow', role: 'bowmen', tierGroup: 'wood', cost: { wood: 55, food: 20 }, slot: 'ranged', atk: 2, unlock: 'weaponTier2' },
  hoodedcoat: { name: 'Hooded Coat', role: 'bowmen', tierGroup: 'wood', cost: { food: 60, wood: 30 }, slot: 'light', hp: 3, unlock: 'weaponTier2' },
  reinforcedsword: { name: 'Reinforced Sword', role: 'melee', tierGroup: 'reinforced', cost: { wood: 90, stone: 40, knowledge: 8 }, slot: 'weapon', atk: 4, unlock: 'weaponTier2' },
  reinforcedshield: { name: 'Reinforced Shield', role: 'melee', tierGroup: 'reinforced', cost: { wood: 80, stone: 50, knowledge: 8 }, slot: 'shield', hp: 5, unlock: 'weaponTier2' },
  paddedarmor: { name: 'Padded Armor', role: 'melee', tierGroup: 'reinforced', cost: { food: 100, wood: 70, knowledge: 10 }, slot: 'armor', hp: 8, unlock: 'weaponTier2' },
  huntingbow: { name: 'Hunting Bow', role: 'bowmen', tierGroup: 'reinforced', cost: { wood: 110, stone: 30, knowledge: 8 }, slot: 'ranged', atk: 4, unlock: 'weaponTier2' },
  leatherjerkin: { name: 'Leather Jerkin', role: 'bowmen', tierGroup: 'reinforced', cost: { food: 100, wood: 50, knowledge: 10 }, slot: 'light', hp: 6, unlock: 'weaponTier2' },
  ironsword: { name: 'Iron Sword', role: 'melee', tierGroup: 'iron', cost: { metal: 100, wood: 60, knowledge: 15 }, slot: 'weapon', atk: 7, unlock: 'weaponTier3' },
  ironshield: { name: 'Iron Shield', role: 'melee', tierGroup: 'iron', cost: { metal: 110, wood: 50, knowledge: 15 }, slot: 'shield', hp: 9, unlock: 'weaponTier3' },
  // mid game armor:
  chainarmor: { name: 'Chain Armor', role: 'melee', tierGroup: 'iron', cost: { metal: 120, food: 80, knowledge: 18 }, slot: 'armor', hp: 14, unlock: 'weaponTier3' },
  hornbow: { name: 'Horn Bow', role: 'bowmen', tierGroup: 'iron', cost: { metal: 90, wood: 90, knowledge: 16 }, slot: 'ranged', atk: 7, unlock: 'weaponTier3' },
  rangercoat: { name: 'Ranger Coat', role: 'bowmen', tierGroup: 'iron', cost: { metal: 80, food: 90, knowledge: 18 }, slot: 'light', hp: 10, unlock: 'weaponTier3' },
  steelsword: { name: 'Steel Sword', role: 'melee', tierGroup: 'steel', cost: { metal: 200, wood: 100, knowledge: 30 }, slot: 'weapon', atk: 12, unlock: 'weaponTier4' },
  steelshield: { name: 'Steel Shield', role: 'melee', tierGroup: 'steel', cost: { metal: 220, wood: 80, knowledge: 30 }, slot: 'shield', hp: 15, unlock: 'weaponTier4' },
  platedarmor: { name: 'Plated Armor', role: 'melee', tierGroup: 'steel', cost: { metal: 250, food: 150, knowledge: 40 }, slot: 'armor', hp: 22, unlock: 'weaponTier4' },
  mythrilsword: { name: 'Mythril Sword', role: 'melee', tierGroup: 'mythril', cost: { metal: 400, wood: 150, knowledge: 50 }, slot: 'weapon', atk: 20, unlock: 'weaponTier5' },
  mythrilshield: { name: 'Mythril Shield', role: 'melee', tierGroup: 'mythril', cost: { metal: 450, wood: 120, knowledge: 50 }, slot: 'shield', hp: 25, unlock: 'weaponTier5' },
  mythrilarmor: { name: 'Mythril Armor', role: 'melee', tierGroup: 'mythril', cost: { metal: 500, food: 200, knowledge: 70 }, slot: 'armor', hp: 35, unlock: 'weaponTier5' },

  // Future gear ideas:
  // - "Adamant Sword/Shield/Armor": high-tier gear unlocked by Armory Craft V, with strong stats and high costs.
  // - "Obsidian Sword/Shield/Armor": top-tier gear unlocked by Armory Craft VI, with the best stats and highest costs.
  // - "Legendary Sword/Shield/Armor": endgame gear unlocked by Armory Craft VII, with unique bonuses and very high costs.
  // - "Ascendant Sword/Shield/Armor": ultimate gear unlocked by Armory Craft VIII, with powerful stats and game-changing effects.
  // - "Mythic Sword/Shield/Armor": mythical gear unlocked by Armory Craft IX, with unparalleled stats and legendary status.
  // - "Eternal Sword/Shield/Armor": eternal gear unlocked by Armory Craft X, with infinite upgrade potential and ultimate power.
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
