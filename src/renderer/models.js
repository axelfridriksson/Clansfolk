export const SAVE_KEY = 'trimpsclone.save.v1';

export const START_STATE = {
  time: 0,
  resources: { food: 0, wood: 0, stone: 0, metal: 0, ash: 0, knowledge: 0 },
  clansfolk: { total: 3, idle: 3, army: 0, maxArmy: 5, growthProgress: 0, armyHP: 0, armyHPMax: 0 },
  jobs: { forager: 0, woodcutter: 0, quarry: 0, smelter: 0, lorekeeper: 0, ashwalker: 0, drillmaster: 0 },
  buildings: { grasshut: 0, timberhall: 0, longhouse: 0, stonekeep: 0, storehouse: 0, smokehouse: 0 },
  upgrades: {
    woodsword: 0,
    steelsword: 0,
    woodshield: 0,
    ironshield: 0,
    woolarmor: 0,
    nets: 0,
    steelhooks: 0,
    axes: 0,
    fellingaxes: 0,
    scholars: 0,
    growthrites: 0,
    stoneworking: 0,
    mining: 0,
    ashgathering: 0,
    lorekeeping: 0,
    longboats: 0,
    icesleds: 0,
    workrhythm: 0
  },
  world: { zone: 1, enemyHP: 20, enemyHPMax: 20, enemyAtk: 1, fighting: false, enemiesPerZone: 5, enemyIndex: 1 },
  perks: { remnants: 0, prodMult: 1, atkMult: 1 },
  unlocks: {
    buildingsTier1: false,
    buildingsTier2: false,
    buildingsTier3: false,
    weapons: false,
    upgradesTier1: false,
    upgradesTier2: false,
    travel: false,
    steelSwords: false,
    ironShields: false,
    stone: false,
    metal: false,
    ash: false,
    knowledge: false
  },
  stats: { totalKills: 0 },
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
  log: ['The long voyage ends. Three clansfolk step onto a cold shore.'],
  ui: { tab: 'base', leaderTask: null }
};
