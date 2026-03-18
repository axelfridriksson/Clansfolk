# Leader Combat Intents

This file defines the first enemy-intent model for leader combat.

The purpose of the intent system is to stop leader combat from becoming a passive stat trade.
The player should be reading the enemy and choosing a response.

This is the intended first version of that system.

## Goal

The intent system should make leader combat feel:
- readable
- tense
- choice-driven
- different from passive bar trading

The player should feel:
- I see what the enemy is trying to do
- I can answer it well or badly
- my gear matters, but my choice matters too

## First Intent Set

The first version should use only three enemy intents:

1. `Rushing`
2. `Guarded`
3. `Wild`

This is enough for:
- enemy variety
- player decision-making
- readable encounter flow

Do not add more intents until these three feel good.

## Intent 1: Rushing

### Meaning

The enemy is committing to direct pressure.

This should feel like:
- a fast lunge
- a hard push
- direct aggression

### Examples
- wolf rushing in
- boar charge
- bandit pressing forward recklessly

### Intended Counterplay

Best player response:
- `Brace`

Reason:
- direct pressure should be answered by controlled defense

Other responses:
- `Strike` is acceptable but less safe
- `Press` is risky because it clashes with enemy aggression

## Intent 2: Guarded

### Meaning

The enemy is cautious, braced, or protecting themselves.

This should feel like:
- waiting for an opening
- raising guard
- staying difficult to hit cleanly

### Examples
- bandit holding a defensive stance
- wary opponent testing distance
- shielded enemy staying protected

### Intended Counterplay

Best player response:
- `Press`

Reason:
- a guarded enemy should be pressured, broken, or forced backward

Other responses:
- `Strike` is safe but not efficient
- `Brace` mostly stalls and gives up initiative

## Intent 3: Wild

### Meaning

The enemy is unstable, overcommitted, or attacking without proper control.

This should feel like:
- reckless attack
- exposed movement
- dangerous but punishable aggression

### Examples
- wounded animal lashing out
- bandit overextending
- panicked or unstable opponent

### Intended Counterplay

Best player response:
- `Strike`

Reason:
- a wild enemy is often open to a clean punish

Other responses:
- `Brace` is safe but conservative
- `Press` creates a risky collision that may go either way

## Player Actions

The first player action set should be:
- `Strike`
- `Brace`
- `Press`
- `Retreat`

### Strike
- reliable attack
- moderate damage
- lowest complexity
- best general punish action

### Brace
- controlled defense
- reduces incoming pressure
- best answer to direct aggression

### Press
- aggressive pressure
- stronger commitment than `Strike`
- best answer to passive or guarded enemies
- riskier if used badly

### Retreat
- disengage attempt
- valid choice when risk is too high

## First Counter Matrix

This is the recommended first interaction model.

### Enemy: Rushing
- `Brace` = best
- `Strike` = acceptable
- `Press` = risky

### Enemy: Guarded
- `Press` = best
- `Strike` = weak but safe
- `Brace` = stalls

### Enemy: Wild
- `Strike` = best punish
- `Brace` = safe
- `Press` = volatile clash

This should be enough for the first tuning pass.

## Why This Works

This matrix gives the player:
- one clear defensive answer
- one clear aggressive answer
- one safe baseline answer

That is enough to create a meaningful read-and-respond loop.

## Enemy Identity Through Intent Weighting

Different enemies can feel unique without needing totally different systems.

### Wolf
- often `Rushing`
- sometimes `Wild`
- rarely `Guarded`

### Boar
- often `Rushing`
- sometimes `Guarded`
- less often `Wild`

### Bandit
- often `Guarded`
- sometimes `Rushing`
- sometimes `Wild`

### Bandit Brute Later
- often `Rushing`
- often `Wild`
- rarely `Guarded`

This creates enemy identity through intent frequency and behavior style.

## Good Read Result

If the player chooses the correct response:
- they should take less damage
- they should deal better damage
- they should feel the turn swing in their favor

This feedback is essential.

## Bad Read Result

If the player chooses poorly:
- they should take more pressure
- their own result should be weaker
- they should feel that the choice mattered

This creates real tension.

## Expansion Later

Do not add these yet, but they are possible future intent states:
- `Wary`
- `Off-balance`
- `Cornered`
- `Feinting`

Only expand once the first three intents are solid.

## Summary

The first leader-combat intent system should use:
- `Rushing`
- `Guarded`
- `Wild`

These interact against:
- `Strike`
- `Brace`
- `Press`
- `Retreat`

This gives leader combat a readable, grounded, and choice-driven identity.
