# Leader System Spec

This file defines the leader system for local exploration and later remote expeditions.

The leader is the player-facing character of the exploration layer.
The leader should make local exploration feel personal, risky, and rewarding.

## Purpose

The leader exists to do four jobs:
- act as the player's body on the local map
- make exploration personal instead of abstract
- create a separate progression path from the warband
- make victory and failure feel meaningful

If the leader is only a token on the map, the exploration layer will feel flat.
If the leader has gear, risk, and visible growth, the exploration layer becomes compelling.

## Core Identity

The leader should be:
- one named person
- the central actor of local exploration
- stronger and more customizable than a normal clansfolk
- vulnerable enough that defeat matters

The leader should not feel like:
- a worker
- a generic warband member
- a copy of the army system

## Role in Gameplay

The leader should be the one who:
- walks the local map
- discovers points of interest
- enters encounters
- uses personal gear
- gains local rewards

The local exploration layer should naturally revolve around the leader.

## First Mechanical Version

The first version should stay simple.

Recommended starting stats:
- `HP`
- `ATK`
- `DEF`

That is enough for:
- simple combat
- understandable upgrades
- clear gear effects

Do not add more stats until the core loop works.

## Gear Slots

The first leader gear system should use three slots:
- weapon
- armor
- shield or off-hand

This is the cleanest early setup because each slot has a clear role:
- weapon = damage
- armor = survivability
- shield = defense identity

## Gear Philosophy

Leader gear should be different from warband gear.

Leader gear should be:
- personal
- scarce
- meaningful per item
- found through exploration and local encounters

Warband gear should remain:
- mass-produced
- economy-driven
- less personal

This separation keeps both systems relevant.

## Early Gear Ladder

The early game should provide a small but exciting ladder of leader equipment.

### Weapons
- none
- crude knife
- wood axe
- rusted sword

### Armor
- none
- padded wrap
- hide vest
- rough mail scraps later

### Shield / Off-hand
- none
- buckler
- rough shield

This is enough to make early victories matter.

## Reward Sources

The leader should grow stronger through local exploration rewards.

Early reward sources:
- bandit camp victories
- animal den victories
- abandoned site discoveries
- small hidden caches

Reward categories:

### 1. Loot
- food
- metal scraps
- hides
- supplies

### 2. Equipment
- weapon drops
- armor drops
- shield drops

### 3. Exploration Value
- revealed locations
- route information
- hints toward future POIs

This keeps victories meaningful even before full regional systems exist.

## Leader Progression

The leader should initially get stronger through gear, not through a large skill tree.

Phase 1 progression:
- base stats
- gear upgrades
- stronger encounter rewards

Phase 2 progression:
- traits
- wounds
- temporary field bonuses
- simple specialization

Phase 3 progression:
- deeper legacy or commander systems if still desired later

Do not start with a large perk tree.

## Leader Screen

The leader screen should make the player care about the leader immediately.

The first version should show:
- leader portrait or placeholder figure
- weapon slot
- armor slot
- shield slot
- HP
- ATK
- DEF

Later additions can include:
- status effects
- wound state
- scouting range
- movement traits

The leader screen should communicate:
- this is my character
- gear matters
- stronger rewards matter

## Home Region Defeat

Defeat in the home-region tutorial map should matter, but should not be catastrophic.

Recommended early home-region defeat result:
- leader is wounded or forced to retreat
- exploration run ends
- some local progress or loot may be lost
- the player returns home instead of suffering total collapse

Reason:
- the home region teaches the system
- punishment must exist
- but failure should not be so harsh that learning feels bad

## Remote Expedition Death

Remote expedition failure should be harsher later.

Recommended later remote-expedition death result:
- leader dies or expedition collapses
- field camp is lost
- gains are heavily reduced or lost
- major setback

This is where high-risk travel earns its tension.

## Emotional Goals

The leader system should make the player feel:
- I want better gear
- this fight matters
- exploring farther is risky
- coming back stronger feels good

If the leader does not create those feelings, the system is failing its purpose.

## Out of Scope for First Version

Do not add these yet:
- deep trait trees
- lineage systems
- complex wound simulation
- permanent character death in the home-region tutorial phase
- large item rarity systems

Those can come later if the simpler version works.

## Recommended First Implementation Target

The first leader system implementation should support:

1. Base HP, ATK, and DEF
2. Three gear slots
3. A visible leader panel
4. A few simple gear rewards
5. Defeat on the home map causing retreat or wound instead of total loss

That is enough for the first local exploration slice.

## Summary

The leader should be the personal progression hook of the exploration layer.

The first version should stay simple:
- three core stats
- three gear slots
- small reward ladder
- personal growth through exploration wins
- controlled failure in the home region
