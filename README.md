# magic-bottle

Jame gam.

## To do:

### story:

- the player character is a bottle.
- all of her friends (a book, a broom, etc.) have found a magic talent, but she still doesn't have one :(
- so she sets out on a quest to go from her home village to the Grand Magician who can answer any question.
- along the way, she has to overcome several environmental obstacles which involve fighting hostile creatures

### gameplay:

- 2D action RPG
- the player's attacks are timing based and melee
- the enemies' attacks are precisely timed projectiles (bullet hell)
- there are breakable obstacles strewn about which can absorb attacks
- the player's health is represented by how full the bottle is?

### timeline:

friday is "engine day," we nail down

- [x] character movement
- [ ] physics
  - [x] (enemy|player|crate) vs. projectile
  - [ ] (enemy|player|crate) vs. environment
- [ ] environment
- [x] basic enemy AI
- [x] most enemy AI will be bespoke to that enemy

  then on saturday we work on the quests
  each level is a discrete quest?

  ### an example quest:

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
