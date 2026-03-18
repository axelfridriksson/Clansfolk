# Leader Combat Spec

This file defines the first combat system for local exploration.

Leader combat is the first combat layer the game should implement for the home-region tutorial map.
It should feel personal, risky, and readable.
It should be turn-based, but not passive.

It should not feel like:
- the main warband combat screen
- a mass battle
- a passive wait-and-watch bar exchange
- a generic fantasy RPG menu loop

## Purpose

Leader combat exists to support:
- early hostile POIs
- ambushes
- animal encounters
- small personal fights during exploration

It should make the player feel:
- I am personally in danger
- my gear matters
- choosing to fight is a real decision
- reading the enemy matters

## Scope

This first version is only for:
- the leader alone

Later, the party combat layer will cover:
- leader plus escorts
- small-unit tactics

Do not mix those into the first version.

## Core Feel

Leader combat should be:
- personal
- short
- tense
- understandable
- harsh
- grounded

The player should feel like they are in a dangerous encounter, not supervising numbers from a distance.

The intended direction is:
- turn-based
- intent-based
- survival-focused
- shaped by expedition context

## Core Stats

The first version should use:
- `HP`
- `ATK`
- `DEF`

Optional later:
- `Poise` or `Balance`

These come from:
- leader base stats
- weapon
- armor
- shield / off-hand

This is enough for the first implementation.

## Encounter Entry

Leader combat begins when the player chooses to engage a hostile POI or triggers an ambush.

First-version entry points:
- attack `Animal Den`
- attack `Bandit Camp`
- triggered hostile encounter in the wild later

The player should see a compact encounter prompt before combat starts.

That prompt should show:
- enemy name
- threat level
- short flavor line
- basic reward hint

And give these choices:
- `Attack`
- `Retreat`

This prompt should frame the fight as a risky field encounter, not an arena match.

## Threat Readability

Do not overuse raw numbers in the first version.

Use a simple threat label:
- `Low`
- `Medium`
- `High`

Optionally add a short hint such as:
- "A disturbed nest"
- "Fresh tracks and blood"
- "More than one armed figure inside"

This gives tension without forcing stat parsing too early.

## Expedition Context

Leader combat should not feel disconnected from exploration.

As the wider system grows, encounters should be influenced by context such as:
- distance from settlement
- current wounds
- current loot carried
- local danger level
- whether the leader is deep in hostile ground

The first version does not need every one of these systems fully implemented, but the design should assume that leader combat belongs to the exploration outing rather than being a detached duel screen.

## Combat Structure

The first version should be a turn-based duel encounter.

It should not be:
- full action combat
- a battlefield simulator
- an automatic DPS race

Recommended structure:
- the enemy shows a visible combat intent
- the player chooses a response
- the turn resolves
- the fight continues until victory, retreat, or defeat

Basic loop:
1. combat starts
2. enemy intent is shown
3. player chooses an action
4. outcome resolves
5. HP and state are updated
6. next turn begins unless combat ended

This is the intended first combat loop.

## Enemy Intent

Enemy intent is one of the main features that should make leader combat different.

The player should not be blindly trading numbers.
The player should be reading what the enemy is about to do.

Examples of visible enemy intent:
- `Rushing`
- `Guarded`
- `Wild`
- `Wary`
- `Off-balance`

These should communicate the shape of the next exchange without requiring long explanations.

This makes fights more about reading and responding than simply choosing the highest-damage button every turn.

## Player Choices

The first version should keep the choice set small.

Recommended early options:
- `Strike`
- `Brace`
- `Press`
- `Retreat`

Meaning:
- `Strike` is the safe attack
- `Brace` reduces incoming pressure and stabilizes the leader
- `Press` is more aggressive and riskier than `Strike`
- `Retreat` attempts to leave the encounter

This set is small enough to build, but more flavorful and grounded than generic fantasy menu verbs.

Optional later:
- `Risk Blow`
- `Use Item`

Do not start with too many actions.

## Combat Outcomes Beyond Death

Leader combat should not always be about reducing the enemy to zero in the most direct way.

Possible encounter outcomes should eventually include:
- kill
- drive off
- force retreat
- survive and withdraw
- fail and be pushed back

This helps fights feel like field encounters rather than formal arena duels.

The first version can still mostly resolve through HP, but the design should aim toward broader outcomes.

## Enemy Types

The first leader-combat enemies should be simple and distinct.

### Animal Den

Enemy feel:
- aggressive
- simpler pattern
- practical reward

Combat identity:
- straightforward danger
- lower complexity than human enemies
- more direct aggression

### Bandit Camp

Enemy feel:
- more deliberate
- more rewarding
- more threatening

Combat identity:
- stronger pressure
- better loot chance
- more deliberate and calculating than wildlife

These two are enough for the first tutorial layer.

## Victory State

Victory should give:
- immediate loot
- chance for leader gear improvement
- POI cleared or resolved state

Examples:
- food
- hides
- scraps
- crude weapon
- simple armor piece
- shield piece

Victory should feel like progress, not just survival.

## Retreat State

Retreat should be a valid choice.

If the player retreats:
- they leave the encounter
- they may lose the immediate opportunity
- they may return later
- they may take a small penalty such as minor damage or failed attempt state

This supports exploration tension without forcing every engagement.

## Defeat State

For the home-region tutorial map, defeat should not be full character death.

Recommended early defeat result:
- leader is wounded
- leader is returned to settlement
- encounter is failed
- some loot may be lost or not gained

This keeps consequence real while still letting the tutorial layer be learnable.

Remote expedition maps can later use harsher failure.

## Gear Impact

Gear should matter clearly in leader combat.

Examples:
- better weapon = more reliable damage
- better armor = lower incoming damage and better survival
- better shield = safer defensive play and stronger `Brace`
- better gear should improve odds without replacing decision-making

The player should be able to understand:
- why a fight was hard
- why new gear helps

If gear changes are too subtle, the leader loop will feel weak.

## UI Direction

Leader combat should not reuse the large warband overview presentation.

The first combat panel should be:
- compact
- leader-focused
- enemy-focused
- easy to read
- built around turn choices

It should show:
- leader HP
- enemy HP
- leader gear
- threat label
- enemy intent
- current action choices

This should feel like a local encounter, not a campaign screen.

## Tutorial Role

Leader combat in the home region should teach:
- danger exists outside the settlement
- combat is optional in some cases
- gear and preparation matter
- retreat is sometimes the right call
- enemy behavior can be read and answered

This is the learning purpose of the system.

## Out of Scope

Do not add these in the first leader-combat version:
- escort units
- formation control
- commander assignments
- cavalry logic
- army morale systems
- battlefield deployment
- full action movement combat
- large ability bars

Those belong to party or army combat layers, not this one.

## Recommended First Implementation Target

The first leader-combat implementation should support:

1. One encounter prompt
2. Threat label
3. Visible enemy intent
4. Three actions:
   - strike
   - brace
   - press
5. Retreat option
6. Enemy HP and leader HP
7. Victory / retreat / defeat outcomes
8. Loot and simple gear reward hooks

That is enough for the first home-region exploration slice.

## Summary

Leader combat should be a short, turn-based, intent-driven encounter system for exploration.

It should:
- feel risky
- reward gear upgrades
- give the player choices
- make reading the enemy matter
- support the home-region tutorial map without becoming a second army system
