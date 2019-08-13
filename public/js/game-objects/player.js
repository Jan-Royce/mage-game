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
    this.orb1 = null;
    this.orb2 = null;
    this.setCollideWorldBounds(true);
    // this.tint = Math.random() * 0xffffff;
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

    // this.walkSound = this.sound.add('step');
    this.walkSound = scene.sound.add(CST.AUDIO.STEP);

    scene.pickupSound = scene.sound.add(CST.AUDIO.PICKUP);

    scene.physics.add.overlap(scene.allOrbs,this,function(mage, orb){
      if(!orb.fired){//not fired
        if(!mage.orb1){
          scene.pickupSound.play({volume:.5});
          mage.orb1 = orb;
          // orb.destroy();
          orb.body.enable = false;
          orb.setActive(false).setVisible(false);
          // console.log(orb)
          let orbProp = {
            id: orb.id,
            frameIndex: orb.frameIndex
          };
          this.socket.emit('orbCollect',orbProp);//change to different events
        }
        else if(mage.orb1.level < 3 && mage.orb1.type == orb.type){
          scene.pickupSound.play({volume:.5});
          mage.orb1.level = Math.min(mage.orb1.level+orb.level,3);
          orb.destroy();
          // this.socket.emit('orbCollect',orbProp);//change to different events
        }
        else if(!mage.orb2){
          scene.pickupSound.play({volume:.5});
          mage.orb2 = orb;
          // orb.destroy();
          orb.body.enable = false;
          orb.setActive(false).setVisible(false);
          let orbProp = {
            id: orb.id,
            frameIndex: orb.frameIndex
          };
          this.socket.emit('orbCollect',orbProp);//change to different events
        }
        else if(mage.orb2.level < 3 && mage.orb2.type == orb.type){
          scene.pickupSound.play({volume:.5});
          mage.orb2.level = Math.min(mage.orb2.level+orb.level,3);
          orb.destroy();
          // this.socket.emit('orbCollect',orbProp);//change to different events
        }
        if(mage.orb1){console.log("orb1: ",mage.orb1.id,mage.orb1.type," : ",mage.orb1.level);}
        if(mage.orb2){console.log("orb2: ",mage.orb2.id,mage.orb2.type," : ",mage.orb2.level);}
      }//not fired
      else{//fired
        //orb effect on player that's hit
        //temp lol
        mage.scaleX -= mage.scaleX/128;
        mage.scaleY -= mage.scaleY/128;
      }
    }, null, scene);//player-orb overlap
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
