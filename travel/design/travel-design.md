# Travel System Design

This file defines the intended direction for the Travel layer.

Travel is not just another version of warcamp combat.
Travel is the campaign, expedition, and regional-control layer of the game.

The first map in this layer should not be a remote expedition map.
The first map should be the home-region tutorial map around the player's settlement.

## Purpose

Travel should answer these questions:
- Where do I send people?
- What am I risking by going there?
- What can I discover, exploit, trade with, or conquer?
- How far can I safely push from home?

The main settlement game is about growth and survival.
Travel is about expansion, pressure, and loss.

## Core Identity

Travel should feel:
- player-controlled
- risky
- slower and more deliberate than the main combat screen
- more personal at small scale
- more strategic at large scale

The intended vibe is closer to:
- RuneScape-style local exploration
- Pokemon-style moving around a destination map

That means the player should not just click a mission and wait.
The player should be able to move around a local map and interact with what they discover.

The first version of this should happen in the home region.
Remote expedition maps come later.

## Layer Breakdown

Travel needs to be split into clear layers so the system stays buildable.

### 1. Home Region Exploration

This is the first playable map layer.

The player starts from the settlement they have been building and explores the nearby land.

This layer exists to teach:
- movement
- discovery
- leaving safety
- local risk
- how map interaction works

This map should act as the tutorial space for the exploration system.

### 2. World Travel

This is the layer where the player:
- picks a destination from the world map
- chooses who is going
- chooses what gear and supplies go with them
- waits for travel time to complete

Travel time should matter.
Going to a new place is a commitment, not a free screen swap.

### 3. Field Camp

When the player later reaches a remote map, they establish a temporary field camp.

This is not a full settlement.
It is a forward operating camp that exists to support exploration and conflict.

Field camp role:
- store expedition supplies
- stage escorts
- recover after fights
- support local gathering or raiding

Good early camp structures:
- watchfire
- supply tent
- cookpit
- stock rack
- scout post
- barricade
- repair bench

### 4. Local Exploration

This is the player-controlled layer.

The leader moves around the local map and discovers:
- resource sites
- ruins
- bandit camps
- neutral settlements
- hostile settlements
- strongholds later

The leader can go alone or take escorts.

Escort tradeoff:
- more escorts = safer
- more escorts = slower movement
- more escorts = higher food use
- more escorts = more carrying capacity

This layer should first be proven on the home-region tutorial map.
Remote local maps should later reuse the same exploration rules.

### 5. Local Outcomes

Once locations are discovered, the player can interact with them.

Possible outcomes:
- gather
- secure
- trade
- negotiate
- ally
- raid
- attack
- conquer

This is what turns exploration into progression.

## Travel Progression

Travel should start small.

Early game travel:
- home-region exploration first
- small party cap once remote travel opens
- nearby destinations only
- mostly scouting and small raids
- minimal diplomacy
- no major army warfare yet

Mid game travel:
- larger expedition size
- more dangerous maps
- resource sites and settlements matter more
- settlement hostility and retaliation appear

Late game travel:
- multiple controlled regions
- frontier settlements
- larger military actions
- supply and campaign management

## Party Size Philosophy

Travel and war should not use one combat model for every scale.

Use different logic by scale:

- `Leader alone`
  - personal danger
  - ambushes
  - hard fights

- `Leader + 1-10 escorts`
  - skirmish logic
  - strongest early travel form

- `10-50`
  - no longer pure personal exploration
  - more organized raiding and camp warfare

- `50+`
  - strategic army layer
  - abstracted conflict, not leader-scale wandering

This keeps the system coherent.

## Failure State

Leader death should matter.

If the leader dies on a remote expedition:
- the travel attempt collapses
- the forward camp is lost
- expedition gains are lost or mostly lost
- this becomes one of the major risk/reward moments in the game

This gives Travel a real sense of danger.

The home-region tutorial map does not need to use the full expedition-loss version of this rule immediately.

## Mission Types

Travel should eventually support these mission types:

### Scout
- reveals map areas and local nodes
- low risk
- grants intel and knowledge

### Raid
- steals resources from targets
- medium risk
- weakens enemy presence without immediate conquest

### Embers
- targets dangerous ash-heavy regions
- high risk
- unlocks rites-related rewards and content

### War
- direct aggression toward hostile settlement forces
- used to weaken local control

### Conquest
- claim territory after enough pressure has been applied
- changes ownership of a node or settlement

### New Settlement
- expensive, long-term expansion action
- creates player presence in a new region

## Settlement Interaction

Settlements should be one of the main goals of local exploration.

Once discovered, the player should be able to:
- talk
- trade
- ally
- raid
- attack

Settlement state should include:
- owner
- attitude toward player
- garrison current
- garrison maximum
- regeneration rate
- defense value
- wealth / value
- local needs

That makes settlements feel like places, not buttons.

## Resource Sites

Travel maps should contain resource locations such as:
- wood site
- food site
- stone site
- metal site
- ash field

After scouting a resource site, the player may:
- harvest it directly
- secure it
- assign clansfolk to it later
- defend it if hostile forces retaliate

Resource sites should create regional tension.
If a player takes a site, someone may want it back.

## Enemy Retaliation

Taking things should create pressure.

Examples:
- bandits strike back after raids
- a hostile settlement attacks a captured resource site
- a neutral group becomes hostile after repeated aggression

That keeps Travel dynamic and prevents it from becoming passive resource collection.

## Map Types

The local map system should eventually support these discovered location types:
- resource site
- ruin
- bandit camp
- settlement
- town
- fortress / castle
- special landmark

Each map does not need every type.
The generated map should mix a few strong points rather than become cluttered.

## First Playable Slice

Do not build the whole travel vision at once.

The first playable slice should be:

1. Enter the home-region tutorial map from the main settlement
2. Spawn the leader at the home settlement
3. Walk the leader around a small local map
4. Discover three location types:
   - resource site
   - bandit camp
   - neutral settlement
5. Support three interactions:
   - gather / secure
   - talk / trade
   - raid / attack
6. Prove the loop feels good before adding remote expeditions

If this slice works, then expand.

## Current Design Constraints

- Travel must not become a duplicate of main combat
- Travel should begin in the home region as a tutorial layer
- Remote expeditions should come after the home-region loop works
- Travel should prioritize local exploration and map interaction
- Large-scale war logic can come later
- Random map generation should happen after the core local loop is defined

## Open Questions

These still need answers before implementation:

- How large should the home-region tutorial map be?
- Is movement tile-based, free movement, or node-to-node?
- What does a 1-10 escort fight actually look like?
- How much of local gathering is manual versus automated from camp?
- What can be brought back to the main settlement versus kept locally?
- How much control does the player have over camp building before it becomes too much?

## Working Summary

Travel should become:
- home-region exploration first
- expedition travel
- temporary camp building
- local player-controlled exploration
- regional resource pressure
- settlement interaction
- later conquest and expansion

That is the intended identity of the system.
