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
    this.side = x <= 400 ? "left" : "right";
    this.axis = new Phaser.Math.Vector2();
    this.speed = 100;
    this.setScale(2);
    this.setSize(8,21).setOffset(12,5);
    this.orb1 = null;
    this.orb2 = null;
    this.setCollideWorldBounds(true);
    this.charging = false;
    // this.tint = Math.random() * 0xffffff;
    this.arrow = scene.add.sprite(this.x, this.y, 'arrow').setVisible(false).setOrigin(-0.5,0.5);
    this.currentHp = 20;
    this.maxHp = 20;
    this.hpGui = scene.add.text(this.x, this.y-this.height/4,`${this.currentHp}/${this.maxHp}`).setOrigin(0.5,0.5);
    this.status = "none";
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
      CHANGE: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q),
      INTERACT: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E)
    }

    scene.input.on('pointerdown', function(pointer){
      if(self.orb1){
        self.charging = true;
        self.arrow.visible = true;
      }
    });
    scene.input.on('pointermove', function(pointer){
      if(self.orb1 && self.charging){
        this.angle = Phaser.Math.Angle.Between(self.x,self.y,pointer.x,pointer.y);
        self.flipX = this.angle > -1 && this.angle < 1 ? false: true;
        self.arrow.rotation = this.angle;
      }
    });
    scene.input.on('pointerup', function(pointer){
      if(self.orb1 && self.charging){

          self.orb1.throwOrb(scene,pointer);
          // self.orb1.update(scene);
          self.orb1 = null;
          self.charging = false;
          self.arrow.visible = false;
          if(self.orb2){
            self.orb1 = self.orb2;
            self.orb1.x = 0;
            self.orb2 = null;
          }
        }
      });
      if(self.orb1){console.log("orb1: ",self.orb1.type," : ",self.orb1.level);}
      if(self.orb2){console.log("orb2: ",self.orb2.type," : ",self.orb2.level);}

    // this.walkSound = this.sound.add('step');
    this.walkSound = scene.sound.add(CST.AUDIO.STEP);

    scene.pickupSound = scene.sound.add(CST.AUDIO.PICKUP);

    scene.hitFireSound = scene.sound.add(CST.AUDIO.HIT_FIRE);
    scene.hitWaterSound = scene.sound.add(CST.AUDIO.HIT_WATER);
    scene.hitGrassSound = scene.sound.add(CST.AUDIO.HIT_GRASS);

    scene.physics.add.overlap(scene.allOrbs,this,function(mage, orb){
      if(!mage.orb1){
        scene.pickupSound.play({volume:.5});
        //console.log(Math.round(orb.frame.name/9))
        mage.orb1 = new Orb(scene, mage.x, mage.y, orb.texture.key, Math.round(orb.frame.name/18), orb.id, orb.level);
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
        mage.orb2 = new Orb(scene, mage.x, mage.y, orb.texture.key, Math.round(orb.frame.name/18), orb.id, orb.level);

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

/*
    scene.physics.add.overlap(this,scene.enemyProjectiles,function(mage, projectile){
      console.log("ouchie got hit")
      mage.isHit(scene,mage,projectile);
      // this.socket.emit('projectileDestroy',projectile.id);
      projectile.destroy();
      //
      //         mage.currentHp --;
      // if(projectile.type == "fire"){
      //   let burn = scene.time.addEvent({
      //     delay: ﻿800,
      //     callback: function(){
      //         mage.currentHp--;
      //         mage.updateHpValue();
      //     },
      //     repeat: (projectile.level - 1)});﻿﻿﻿
      // }
      // else if(projectile.type == "water"){
      //   mage.speed -= 70;
      //   setTimeout(function(){
      //   mage.speed = 120;
      //   }, projectile.level * 1000);
      // }
      // else if(projectile.type == "grass"){
      //   scene.socket.emit('hpDrain', projectile.level);
      // }
      // mage.updateHpValue();
    }, null, scene);//player-projectile overlap
//*/

    scene.physics.add.overlap(this,scene.bases,function(mage, base){
      if(Phaser.Input.Keyboard.JustDown(mage.keys.INTERACT) && mage.orb1 && !mage.charging){
        let temp = base.orb;
        base.orb = mage.orb1;
        base.orb.x = base.x;
        base.orb.y = base.y;

        if(temp){
          mage.orb1 = temp;
        }
        else if(!temp && mage.orb2){
          mage.orb1 = mage.orb2;
          mage.orb2 = null;
        }
        else if(!temp && !mage.orb2){
          mage.orb1 = null;
        }

        this.socket.emit('baseInteract',base.baseId);
        // console.log("base:",base.orb,"mage orb1",mage.orb1)
      }
    }, null, scene);//base overlap

    scene.physics.add.overlap(scene.enemyMages,scene.ownProjectiles,function(enemy, projectile){
      scene.socket.emit('playerHit', {projectileId: projectile.id,playerId: enemy.playerId});
      projectile.destroy();
    }, null, scene);//enemy-ownprojectile overlap

    scene.physics.add.collider(this, scene.walls);
  }

  isHit(scene,mage,projectile){
    mage.currentHp --;
    if(projectile.type == "fire"){
      scene.hitFireSound.play();
      let burn = scene.time.addEvent({
        delay: ﻿800,
        callback: function(){
            mage.currentHp--;
            mage.updateHpValue();
        },
        repeat: (projectile.level - 1)});﻿﻿﻿
    }
    else if(projectile.type == "water"){
      scene.hitWaterSound.play();
      mage.speed -= 70;
      setTimeout(function(){
      mage.speed = 100;
      }, projectile.level * 1000);
    }
    else if(projectile.type == "grass"){
      scene.hitGrassSound.play();
      scene.socket.emit('hpDrain', projectile.level);
    }
    mage.updateHpValue();
  }

  update(scene){
    let up = this.keys.UP.isDown;
    let down = this.keys.DOWN.isDown;
    let left = this.keys.LEFT.isDown;
    let right = this.keys.RIGHT.isDown;

    if(Phaser.Input.Keyboard.JustDown(this.keys.CHANGE)&&!this.charging){
      var temp = this.orb1;
      this.orb1 = this.orb2;
      this.orb2 = temp;
      this.socket.emit('orbSwap');
    }

    if(this.charging){
      this.orb1.speed = Math.min(this.orb1.speed+5,this.orb1.maxSpeed);
      //this.orb1.speed = Math.min(this.orb1.speed+1,this.orb1.maxSpeed);
      this.arrow.scaleX = Math.min(this.orb1.speed/300,this.orb1.maxSpeed/300);
      this.arrow.color = this.orb1.speed < this.orb1.maxSpeed - 100 ?  0xffffff :
                        this.orb1.speed < this.orb1.maxSpeed - 10 ? 0xffff00 : 0xff0000;

      // NOTE: tint aint displaying anything in log idk why
      this.arrow.tint = this.arrow.color;
      // console.log(this.orb1.speed)
    }

      if(this.orb1){

        scene.tweens.add({
          targets     : [ this.orb1 ],
          scaleX: 1.2,
          scaleY: 1.2,
          ease        : 'Linear',
          duration    : 100,

        });



        if(this.charging){
          this.orb1.x = !this.flipX ?  this.x - 10 :
                        this.flipX ?  this.x + 10 :
                        this.orb1.x;
        }
        else{
          this.orb1.x = !this.flipX ?  this.x + 10 :
                        this.flipX ?  this.x - 10 :
                        this.orb1.x;
        }

        this.orb1.y  =  this.y;
        this.arrow.x = this.orb1.x;
        //this.arrow.setOrigin(-0.8, 0.8);
        this.arrow.y = this.orb1.y;
      }

      if(this.orb2 != null){
        scene.tweens.add({
          targets     : [ this.orb2 ],
          scaleX      : 0.70,
          scaleY      : 0.70,
          ease        : 'Linear',
          duration    : 100,
        })

        scene.tweens.add({
          targets     : [ this.orb2 ],
          y           : this.y - 10,
          ease        : 'Linear',
          duration    : 300

        });

        scene.tweens.add({
          targets     : [ this.orb2 ],
          x           : this.flipX ? this.x - 10 :
                        !this.flipX ?  this.x + 10 :
                        this.orb2.x,
          ease        : 'Linear',
          duration    : 500
        })
      }

    this.axis.x = right - left;
    this.axis.y = down - up;



    let axis = this.axis.normalize();

    this.setVelocityX(this.speed * axis.x);
    this.setVelocityY(this.speed * axis.y);

    var position = {
      x: this.x,
      y: this.y,
      flipX: this.flipX,
      orb1: this.orb1,
      orb2: this.orb2,
      arrow: {
        visible: this.arrow.visible,
        x: this.arrow.x,
        y: this.arrow.y,
        rotation: this.arrow.rotation,
        scaleX: this.arrow.scaleX,
        color: this.arrow.color
      },
      hp_x: this.hpGui.x,
      hp_y: this.hpGui.y
    };

    if (this.axis.x == 0 && this.axis.y == 0) {
      this.anims.play('idle', true);
      this.socket.emit('playerStop', position);
    }
    else {
      this.anims.play('walk', true);
      this.socket.emit('playerMovement', position);
      if(!this.charging){
      this.flipX = this.axis.x < 0 ? true :
                   this.axis.x > 0 ? false :
                   this.flipX;
      }
      if(!this.walkSound.isPlaying){
        this.walkSound.play({delay:.1});
      }
    }

    this.hpGui.x = this.x;
    this.hpGui.y = this.y-this.height;
  }//update

  updateHpValue(){
    this.hpGui.setText(`${this.currentHp}/${this.maxHp}`);
    let hp = {
      current: this.currentHp,
      max: this.maxHp
    };
    if(this.currentHp <= 0){
      this.speed = 0;
      setTimeout(this.respawn.bind(null,this),5000);
    }
    this.socket.emit('hpUpdate', hp);
  }

  respawn(mage){
    if(mage.side == "left"){
      mage.x = Math.max(Math.floor(Math.random() * 375),16);
    }
    else{
      mage.x = Math.max(Math.floor(Math.random() * 400) + 400,425);
    }
    mage.y = Math.floor(Math.random() * 500) + 50;
    mage.speed = 100;
    mage.currentHp = 20;
    mage.updateHpValue();
  }

}
