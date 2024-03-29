# mage-game
mage game with balls

### Changelog: 

```
2019-08-19 8:53PM PHT
-rough player respawn
```

```
2019-08-19 4:13PM PHT
-switched orbs to elements
-added projectile collisions
-added some orb-player collision sfx
-added bases (w/ placeholder sprite)
-bases orb set with sync
-base-projectile collision + hp system with sync
-added middle wall placeholder sprite
```

```
2019-08-17 2:43AM PHT
- fixed a couple of bugs regarding throwing, charging, swapping and player-projectile collision
- added a little hp system for the players (also synced) > still has a bug with the text creation
```

```
2019-08-16 5:01PM PHT
- added orb throw indicator
- fixed orb spawning inside divider
```

```
2019-08-15 5:40PM PHT
- added orb switching
- added side divider
- spawns players on alternate side (not yet perfect, I guess)
- orb spawn limit per-side
```

```
2019-08-14 7:09PM PHT
- synced secondary pickup and position
- synced primary and secondary orb stacking
- synced orb throwing (projectile & replacing primary w/ secondary)
- synced orb-orb collision
- synced projectile-player collision
```

```
2019-08-13 10:36PM PHT
- converted most stuff to OOP
- orb-player collision: pickup
  - primary & secondary orb pickup
  - orb stacking
- orb-player collision: getting hit by orb projectile placeholder effect
- orb-orb collision: stacking and destruction
- socket events for everything mentioned above (TO-DO)
- orb carry display (to-do)
```

```
2019-08-10 1:35AM PHT
- orb throwing synced
```

```
2019-08-08 6:57PM PHT
- orb grabbing/carry, synced with other clients as well
- orb throwing (syncing to-do)
- placeholder sounds for walking and orb throwing
```

```
2019-08-08 3:44AM PHT
- basic socket connection and player creation for clients and server
- added basic movements for client-side
```
### Setting up:
- install node js
- on the project root, install **socket.io** and **express**
- commands:
```
npm init -f
npm install --save express
npm install --save socket.io
```
- If this is unclear, refer to the instructions in [this tutorial](https://gamedevacademy.org/create-a-basic-multiplayer-game-in-phaser-3-with-socket-io-part-1/)
