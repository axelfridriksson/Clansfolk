# Combat Layers

This file defines the combat split for the Travel and local exploration systems.

Combat should not be one mechanic stretched across every scale.
The game needs separate combat layers for:
- the leader alone
- a small or medium party
- a large army

These layers can share concepts, but they should not play the same way.

## Purpose

The combat split exists because the player experience changes completely by scale.

At different sizes, the player should be thinking about different things:
- alone = survival
- party = command and formation
- army = strategy and deployment

If one system tries to cover all three scales, it will become shallow and unclear.

## Shared Concepts

These concepts can exist across all combat layers:
- leader
- commanders
- unit roles
- equipment quality
- morale
- terrain
- supply later

The mechanics, however, should change by scale.

## Layer 1: Leader Combat

### Scale
- `1`

### Role

This is the personal combat layer.

The player is directly identified with the leader.
This should feel:
- vulnerable
- immediate
- risky
- gear-driven

### Use Cases
- animal den encounter
- ambush
- duel
- early hostile exploration encounter

### Design Goal

The player should feel:
- I am personally in danger
- my gear matters
- I can retreat or press the fight

### Key Characteristics
- personal scale
- leader stats matter most
- short encounter length
- defeat is meaningful

This is the first combat layer needed for the home-region tutorial map.

## Layer 2: Party Combat

### Scale
- `2 to 50`

### Role

This is the small-force command layer.

The leader is no longer just fighting personally.
The leader is organizing and directing a group.

The leader can still choose to join combat, but command becomes more important.

### Design Goal

The player should feel:
- I am planning this fight
- unit composition matters
- the leader's placement matters
- this is not the same as a duel

### Unit Types

The party layer should eventually support compositions such as:
- swordsmen
- spearmen
- bowmen
- horsemen

Early implementation can simplify this to:
- melee
- ranged
- leader position

### Gameplay Focus

Party combat should focus on:
- front line
- support line
- ranged line
- reserves later
- whether the leader joins or stays back

This layer should feel tactical and controlled, not cinematic mass warfare.

## Layer 3: Army Combat

### Scale
- `50+`

### Role

This is the battlefield command layer.

At this size, the player should not be focused on the leader's personal swings or survival in the same way.
The player should be focused on:
- commanders
- formations
- legions or battle groups
- unit mix
- battle plan

### Design Goal

The player should feel:
- I am organizing a real military force
- commander assignment matters
- unit composition matters at a large scale
- this is the biggest and most impressive war layer in the game

### Unit Types

The army layer should eventually support choices such as:
- infantry
- archers
- cavalry / horsemen
- skirmishers later
- special units later

### Command Structure

A strong direction for this layer is:
- assign commanders to legions or battle groups
- choose a composition for each group
- deploy them with a battle plan

This is where the later large-scale war fantasy should live.

## Scale Boundaries

Recommended design boundaries:

- `1`
  - leader combat

- `2 to 12`
  - small party skirmish

- `12 to 50`
  - organized party combat

- `50+`
  - army combat

These numbers can be tuned later, but the conceptual break between scales should remain.

## What Should Not Happen

Do not do these:
- use one combat screen for all scales
- use the army layer to resolve leader exploration fights
- use the duel layer to resolve 50-man clashes
- force the same UI language on every battle size

Each combat layer needs its own identity.

## Current Recommendation

The order of development should be:

1. Leader combat
2. Party combat
3. Army combat

Reason:
- leader combat is needed first for home-region exploration
- party combat comes next as travel grows
- army combat should only come after the smaller layers are proven

## Summary

Travel combat should be built as three separate systems:
- leader combat for personal encounters
- party combat for tactical small-force command
- army combat for large-scale warfare

That split should guide future design and implementation.
