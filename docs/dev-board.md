# Clansfolk Dev Board

This file is the working board for the game. It exists to keep feature work explicit.

Use it for three things:
- See what systems already exist
- Decide what to work on next
- Avoid mixing design, implementation, and tuning into one pile

## Current Build State

| Area | Status | What Exists Now | Current Problems | Next Practical Step |
| --- | --- | --- | --- | --- |
| Core economy | In progress | Resource generation, storage, worker jobs, leader assist, basic scaling | Economy still needs tuning and clearer midgame pacing | Tune rates, costs, and unlock timings from actual run targets |
| Clansfolk growth | In progress | Growth bar, food consumption, starvation, idle-based growth | Growth pacing still needs tuning under pressure | Finalize growth curve and overcrowding interaction |
| Buildings | In progress | Housing, storage, logistics, war, knowledge, ash buildings | Some categories overlap conceptually, costs need more passes | Finalize building roles and remove redundant designs |
| Innovations | In progress | One-time innovation unlocks and progression gates | Some unlock chains are still messy and need tier cleanup | Split early and midgame innovation tiers more clearly |
| Warcamp | In progress | Warband sending, gear, blacksmith, roster, combat stats | Still needs more identity and commander depth later | Stabilize equipment flow and warband UX |
| Main combat | Playable alpha | Enemy scaling, zone progress, stance system, combat screen | Combat feel is better but still not final | Add more readable feedback and risk/reward pacing |
| Rites | Playable alpha | Patrons, minigames, rites buildings, ash usage | Good prototype, still needs content depth and balancing | Finish each patron loop and tighten rewards |
| Travel | Active rework | Dedicated travel screen, overlay map, draggable map, party cap, travel upgrades | Mission model is not settled yet | Build settlement/node system and mission types |
| Prestige / ascend | Partial | Ascend button, remnants/runes hooks, cycle framing | Meta layer is not developed enough yet | Define first real rune/remnant choices |
| Save / progression safety | Weak | Save/load works, stage presets exist | No migration/version strategy, no regression coverage | Add test coverage for save merge and progression gates |
| Performance | In progress | Low FX mode, some effect reduction, lighter counters | Long-session profiling is still missing | Profile fight loop, map view, and animation hotspots |

## Active Focus

This is the part of the game we are actively shaping right now.

### 1. Travel Rework

Direction:
- Travel is its own screen
- The map is the main visual focus
- UI lives as overlays on top of the map
- Travel starts small, not as a second full army game

Current implementation:
- Main left column is hidden on the travel tab
- Travel map is a full background stage
- Left overlay has party planning and travel upgrades
- Bottom overlay has expedition controls
- Map supports mouse drag / panning
- Travel party cap starts at 10 and scales with travel upgrades

Open design decisions:
- What a travel node actually is
- Whether missions are route-based, node-based, or both
- How war on the map differs from the main combat screen
- How settlement conquest and new settlement building should work

Next implementation target:
- Add settlement nodes with ownership, garrison, and regeneration

## Feature Buckets

Use these buckets when deciding what to touch.

### Now

These are safe to work on immediately.

| Feature | Why It Matters | Target |
| --- | --- | --- |
| Travel settlement system | Unlocks the new travel identity | Add nodes, garrison values, and mission hooks |
| Economy tuning | Keeps early/midgame from drifting | Set target timings for major unlocks |
| Building cleanup | Reduces confusion and overlap | Finalize category purpose and remove redundancy |
| Innovation cleanup | Makes progression readable | Define cleaner tier gates |
| UX clarity | Helps new players understand systems | Improve blocked states and panel clarity |

### Soon

These should wait until current core systems are more stable.

| Feature | Why It Matters | Target |
| --- | --- | --- |
| Commander system | Strong long-term military identity | Add after travel war model stabilizes |
| Conquest bonuses | Gives map control meaning | Add after settlement ownership exists |
| New settlement building | Expands strategy and cycle growth | Add after travel routes and supply exist |
| Rune / remnant meta | Gives prestige a real reason to exist | Add after one full cycle is coherent |

### Later

These are valuable, but not yet the right use of time.

| Feature | Why It Matters | Target |
| --- | --- | --- |
| Advanced commander roster | Late-game depth | Wait for campaign layer |
| Procedural map generation | Visual and systemic replayability | Wait until node model is stable |
| Art/content expansion | Important for presentation | Add after system roles are locked |
| Offline progress | Needed for release quality | Add after core sim is stable |

## Travel Breakdown

This is the concrete breakdown for the current travel work.

| Subsystem | Status | Notes |
| --- | --- | --- |
| Travel layout | Done for prototype | Dedicated overlay layout is in place |
| Map drag | Done for prototype | Mouse panning works |
| Travel upgrades | Partial | Longboats and Ice Sleds affect party size / speed |
| Expedition launch | Partial | Scout / raid / embers buttons exist |
| Settlement nodes | Not started | Needed next |
| Node ownership | Not started | Needed for conquest |
| Garrison regen | Not started | Needed to make war distinct |
| War missions | Not started | Should not copy main lane combat |
| New settlement creation | Not started | Long-term travel objective |
| Procedural generation | Not started | Do after node rules exist |

## Working Rules

These rules should guide what we build next.

- Do not add more content branches until the current branch is readable
- Each tab needs its own identity, not reused mechanics with different labels
- Travel must become a strategic/campaign layer, not just another combat wrapper
- Prestige should change rules and bottlenecks, not just add flat multipliers
- New systems should be added only when their UI home is clear

## Current Recommendation

If jumping back in without context, work in this order:

1. Travel settlement nodes
2. Travel mission types and outcomes
3. Economy and pacing retune
4. Innovation tier cleanup
5. Prestige / rune structure

## Session Notes

Use this section to keep one-line notes during work sessions.

- Travel was being reworked from expedition buttons into a settlement/map system
- Travel party size was intentionally capped low early to keep it distinct from warcamp
- Main goal is to stop feature work from becoming unfocused and disconnected
