import { CST } from "../CST.js";
export class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture){
    super(scene, x, y, texture)
    scene.sys.updateList.add(this);
    scene.sys.displayList.add(this);
    scene.physics.world.enableBody(this, 0);
    this.socket = scene.socket;

    this.init(x, y);
    this.preload(scene);
    this.create(scene,texture);
  }

  init(x, y){
    this.x = x;
    this.y = y;
    this.axis = new Phaser.Math.Vector2();
    this.speed = 80;
    this.setScale(2);
    this.setSize(8,14).setOffset(12,10);
  }

  preload(scene){

  }

  create(scene, texture){
    //<editor-fold> animations
    scene.anims.create({
        key: "idle",
        frames: scene.anims.generateFrameNumbers(texture, {
            start: 0,
            end: 3
        }),
        frameRate: 8,
        repeat: -1
    });

    scene.anims.create({
        key: "walk",
        frames: scene.anims.generateFrameNumbers(texture, {
            start: 4,
            end: 9
        }),
        frameRate: 10,
        repeat: -1
    });
    //</editor-fold> animations

    this.keys = {
      UP: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      DOWN: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      LEFT: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      RIGHT: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
    }

    this.walkSound = scene.sound.add(CST.AUDIO.STEP);
  }

  update(){
    let up = this.keys.UP.isDown;
    let down = this.keys.DOWN.isDown;
    let left = this.keys.LEFT.isDown;
    let right = this.keys.RIGHT.isDown;

    this.axis.x = right - left;
    this.axis.y = down - up;

    this.flipX = this.axis.x > 0 ? false :
                 this.axis.x < 0 ? true :
                 this.flipX;
    let axis = this.axis.normalize();

    this.setVelocityX(this.speed * axis.x);
    this.setVelocityY(this.speed * axis.y);

    if (this.axis.x == 0 && this.axis.y == 0) {
      this.anims.play('idle', true);
      this.socket.emit('playerStop', this);
    }
    else {
      this.anims.play('walk', true);
      this.socket.emit('playerMovement', this);
      if(!this.walkSound.isPlaying){
        this.walkSound.play({delay:.1});
      }
    }
  }

  sockets(){

  }
}
