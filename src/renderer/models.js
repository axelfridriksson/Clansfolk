export const SAVE_KEY = 'trimpsclone.save.v1';

export const START_STATE = {
  time: 0,
  resources: { food: 0, wood: 0, stone: 0, metal: 0, ash: 0, knowledge: 0 },
  clansfolk: { total: 3, idle: 3, army: 0, maxArmy: 5, growthProgress: 0, starvationProgress: 0, armyHP: 0, armyHPMax: 0 },
  jobs: { forager: 0, woodcutter: 0, quarry: 0, smelter: 0, lorekeeper: 0, ashwalker: 0, drillmaster: 0 },
  buildings: { grasshut: 0, timberhall: 0, longhouse: 0, stonekeep: 0, storehouse: 0, smokehouse: 0, woodcuttershed: 0, warcamp: 0, skaldhall: 0 },
  upgrades: {
    nets: 0,
    steelhooks: 0,
    axes: 0,
    fellingaxes: 0,
    woodcutting1: 0,
    sheepfarming: 0,
    agriculture: 0,
    scholars: 0,
    growthrites: 0,
    stoneworking: 0,
    mining: 0,
    ashgathering: 0,
    lorekeeping: 0,
    skaldtraining: 0,
    blacksmithing: 0,
    armory1: 0,
    armory2: 0,
    longboats: 0,
    icesleds: 0,
    workrhythm: 0
  },
  world: { zone: 1, enemyHP: 20, enemyHPMax: 20, enemyAtk: 1, fighting: false, enemiesPerZone: 5, enemyIndex: 1, lastEnemyHit: 0, lastWarbandHit: 0 },
  perks: { remnants: 0, prodMult: 1, atkMult: 1 },
  runes: { ember: 0, frost: 0 },
  religion: {
    patron: null,
    buildings: { ashshrine: 0, embercairn: 0, hymnhall: 0 },
    ritual: {
      active: false,
      patron: null,
      timeLeft: 0,
      duration: 0,
      required: 0,
      hits: 0,
      misses: 0,
      period: 4,
      bandCenter: 0.5,
      bandWidth: 0.14,
      startTime: 0,
      lastResult: ''
    },
    blessing: {
      patron: null,
      expiresAt: 0
    }
  },
  unlocks: {
    buildingsTier1: false,
    buildingsTier2: false,
    buildingsTier3: false,
    weapons: false,
    upgradesTier1: false,
    upgradesTier2: false,
    travel: false,
    stone: false,
    metal: false,
    ash: false,
    knowledge: false,
    lorekeepers: false,
    blacksmith: false,
    weaponTier2: false,
    weaponTier3: false
  },
  stats: { totalKills: 0 },
  inventory: {
    woodsword: 0,
    woodshield: 0,
    woolarmor: 0,
    reinforcedsword: 0,
    reinforcedshield: 0,
    paddedarmor: 0,
    ironsword: 0,
    ironshield: 0,
    chainarmor: 0
  },
  equipment: {
    woodsword: 0,
    woodshield: 0,
    woolarmor: 0,
    reinforcedsword: 0,
    reinforcedshield: 0,
    paddedarmor: 0,
    ironsword: 0,
    ironshield: 0,
    chainarmor: 0
  },
  tutorial: {
    enabled: true,
    steps: {
      food: false,
      wood: false,
      hut: false,
      warband: false,
      zone: false
    }
  },
  dev: {
    showAll: false
  },
  log: ['The long voyage ends. Three clansfolk step onto a cold shore.'],
  ui: { tab: 'overview', leaderTask: null, warbandSend: 1, craftStep: 1, combatStance: 'balanced', selectedPatron: null }
};
