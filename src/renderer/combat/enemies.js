export const ENEMY_ARCHETYPES = [
  {
    id: 'raider',
    label: 'Raider',
    names: ['Frost Raider', 'Rime Reaver', 'Coast Marauder'],
    role: 'melee',
    hpMult: 0.92,
    atkMult: 1.08,
    traits: ['fast', 'light armor']
  },
  {
    id: 'shield',
    label: 'Shield Bearer',
    names: ['Shield Bearer', 'Ice Wall', 'Hold Defender'],
    role: 'melee',
    hpMult: 1.18,
    atkMult: 0.92,
    traits: ['shielded', 'steady']
  },
  {
    id: 'brute',
    label: 'Brute',
    names: ['Ash Brute', 'Bone Mauler', 'Crag Crusher'],
    role: 'heavy',
    hpMult: 1.32,
    atkMult: 1.04,
    traits: ['heavy', 'slow']
  },
  {
    id: 'skirmish',
    label: 'Skirmisher',
    names: ['Wind Skirmisher', 'Hook Runner', 'Loose Knife'],
    role: 'bowmen',
    hpMult: 0.84,
    atkMult: 1.18,
    traits: ['harrier', 'fragile']
  },
  {
    id: 'beast',
    label: 'Beast',
    names: ['Frost Wolf', 'Ash Hound', 'Ridge Stalker'],
    role: 'horsemen',
    hpMult: 0.98,
    atkMult: 1.12,
    traits: ['beast', 'pouncing']
  },
  {
    id: 'captain',
    label: 'Captain',
    names: ['Fracture Captain', 'Ashbound Chief', 'Rime Warlord'],
    role: 'heavy',
    hpMult: 1.45,
    atkMult: 1.2,
    traits: ['elite', 'commanding']
  },
  {
    id: 'berserker',
    label: 'Berserker',
    names: ['Frenzy Berserker', 'Rage Brute', 'Blood Howler'],
    role: 'melee',
    hpMult: 1.1,
    atkMult: 1.3,
    traits: ['berserk', 'reckless']
  },    
  {
    id: 'sniper',
    label: 'Sniper',
    names: ['Deadeye Sniper', 'Ice Marksman', 'Shadow Archer'],
    role: 'bowmen',
    hpMult: 0.75,
    atkMult: 1.4,
    traits: ['sniper', 'fragile']
  }
];

export function getEnemyArchetypePool(isCaptain = false) {
  return ENEMY_ARCHETYPES.filter(entry => isCaptain ? entry.id === 'captain' : entry.id !== 'captain');
}
