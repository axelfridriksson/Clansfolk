# Local Exploration Spec

This file defines the first implementation target for the local exploration layer.

The purpose of this layer is to prove that moving around a local map feels good.

This first version should happen in the home region around the player's settlement.

This is the first playable slice of the broader Travel system.

## Goal

The player should:
- arrive on a local map
- start from their settlement
- move around manually
- feel like they are exploring a real place
- not see an obvious tile grid

This milestone is about movement, space, and readability.
It is not yet about full diplomacy, conquest, or large-scale warfare.

## Design Principle

Use a hidden grid for logic, but do not show a visible grid to the player.

That means:
- map logic is tile-based
- movement is tile-based
- collision is tile-based
- fog of war is tile-based
- visuals should look organic and scene-based

The player should feel like they are walking through a place, not stepping across board squares.

## First Milestone

Version 1 of local exploration should support:

1. One small local map
2. The player's settlement as the starting point
3. Leader spawn at the settlement
4. Manual movement
5. A few blocked areas
6. Fog of war or reveal radius
7. Readable wilderness around the settlement

That is enough for the first milestone.

## Map Size

Recommended first map size:
- `24 x 16`

Reason:
- small enough to understand quickly
- large enough to explore
- large enough to support settlement edge plus nearby wilderness
- small enough to avoid empty dead space

If needed, later versions can move to:
- `30 x 20`
- `40 x 24`

Do not start larger than necessary.

## Grid Model

Each cell should track at least:
- walkable or blocked
- terrain type
- revealed or hidden
- object or point of interest if present

Possible terrain types for the first version:
- open ground
- grass
- dirt
- ash-stained ground
- rock / obstacle

This can stay very simple at first.

## Visual Rules

The grid should not be visible.

Do not show:
- square borders
- hard tile outlines
- obvious repeating checkerboard terrain

Instead:
- draw a continuous ground layer
- place visual variations over it
- place props based on cells
- move the player smoothly between cell centers

The player should see a map scene, not a tilemap.

## Movement Rules

Use cell-based movement with smooth interpolation.

First version rules:
- movement is one cell at a time
- blocked cells stop movement
- player moves with keyboard
- movement should visually ease or interpolate so it feels like walking

Recommended controls:
- `WASD`
- arrow keys

Optional later:
- click to move

Do not start with click-to-move.
Keyboard movement is the cleaner first proof of feel.

## Camera Rules

For the first version, use a fixed camera if the whole map fits on screen.

This is recommended because:
- it is easier to read
- it is easier to debug
- it avoids early camera problems

Later, if the map becomes larger than the visible frame:
- switch to a soft follow camera

But the first version should stay fixed if possible.

## Settlement Rules

The settlement is the anchor of the local map.

The settlement should:
- be the player spawn point
- be visually distinct
- feel safer than the surrounding wilderness

Settlement placement:
- near lower-middle or lower-left
- with a small clear area around it
- with obvious paths or exits leading outward

Settlement visuals should feel:
- warmer
- calmer
- more structured

The settlement does not need full local systems yet.
For this milestone, it is mainly:
- the start point
- the return point
- the visual center of safety

The settlement does not need to render every main-game building literally.
It can be a simplified local representation of the built settlement.

## Obstacle Rules

Use a small number of hard blockers to shape the space.

Hard blockers:
- rocks
- tree clusters
- broken wall pieces

Soft visual fillers:
- grass tufts
- ash patches
- small stones
- debris

Do not overfill the map with blockers.
The first map should still be easy to walk around.

## Fog of War

Use the hidden grid for visibility.

First version:
- the player reveals tiles in a radius around the leader
- unrevealed areas stay obscured
- explored areas can remain dimly visible or fully visible depending on feel later

This gives the act of moving value.

## Player Feel Target

The player should feel:
- this is my settlement
- I am stepping into unknown ground
- I am exploring a small real place
- the space is readable and intentional

If the player instead feels:
- I am moving on squares
- this looks like a debug map
- this is empty and lifeless

then the milestone has failed.

## Things Explicitly Out of Scope

Do not add these in the first local exploration milestone:
- escorts
- diplomacy systems
- local resource ownership
- settlement conquest
- procedural biome complexity
- army-scale fighting
- multiple maps

Those come after movement and local presence feel correct.

## Recommended Expansion Order

After this milestone works, expand in this order:

1. Add one resource site
2. Add one hostile bandit camp
3. Add one neutral settlement
4. Add interaction prompts
5. Add simple encounter / danger logic
6. Add return-to-settlement loop

That keeps the feature layered and testable.

## Summary

The first version of local exploration should prove one thing:

The player can enter a small local map from their settlement, move around naturally, and feel like they are exploring a place rather than clicking through another UI screen.
