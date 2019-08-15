import { CST } from "../CST.js";
import { Orb } from "./orb.js";

export class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture){
    super(scene, x, y, texture)
    scene.sys.updateList.add(this);
    scene.sys.displayList.add(this);
    scene.physics.world.enableBody(this, 0);
    this.socket = scene.socket;

    this.init(scene, x, y);
    this.preload(scene);
    this.create(scene,texture);
  }

  init(scene, x, y){
    this.x = x;
    this.y = y;
    this.axis = new Phaser.Math.Vector2();
    this.speed = 120;
    this.setScale(2);
    this.setSize(8,21).setOffset(12,5);
    this.orb1 = null;
    this.orb2 = null;
    this.setCollideWorldBounds(true);
    // this.tint = Math.random() * 0xffffff;
  }

  preload(scene){

  }

  create(scene, texture){
    var self = this;
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
      RIGHT: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      CHANGE: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q)
    }

    scene.input.on('pointerup', function(pointer){
      if(self.orb1 && self.orb1.scaleX >= 1.19){
          self.orb1.throwOrb(scene,pointer);
          self.orb1.update(scene);
          self.orb1 = null;
          if(self.orb2){
            self.orb1 = self.orb2;
            self.orb1.x = 0;
            self.orb2 = null;
            self.socket.emit('primaryThrow');
          }
        }
      });
      if(self.orb1){console.log("orb1: ",self.orb1.type," : ",self.orb1.level);}
      if(self.orb2){console.log("orb2: ",self.orb2.type," : ",self.orb2.level);}

    // this.walkSound = this.sound.add('step');
    this.walkSound = scene.sound.add(CST.AUDIO.STEP);

    scene.pickupSound = scene.sound.add(CST.AUDIO.PICKUP);

    scene.physics.add.overlap(scene.allOrbs,this,function(mage, orb){
      if(!mage.orb1){
        scene.pickupSound.play({volume:.5});
        console.log(Math.round(orb.frame.name/9))
        mage.orb1 = new Orb(scene, mage.x, mage.y, orb.texture.key, Math.round(orb.frame.name/9), orb.id, orb.level);
        orb.destroy();
        //orb.body.enable = false;
        //orb.setActive(false).setVisible(false);
        // console.log(orb)
        let orbProp = {
          id: orb.id,
          frameIndex: orb.frameIndex,
          type: orb.type
        };
        this.socket.emit('orbGetPrimary',orbProp);
      }
      else if(mage.orb1.level < 3 && mage.orb1.type == orb.type){
        scene.pickupSound.play({volume:.5});
        // mage.orb1.level = Math.min(mage.orb1.level+orb.level,3);
        mage.orb1.changeOrbLevel(Math.min(mage.orb1.level+orb.level,3));
        orb.destroy();
        let orbProp = {
          id: mage.orb1.id,
          stack: orb.id,
          frameIndex: mage.orb1.frameIndex,
          type: mage.orb1.type,
          level: mage.orb1.level
        };
        this.socket.emit('orbStackPrimary',orbProp);
      }
      else if(!mage.orb2){
        scene.pickupSound.play({volume:.5});
        mage.orb2 = new Orb(scene, mage.x, mage.y, orb.texture.key, Math.round(orb.frame.name/9), orb.id, orb.level);

        orb.destroy();
        //orb.body.enable = false;
        //orb.setActive(false).setVisible(false);
        let orbProp = {
          id: orb.id,
          frameIndex: orb.frameIndex
        };
        this.socket.emit('orbGetSecondary',orbProp);
      }
      else if(mage.orb2.level < 3 && mage.orb2.type == orb.type){
        scene.pickupSound.play({volume:.5});
        // mage.orb2.level = Math.min(mage.orb2.level+orb.level,3);
        mage.orb2.changeOrbLevel(Math.min(mage.orb2.level+orb.level,3));
        orb.destroy();
        let orbProp = {
          id: mage.orb2.id,
          stack: orb.id,
          frameIndex: mage.orb2.frameIndex,
          type: mage.orb2.type,
          level: mage.orb2.level
        };
        this.socket.emit('orbStackSecondary',orbProp);
      }
      if(mage.orb1){console.log("orb1: ",mage.orb1.id,mage.orb1.type," : ",mage.orb1.level);}
      if(mage.orb2){console.log("orb2: ",mage.orb2.id,mage.orb2.type," : ",mage.orb2.level);}
    }, null, scene);//player-orb overlap

    scene.physics.add.overlap(this,scene.enemyProjectiles,function(mage, projectile){
      // console.log(projectile)
      //orb effect on player that's hit
      //temp lol
      // mage.scaleX -= mage.scaleX/96;
      // mage.scaleY -= mage.scaleY/96;
      mage.tint = Math.random() * 0xffffff;
      this.socket.emit('projectileDestroy',projectile.id);
      projectile.destroy();
    }, null, scene);//player-projectile overlap

    scene.physics.add.collider(this, scene.walls);
  }

  update(scene){
    let up = this.keys.UP.isDown;
    let down = this.keys.DOWN.isDown;
    let left = this.keys.LEFT.isDown;
    let right = this.keys.RIGHT.isDown;

    if(Phaser.Input.Keyboard.JustDown(this.keys.CHANGE)){
      var temp = this.orb1;
      this.orb1 = this.orb2;
      this.orb2 = temp;
      this.socket.emit('orbSwap');
    }

      if(this.orb1){

        scene.tweens.add({
          targets     : [ this.orb1 ],
          scaleX: 1.2,
          scaleY: 1.2,
          ease        : 'Linear',
          duration    : 300,

        });

        this.orb1.x = this.flipX ?  this.x + 10 :
                      !this.flipX ?  this.x - 10 :
                      this.orb1.x;
        this.orb1.y = this.y;
      }

      if(this.orb2 != null){
        scene.tweens.add({
          targets     : [ this.orb2 ],
          scaleX      : 0.70,
          scaleY      : 0.70,
          ease        : 'Linear',
        })

        scene.tweens.add({
          targets     : [ this.orb2 ],
          y           : this.y - 10,
          ease        : 'Linear',
          duration    : 300

        });

        scene.tweens.add({
          targets     : [ this.orb2 ],
          x           : !this.flipX ? this.x - 10 :
                        this.flipX ?  this.x + 10 :
                        this.orb2.x,
          ease        : 'Linear',
          duration    : 500
        })
      }



    this.axis.x = right - left;
    this.axis.y = down - up;

    this.flipX = this.axis.x > 0 ? false :
                 this.axis.x < 0 ? true :
                 this.flipX;

    let axis = this.axis.normalize();

    this.setVelocityX(this.speed * axis.x);
    this.setVelocityY(this.speed * axis.y);
    var position = {
      x: this.x,
      y: this.y,
      flipX: this.flipX,
      orb2: this.orb2
    };

    if (this.axis.x == 0 && this.axis.y == 0) {
      this.anims.play('idle', true);
      this.socket.emit('playerStop', position);
    }
    else {
      this.anims.play('walk', true);
      this.socket.emit('playerMovement', position);
      if(!this.walkSound.isPlaying){
        this.walkSound.play({delay:.1});
      }
    }
  }



  sockets(){

  }
}
