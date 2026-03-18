# Regional Map Hubs

This file defines a first larger regional map structure built around major settlement hubs and local POI clusters.

The goal is:

- give the larger map a readable social and political structure
- avoid a flat spread of disconnected POIs
- create meaningful travel routes, side routes, and contested overlaps

## Hub Model

Each major hub should act as a local center of:

- settlement life
- faith presence
- diplomacy
- danger
- nearby POI density

Each hub should later have:

- 3 to 5 nearby POIs
- 1 to 2 farther satellite POIs
- direct connections to 2 or 3 major routes
- indirect paths into neighboring hub territory

## First Regional Layout

Recommended first layout:

- `1` player home settlement
- `5` major outside hubs

This gives six major centers total.

### Overall Shape

- player home settlement at the southern coast
- one western human hub
- one northern human or dwarven hub
- one eastern ash or frontier hub
- one southeastern coastal hub
- one central interior pressure hub

This creates:

- a southern home anchor
- inland push
- eastern and western route choices
- a central contested region

## Hub List

### 1. Home Settlement

- people: player humans
- role: home anchor, tutorial region, safe return point
- faith lean: broad human mix
- tone: familiar, low-pressure compared to the outer region

Nearby POIs:

- Broken Watchtower
- Animal Den
- Bandit Camp
- abandoned store shed

Function:

- teaches the map
- anchors early routes
- remains politically important later

### 2. Coast Clan Harbor

- people: humans, Coast Clans
- role: trade, boats, coastal movement, uncertain loyalty
- faith lean: Tide-Walker, Storm-Father, Hearth-Mother
- tone: useful but suspicious

Nearby POIs:

- wreck site
- tide cave
- fish camp
- smuggler cache
- beacon hill

Function:

- first travel-oriented external settlement
- source of coastal contracts, rumors, and barter

### 3. Holdfolk Timber Village

- people: humans, Holdfolk
- role: wood, hunting, inland supply
- faith lean: Hearth-Mother, Green Hand, Forge-Warden
- tone: practical, local, cautious

Nearby POIs:

- logging camp
- hunter lean-to
- wolf den
- old shrine
- blocked trail

Function:

- links the map to inland work, food, and forest routes

### 4. Ashbound Rite Hold

- people: humans, Ashbound
- role: dark human pressure hub, rites, fear politics
- faith lean: Ash Veil, Night Lantern, harsher Storm-Father rites
- tone: severe, unsettling, politically dangerous

Nearby POIs:

- ash pit
- blackened shrine
- grave circle
- torch line
- abandoned hamlet

Function:

- dark human antagonist pressure
- religious conflict center
- source of ash-themed systems and later rites content

### 5. Dwarven Hill Keep

- people: dwarves
- role: stone, defense, trade leverage
- faith lean: forge, oath, ancestry, stone
- tone: stable, hard, slow to trust

Nearby POIs:

- quarry cut
- old wall
- gate shrine
- collapsed tunnel
- ore slope

Function:

- hard stronghold
- route control
- stone and craft influence

### 6. Orc Frontier Fort

- people: orcs
- role: military pressure, raids, border dominance
- faith lean: war, storm, hunger, conquest
- tone: threatening, direct, expansionist

Nearby POIs:

- raider trail
- trophy poles
- beast pen
- burned farm
- siege stockpile

Function:

- strongest direct military threat in the first large region
- future war and party-combat pressure point

## Route Structure

The larger map should use two route layers:

- `main paths`
- `indirect paths`

### Main Paths

Main paths connect major hubs to each other.

Rules:

- every hub should connect to at least 2 others
- the home settlement should connect to 2 nearby hubs first
- the orc fort and Ashbound hold should pressure central routes

Main paths should feel:

- readable
- useful
- safer than wilderness

### Indirect Paths

Indirect paths connect:

- local POIs to main paths
- neighboring hub spheres
- hidden shortcuts across regions

These should feel:

- less safe
- less obvious
- more rewarding if the player learns them

## Overlap Zones

The regional map should not isolate each hub completely.

Hub influence zones should overlap. These overlaps create:

- contested land
- mixed POIs
- diplomacy tension
- raids
- shared routes under pressure

Important overlap examples:

- Home Settlement <-> Holdfolk Timber Village
  - shared hunting and timber space

- Home Settlement <-> Coast Clan Harbor
  - shared coast movement and trade

- Holdfolk Timber Village <-> Dwarven Hill Keep
  - shared labor, stone, and route bargaining

- Ashbound Rite Hold <-> Orc Frontier Fort
  - strongest high-pressure overlap

- Ashbound Rite Hold <-> Dwarven Hill Keep
  - faith and territorial tension

## First Regional Travel Arc

The first larger region should let the player progress like this:

1. explore outward from home settlement
2. meet nearby human settlements first
3. learn route logic and local POI clustering
4. encounter darker human politics
5. reach harder frontier powers like dwarves and orcs

This gives the map a social ramp instead of only a combat ramp.

## Implementation Use

When this moves toward implementation, define the map in this order:

1. place major hubs
2. define hub influence circles
3. define main paths
4. add indirect paths
5. place local POI clusters around each hub
6. place shared overlap POIs between hubs

Do not start with random terrain first.

The map should be socially structured before it is visually detailed.
