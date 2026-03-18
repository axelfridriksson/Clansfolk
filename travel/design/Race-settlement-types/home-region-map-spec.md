# Home Region Map Spec

This file defines the first local map the player should explore.

This is the tutorial region for the exploration layer.
It is not a remote expedition map.
It is the area around the player's starting settlement.

## Purpose

The home-region map exists to teach:
- how local movement works
- how the player leaves safety
- how discoveries are found
- how danger is introduced
- why local victories matter

This map should onboard the exploration system before remote travel maps exist.

## Core Identity

The first local map should feel like:
- a coastal settlement edge
- the beginning of a frontier
- home at the shoreline
- wilderness inland

The player should immediately understand:
- where home is
- where safety is
- where exploration begins

## Orientation

The settlement should sit by the coast.

Recommended orientation:
- south = ocean or shoreline
- north = inland wilderness

This creates a strong directional read:
- south is known and safe
- north is rough and unknown

The shoreline should act as a visual and spatial anchor.
It also gives the first map a memorable identity instead of feeling like a generic land box.

## Map Size

Recommended first map size:
- `39 x 26`

This is large enough to:
- show the settlement edge
- support exploration
- hold a few clear points of interest

It is still small enough to:
- read quickly
- feel dense
- avoid empty wandering

## Map Zones

The map should be divided into three major zones.

### 1. Settlement Core

This is the safest part of the map.

It should include:
- the player's home settlement footprint
- pathing around the settlement
- shoreline edge
- open space near the starting point

This area should feel:
- warmer
- calmer
- more structured

### 2. Settlement Edge

This is the transition space between safety and the wild.

It should include:
- paths leading north
- cut stumps, broken fencing, scattered tools, or signs of work
- sparse blockers

This area should feel:
- familiar but less protected
- like the edge of expanding habitation

### 3. Outer Wilds

This is where the player starts to feel risk.

It should include:
- more broken terrain
- more obstacle clusters
- first points of interest
- less visual order

This area should feel:
- colder
- rougher
- less controlled

## Safe Area Rules

The starting area should be safe, but it should not feel like a visible safe box.

Design rule:
- the space immediately around the settlement should function as a safe area
- this can internally be represented as roughly a `3 x 3` or `4 x 4` protected region
- the player should not see those boundaries explicitly

The player should instead feel safety through:
- visuals
- open space
- low danger
- proximity to home

## Settlement Footprint

The settlement should be represented in a simplified way.

It does not need to literally render every building from the main game.

Instead, it should visually communicate:
- this is the place the player has built
- people live here
- this is the anchor of the surrounding region

The first version can show:
- a few structures
- cleared ground
- some fencing or posts
- a shore path or landing area
- one main route leading inland

## Map Flow

The intended early flow is:

1. Spawn in settlement core
2. Move through settlement edge
3. Head north into the wild
4. Discover first points of interest
5. Return to settlement

The map should encourage outward movement without becoming a corridor.

## Obstacle Rules

Obstacles should shape the map, not clutter it.

Use clustered blockers such as:
- rock patches
- tree stands
- scrub or ash clusters
- broken ruins later

Do not use random single blockers everywhere.
The map should feel natural, not noisy.

The player should always have multiple viable directions to move inland.

## First Points of Interest

The first local map should not focus on resource sites yet.

The early points of interest should teach:
- danger
- curiosity
- reward

Recommended first POI set:

### 1. Animal Den or Nest

Purpose:
- first hostile or risky encounter
- teaches that the wild pushes back

Possible rewards:
- meat
- hide
- bones, fangs, or simple trophy items later

### 2. Bandit Camp

Purpose:
- first human hostile site
- introduces a more intentional enemy presence

Possible rewards:
- food
- metal scraps
- stolen goods
- basic weapon or armor piece

### 3. Abandoned or Curious Site

Purpose:
- non-hostile discovery
- teaches exploration reward without combat

Examples:
- broken cart
- ruined watch post
- abandoned hut
- washed-up wreckage near the coast

Possible rewards:
- supplies
- map clues
- crafting scrap
- early leader gear piece

## Reward Philosophy

Victories and discoveries on the local map should matter immediately.

Early local rewards should give:

### 1. Loot
- food
- wood
- metal scraps
- hides

### 2. Leader Progress
- simple weapon upgrade
- simple armor upgrade
- simple shield or off-hand later

### 3. Knowledge Value
- map reveal
- awareness of local threats
- unlocked future interactions

This makes local exploration feel valuable even before full regional control exists.

## Leader Progression Hook

The player needs a reason to care about the leader.

The first local map should support the idea that:
- the leader can become stronger
- gear matters
- victories can directly improve the leader

Early leader gear slots should conceptually include:
- weapon
- armor
- shield or off-hand

These should feel personal and separate from the mass gear used by the warband.

Leader gear should be:
- more individual
- more exciting per item
- found through exploration, fights, and discoveries

Warband gear should remain:
- broader
- more economic
- less personal

## Emotional Goals

The player should feel:
- this is my settlement
- I am leaving the safety of home
- something dangerous could be out there
- if I win, I come back stronger

That is the emotional job of the first home-region map.

## Out of Scope for This Map

Do not add these to the first home-region version:
- full diplomacy systems
- resource-site occupation systems
- settlement conquest
- army-scale war
- multiple remote maps
- advanced procedural generation

Those come after the first local map proves the exploration loop.

## Recommended Expansion Order

Once this home-region tutorial map works:

1. Add clearer interaction prompts at POIs
2. Add simple encounter resolution
3. Add leader gear rewards
4. Add one neutral contact point
5. Add simple return-to-home reward flow
6. Reuse the same system for remote expedition maps later

## Summary

The first local map should be a coastal tutorial region centered on the player's settlement.

It should teach:
- movement
- safety versus danger
- first discoveries
- first wins
- the idea that the leader can grow stronger through local exploration
