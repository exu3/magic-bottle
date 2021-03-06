# magic-bottle

Jame gam.

## Story:

- The player character is a Bottle.
- All of her friends (a book, a broom, etc.) have found a magic talent, but she still doesn't have one :(
- She sets out on a quest to go from her home village to the Grand Magician who guards himself with lots of Eyeballs.
- Along the way, she has to overcome several environmental obstacles which involve fighting the hostile creatures known as 👁️👁️👁️👁️.

### Gameplay:

- 2D action RPG
- the player's attacks are timing based and melee
- the enemies' attacks are precisely timed projectiles (bullet hell)
- there are breakable obstacles strewn about which can absorb attacks
- the player's health is represented by how full the bottle is?

## Timeline:

Friday is "engine day," we nail down:

- [x] character movement
- [ ] physics
  - [x] (enemy|player|crate) vs. projectile
  - [ ] (enemy|player|crate) vs. environment
- [ ] environment
- [x] basic enemy AI
- [x] most enemy AI will be bespoke to that enemy

  Then on saturday we work on the quests. Each level is a discrete quest?

  ## An example quest:

  - [x] player stumbles into a circular area lined with monsters hiding behind statues
  - [x] they peek out from behind the statues and shoot projectiles at the player
  - [x] the statues are destructible
  - [x] they fight each monster, two doors open on the outskirts of the area
  - [x] one door leads to a room with one enemy
  - [x] this enemy has smaller versions of itself revolving around it
  - [x] these smaller versions take hits for it, but the enemy itself has very little health
  - [x] if you can time your attacks properly to hit the big enemy, you can defeat it faster and are less likely to reach zero health before it kills you
  - [x] when it dies, it drops a key
  - [x] the second is just a locked door leading to the next level you need the key to open
  - [ ] in this room, as a red herring, there is also an invincible statue that shoots at you whenever you are nearby

## Ideas:

- enemies that explode into a dozen lasers and chase you being led into a pool of enemies that shoot lasers but can't hurt each other
- a level that starts with one enemy shooting at you in a cramped room, but the walls are actually destructible and as the bullets you dodge break down the walls, you discover more adjacent rooms (edited)
- a level like this except there are two, non-reflective blocks to push and a lever that spawns an enemy that chases you. you have to use the blocks to trap the enemy that chases you next to the opening, then push it into the tunnel with the eyeballs
