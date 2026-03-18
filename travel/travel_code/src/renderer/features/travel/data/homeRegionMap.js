// 39 x 26 regional travel prototype.
//
// Terrain:
// ~ = deep water
// w = shallow water
// . = meadow
// M = mountain
// T = trees
//
// Hubs:
// H = home settlement
// P = home spawn
// K = coast clan harbor
// L = holdfolk timber village
// X = ashbound rite hold
// D = dwarven hill keep
// O = orc frontier fort
//
// POIs:
// R = broken watchtower
// A = animal den
// C = bandit camp
// F = fish camp
// G = grave circle

const RAW_LAYOUT = [
  '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
  '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
  '~~~~~~~~~~~~~~~~wwwwww~~~~~~~~~~~~~~~~~',
  '~~~~~~~~~~~~~wwww....wwww~~~~~~~~~~~~~~',
  '~~~~~~~~~~wwww..........wwww~~~~~~~~~~~',
  '~~~~~~~~ww..................www~~~~~~~~',
  '~~~~~~~w.............D........ww~~~~~~~',
  '~~~~~~w.............MMM.........w~~~~~~',
  '~~~~~w...L.........MMMMM.........w~~~~~',
  '~~~~w.....R.........MMM...........w~~~~',
  '~~~~w...TTTT..................X....w~~~',
  '~~~w....TTTT..................G.....w~~',
  '~~~w....................R............w~',
  '~~~w.................................w~',
  '~~~w...........MMM...................w~',
  '~~~w..........MMMMM.............O....w~',
  '~~~w...........MMM..............C....w~',
  '~~~~w...............................w~~',
  '~~~~~w.......A.....................w~~~',
  '~~~~~~w..............T............w~~~~',
  '~~~~~~~ww.....................KFww~~~~~',
  '~~~~~~~~~www...................w~~~~~~~',
  '~~~~~~~~~~~ww....HPH......wwwww~~~~~~~~',
  '~~~~~~~~~~~~~wwwwwwwwwwwwww~~~~~~~~~~~~',
  '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
  '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~'
];

const TILE_BY_SYMBOL = {
  '.': { terrain: 'meadow', blocked: false, zone: 'wilds' },
  '~': { terrain: 'deep-water', blocked: true, zone: 'water' },
  w: { terrain: 'shore-water', blocked: true, zone: 'water' },
  M: { terrain: 'mountain', blocked: true, zone: 'wilds' },
  T: { terrain: 'trees', blocked: true, zone: 'wilds' },
  H: { terrain: 'settlement', blocked: false, zone: 'home' },
  P: { terrain: 'settlement', blocked: false, zone: 'home' },
  K: { terrain: 'settlement', blocked: false, zone: 'coast' },
  L: { terrain: 'settlement', blocked: false, zone: 'timber' },
  X: { terrain: 'settlement', blocked: false, zone: 'ash' },
  D: { terrain: 'settlement', blocked: false, zone: 'stone' },
  O: { terrain: 'settlement', blocked: false, zone: 'war' },
  R: { terrain: 'meadow', blocked: false, zone: 'wilds' },
  A: { terrain: 'meadow', blocked: false, zone: 'wilds' },
  C: { terrain: 'meadow', blocked: false, zone: 'wilds' },
  F: { terrain: 'meadow', blocked: false, zone: 'coast' },
  G: { terrain: 'meadow', blocked: false, zone: 'ash' }
};

const HUB_DEFS = {
  H: {
    id: 'home-settlement',
    name: 'Home Settlement',
    tone: 'home',
    people: 'Player Clansfolk',
    detail: 'Home anchor and safe return point.'
  },
  K: {
    id: 'coast-clan-harbor',
    name: 'Coast Clan Harbor',
    tone: 'coast',
    people: 'Coast Clans',
    detail: 'Trade harbor with uncertain loyalties.'
  },
  L: {
    id: 'timber-village',
    name: 'Timber Village',
    tone: 'timber',
    people: 'Holdfolk',
    detail: 'Woodcutters, hunters, and inland stores.'
  },
  X: {
    id: 'ashbound-rite-hold',
    name: 'Ashbound Rite Hold',
    tone: 'ash',
    people: 'Ashbound',
    detail: 'Dark rites and severe border politics.'
  },
  D: {
    id: 'dwarven-hill-keep',
    name: 'Dwarven Hill Keep',
    tone: 'dwarf',
    people: 'Dwarves',
    detail: 'Stone keep controlling the northern routes.'
  },
  O: {
    id: 'orc-frontier-fort',
    name: 'Orc Frontier Fort',
    tone: 'orc',
    people: 'Orcs',
    detail: 'Frontier war hub pressing the interior roads.'
  }
};

const POI_DEFS = {
  R: {
    type: 'poi',
    idPrefix: 'watchtower',
    name: 'Broken Watchtower',
    tone: 'watchtower',
    detail: 'A ruined lookout with a clear line over the roads.'
  },
  A: {
    type: 'poi',
    idPrefix: 'animal-den',
    name: 'Animal Den',
    tone: 'animal',
    detail: 'Fresh tracks and an active den.'
  },
  C: {
    type: 'poi',
    idPrefix: 'bandit-camp',
    name: 'Bandit Camp',
    tone: 'bandit',
    detail: 'Raiders camped near a travel route.'
  },
  F: {
    type: 'poi',
    idPrefix: 'fish-camp',
    name: 'Fish Camp',
    tone: 'coast',
    detail: 'A rough shore camp used by the harbor folk.'
  },
  G: {
    type: 'poi',
    idPrefix: 'grave-circle',
    name: 'Grave Circle',
    tone: 'ash',
    detail: 'Ashbound dead and old offerings in the grass.'
  }
};

const ROAD_SEGMENTS = [
  [{ x: 18, y: 22 }, { x: 17, y: 20 }, { x: 16, y: 18 }, { x: 13, y: 14 }, { x: 9, y: 9 }],
  [{ x: 18, y: 22 }, { x: 21, y: 20 }, { x: 25, y: 20 }, { x: 29, y: 20 }],
  [{ x: 9, y: 9 }, { x: 13, y: 8 }, { x: 17, y: 7 }, { x: 21, y: 6 }],
  [{ x: 21, y: 6 }, { x: 24, y: 8 }, { x: 28, y: 10 }],
  [{ x: 28, y: 10 }, { x: 30, y: 13 }, { x: 33, y: 15 }],
  [{ x: 9, y: 9 }, { x: 15, y: 12 }, { x: 22, y: 12 }, { x: 28, y: 10 }],
  [{ x: 18, y: 22 }, { x: 19, y: 19 }, { x: 20, y: 16 }, { x: 21, y: 12 }, { x: 21, y: 6 }],
  [{ x: 29, y: 20 }, { x: 30, y: 18 }, { x: 31, y: 16 }, { x: 33, y: 15 }]
];

function validateLayout(rows) {
  const width = rows[0]?.length ?? 0;
  rows.forEach((row, index) => {
    if (row.length !== width) {
      throw new Error(`Travel map row ${index} has width ${row.length}; expected ${width}.`);
    }

    for (const symbol of row) {
      if (!TILE_BY_SYMBOL[symbol]) {
        throw new Error(`Unknown travel map symbol "${symbol}" in row ${index}.`);
      }
    }
  });
}

function createFeature(symbol, x, y) {
  if (HUB_DEFS[symbol]) {
    return {
      ...HUB_DEFS[symbol],
      type: 'hub',
      x,
      y
    };
  }

  if (POI_DEFS[symbol]) {
    return {
      ...POI_DEFS[symbol],
      id: `${POI_DEFS[symbol].idPrefix}-${x}-${y}`,
      x,
      y
    };
  }

  return null;
}

export function createHomeRegionMap() {
  validateLayout(RAW_LAYOUT);

  const height = RAW_LAYOUT.length;
  const width = RAW_LAYOUT[0].length;
  const cells = [];
  const hubs = [];
  const pois = [];
  let spawn = { x: 0, y: 0 };
  let settlementMinX = Number.POSITIVE_INFINITY;
  let settlementMinY = Number.POSITIVE_INFINITY;
  let settlementMaxX = Number.NEGATIVE_INFINITY;
  let settlementMaxY = Number.NEGATIVE_INFINITY;

  RAW_LAYOUT.forEach((row, y) => {
    row.split('').forEach((symbol, x) => {
      const base = TILE_BY_SYMBOL[symbol];
      const feature = createFeature(symbol, x, y);

      if (symbol === 'P') {
        spawn = { x, y };
      }

      if (symbol === 'H' || symbol === 'P') {
        settlementMinX = Math.min(settlementMinX, x);
        settlementMinY = Math.min(settlementMinY, y);
        settlementMaxX = Math.max(settlementMaxX, x);
        settlementMaxY = Math.max(settlementMaxY, y);
      }

      if (feature?.type === 'hub') {
        if (!hubs.some((entry) => entry.id === feature.id)) {
          hubs.push(feature);
        }
      } else if (feature?.type === 'poi') {
        pois.push(feature);
      }

      cells.push({
        x,
        y,
        terrain: base.terrain,
        blocked: base.blocked,
        zone: base.zone,
        feature
      });
    });
  });

  return {
    width,
    height,
    settlement: {
      x: settlementMinX,
      y: settlementMinY,
      width: settlementMaxX - settlementMinX + 1,
      height: settlementMaxY - settlementMinY + 1,
      spawn
    },
    hubs,
    pois,
    roads: ROAD_SEGMENTS,
    cells
  };
}
