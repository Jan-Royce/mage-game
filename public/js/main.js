import {GameScene} from './scenes/game.js';

let game = new Phaser.Game({
  width: 800,
  height: 600,
  backgroundColor: 0x000000,
  physics: {
      default: 'arcade',
      arcade: {
          debug: true,
          gravity: { y: 0 }
      }
  },
  scene: [GameScene],
  render:{
    pixelArt: true,
  },
});
