
import { CST } from "../CST.js";
import { Player } from "../game-objects/player.js";
import { Orb } from "../game-objects/orb.js";


/*
import { Player } from "player.js"

class gameScene extends Phaser.Scene {

  constructor(){
    super('gameScene');
    this.player = {
        x: Math.floor(Math.random() * 700) + 50,
        y: Math.floor(Math.random() * 500) + 50,
        axis: new Phaser.Math.Vector2(),
        speed: 100
      };

  }

  sockets(){
    var self = this;
    this.socket = io();

    this.socket.
      on('currentPlayers', (players) => {
        Object.keys(players).forEach(
          (id) => {
          if (players[id].playerId === self.socket.id) {
            addPlayer(self, players[id]);
          }
        });
      });

      this.socket.
        on('otherPlayer', (players) => {
              addPlayer(self, players)
          });
  }
  // load game resources --------
  preload(){
    this.load.spritesheet("player", "assets/player.png", {
      frameWidth: 32,
      frameHeight: 32
    });

    this.load.spritesheet("orbs", "assets/orbs.png", {
      frameWidth: 17,
      frameHeight: 17
    });
  }

  // Add object to scene -------
  create(){

    this.sockets();
    this.cursors = this.input.keyboard.addKeys({
        up: Phaser.Input.Keyboard.KeyCodes.W,
        down: Phaser.Input.Keyboard.KeyCodes.S,
        left: Phaser.Input.Keyboard.KeyCodes.A,
        right: Phaser.Input.Keyboard.KeyCodes.D,
    });

  }
  // game loop
  update(){
    if(this.mage){
        this.mage.axis = new Phaser.Math.Vector2();
        this.mage.directions = {
          left : this.cursors.left.isDown ,
          right : this.cursors.right.isDown ,
          down : this.cursors.down.isDown ,
          up : this.cursors.up.isDown ,
        }

        this.mage.axis.x = this.mage.directions.right - this.mage.directions.left;
        this.mage.axis.y = this.mage.directions.down - this.mage.directions.up;
        let axis = this.mage.axis.normalize();

        this.mage.setVelocityX(this.player.speed * axis.x);
        this.mage.setVelocityY(this.player.speed * axis.y);
        this.mage.flipX = axis.x > 0 ? false:
                          axis.x < 0 ? true :
                          this.mage.flipX;

    }
  }
}

function addPlayer(self, playerInfo) {
  self.mage = self.physics.add.image(playerInfo.x, playerInfo.y, 'player')
}
//-----------------------
var sockets = {
//-----------------------

}
//-----------------------
var preload = {
//-----------------------
} //______________________


//-----------------------
var create = {
//-----------------------
  addDirectional: function (input, Up, Left, Down, Right) {
      return input.keyboard.addKeys({
        up: Phaser.Input.Keyboard.KeyCodes[Up],
        left: Phaser.Input.Keyboard.KeyCodes[Left],
        down: Phaser.Input.Keyboard.KeyCodes[Down],
        right: Phaser.Input.Keyboard.KeyCodes[Right]
      })
    },


 // Player -->

} //-----------------------


//-----------------------
var update = {
//----------------------
  setAxis:  function (playerAxis, playerDirection){
          playerAxis.x = playerDirection.right - playerDirection.left,
          playerAxis.y = playerDirection.down - playerDirection.up
    },

  setHorizontalFlip: function (player){
        return  player.axis.x < 0 ? true :
                player.axis.x > 0 ? false :
                player.flipX;
    }


} //-----------------------


//-----------------------
var helper = {
//-----------------------
  addAttributes:  function (baseObject, otherObject){
        for(var attribute in otherObject){
          if(otherObject.hasOwnProperty(attribute) && !baseObject[attribute]){
            baseObject[attribute] =  otherObject[attribute];
          }
        }
      }
}//-----------------------

// sockets
myGame.scenes.push(gameScene);
*/

export class GameScene extends Phaser.Scene{
  constructor(){
    super({
      key: CST.SCENES.GAME,
    })

  }

  init(){

  }


  preload(){
    loadAudio(this);
    loadSprites(this, {
      frameHeight: 32,
      frameWidth: 32
    });
    this.load.spritesheet("orbs", "../sprites/orbs.png", {
        frameWidth: 17,
        frameHeight: 17
    });
    this.load.image('arrow', '../sprites/arrow.png');
  }

  create(){
    var self = this;

    this.walls = this.physics.add.group();
    this.enemyMages = this.physics.add.group({
      primary: null,
    });
    this.allOrbs = this.physics.add.group();
    this.ownProjectiles = this.physics.add.group();
    this.enemyProjectiles = this.physics.add.group();
    this.sockets()

/*
    this.physics.add.overlap(this.ownProjectiles, this.enemyMages, (orb, enemy) =>{
       enemy.tint = Math.random() * 0xffffff;
       orb.destroyOrb();
    }, null, this);
//*/

    //<editor-fold> animations
    // this.anims.create({
    //     key: "idle",
    //     frames: this.anims.generateFrameNumbers("player", {
    //         start: 0,
    //         end: 3
    //     }),
    //     frameRate: 8,
    //     repeat: -1
    // });
    //
    // this.anims.create({
    //     key: "walk",
    //     frames: this.anims.generateFrameNumbers("player", {
    //         start: 4,
    //         end: 9
    //     }),
    //     frameRate: 10,
    //     repeat: -1
    // });

    this.anims.create({
        key: "rock1",
        frames: this.anims.generateFrameNumbers("orbs", {
            start: 0,
            end: 2
        }),
        frameRate: 5,
        repeat: -1
    });
    this.anims.create({
        key: "rock2",
        frames: this.anims.generateFrameNumbers("orbs", {
            start: 3,
            end: 5
        }),
        frameRate: 5,
        repeat: -1
    });
    this.anims.create({
        key: "rock3",
        frames: this.anims.generateFrameNumbers("orbs", {
            start: 6,
            end: 8
        }),
        frameRate: 5,
        repeat: -1
    });

    this.anims.create({
        key: "paper1",
        frames: this.anims.generateFrameNumbers("orbs", {
            start: 9,
            end: 11
        }),
        frameRate: 5,
        repeat: -1
    });
    this.anims.create({
        key: "paper2",
        frames: this.anims.generateFrameNumbers("orbs", {
            start: 12,
            end: 14
        }),
        frameRate: 5,
        repeat: -1
    });
    this.anims.create({
        key: "paper3",
        frames: this.anims.generateFrameNumbers("orbs", {
            start: 15,
            end: 17
        }),
        frameRate: 5,
        repeat: -1
    });

    this.anims.create({
        key: "scissors1",
        frames: this.anims.generateFrameNumbers("orbs", {
            start: 18,
            end: 20
        }),
        frameRate: 5,
        repeat: -1
    });
    this.anims.create({
        key: "scissors2",
        frames: this.anims.generateFrameNumbers("orbs", {
            start: 21,
            end: 23
        }),
        frameRate: 5,
        repeat: -1
    });
    this.anims.create({
        key: "scissors3",
        frames: this.anims.generateFrameNumbers("orbs", {
            start: 24,
            end: 26
        }),
        frameRate: 5,
        repeat: -1
    });
    //</editor-fold> animations

    let divider = this.walls.create(this.game.config.width/2, this.game.config.height/2).setImmovable(true);
    divider.scaleY = 20;
    divider.setVisible(false);
  }


  update(){
    if(this.mage){
      this.mage.update(this);

      this.ownProjectiles.getChildren().forEach((orb) =>{
        orb.update(this);
      });
    }
 }

 sockets(){
   this.socket = io();
   var self = this;
      this.socket.on('currentPlayers', (players) => {
         Object.keys(players).forEach( (id) => {
           if(players[id].playerId != self.socket.id){
               addOtherPlayers(self,players[id]);
               return;
           }
           self.mage = new Player(self, players[id].x, players[id].y, CST.SPRITE.PLAYER);
         })
      });

      this.socket.on('currentOrbs',
      function(orbs){
        Object.keys(orbs).forEach(
          function (id) {
            createOrb(self, orbs[id]);
          });
      });

      this.socket.on('newPlayer',function(playerInfo){
        addOtherPlayers(self,playerInfo);
      });

      this.socket.on('disconnect',function(playerId){
        self.enemyMages.getChildren().forEach(function(otherPlayer){
          if(playerId === otherPlayer.playerId){
            otherPlayer.destroy();
            otherPlayer.hpGui.destroy();
          }
        });
      });

      this.socket.on('newOrb',function(orb){
        createOrb(self, orb);
      });
      this.socket.on('orbGotPrimary',function(pickUp){
        self.allOrbs.getChildren().forEach(function(orb) {
          if (pickUp.orbId === orb.id) {
            self.enemyMages.getChildren().forEach(function (otherPlayer) {
             if (pickUp.playerId === otherPlayer.playerId) {
                otherPlayer.primary = new Orb(self, otherPlayer.x,otherPlayer.y,'orbs', Math.round(orb.frame.name/9),orb.id);
                otherPlayer.primary.setScale(1.2);
             }
            });
            orb.destroy();
          }
        });
      });
      this.socket.on('orbStackedPrimary',function(pickUp){
        self.allOrbs.getChildren().forEach(function(orb) {
          if (pickUp.stack === orb.id) {
            self.enemyMages.getChildren().forEach(function (otherPlayer) {
             if (pickUp.playerId === otherPlayer.playerId) {
                otherPlayer.primary.level = pickUp.level;
                otherPlayer.primary.anims.play(otherPlayer.primary.type+otherPlayer.primary.level, true);
             }
            });
            orb.destroy();
          }
        });
      });
      this.socket.on('orbGotSecondary',function(pickUp){
        self.allOrbs.getChildren().forEach(function(orb) {
          if (pickUp.orbId === orb.id) {
            self.enemyMages.getChildren().forEach(function (otherPlayer) {
             if (pickUp.playerId === otherPlayer.playerId) {
                otherPlayer.secondary = new Orb(self, otherPlayer.x,otherPlayer.y,'orbs', Math.round(orb.frame.name/9),orb.id);
             }
            });
            orb.destroy();
          }
        });
      });
      this.socket.on('orbStackedSecondary',function(pickUp){
        self.allOrbs.getChildren().forEach(function(orb) {
          if (pickUp.stack === orb.id) {
            self.enemyMages.getChildren().forEach(function (otherPlayer) {
             if (pickUp.playerId === otherPlayer.playerId) {
                otherPlayer.secondary.level = pickUp.level;
                otherPlayer.secondary.anims.play(otherPlayer.secondary.type+otherPlayer.secondary.level, true);
             }
            });
            orb.destroy();
          }
        });
      });
      this.socket.on('orbDestroyed',function(orbId){
        self.allOrbs.getChildren().forEach(function(orb) {
          if(orb.id == orbId){
            orb.destroy();
          }
        });
      });
      this.socket.on('orbLevelChanged',function(orbInfo){
        self.allOrbs.getChildren().forEach(function(orb) {
          if(orb.id == orbInfo.id){
            orb.level = orbInfo.level;
            orb.anims.play(orb.type+orb.level, true);
          }
        });
        self.enemyProjectiles.getChildren().forEach(function(orb) {
          if(orb.id == orbInfo.id){
            orb.level = orbInfo.level;
            orb.anims.play(orb.type+orb.level, true);
          }
        });
      });

      this.socket.on('projectileCreated',function(orbId){
        self.enemyMages.getChildren().forEach(function(otherPlayer){
          if(otherPlayer.primary && otherPlayer.primary.id==orbId){
            self.enemyProjectiles.add(otherPlayer.primary);
            otherPlayer.primary = null;
            if(otherPlayer.secondary)
            {
              otherPlayer.primary = otherPlayer.secondary;
              otherPlayer.primary.scaleX = 1.2;
              otherPlayer.primary.scaleY = 1.2;
              otherPlayer.secondary = null;
            }
            otherPlayer.arrow.visible = false;
          }
        });
      });
      this.socket.on('projectileMoved',function(projectileInfo){
        self.enemyProjectiles.getChildren().forEach(function(orbProjectile){
          if(orbProjectile.id == projectileInfo.id){
           // orbProjectile.setVelocity(projectileInfo.orbVelocity.x, projectileInfo.orbVelocity.y);
           orbProjectile.x = projectileInfo.x;
           orbProjectile.y = projectileInfo.y;
          }
        });
      });
      this.socket.on('projectileDestroyed',function(orbId){
        self.enemyProjectiles.getChildren().forEach(function(orbProjectile){
          if(orbProjectile.id == orbId){
            orbProjectile.destroy();
          }
        });
        self.ownProjectiles.getChildren().forEach(function(orbProjectile){
          if(orbProjectile.id == orbId){
            orbProjectile.destroy();
          }
        });
      });
      this.socket.on('orbSwapped', function(){
      self.enemyMages.getChildren().forEach(function(otherPlayer){
        let temp = otherPlayer.primary;
        otherPlayer.primary = otherPlayer.secondary;
        if(otherPlayer.primary){otherPlayer.primary.setScale(1.2);}
        otherPlayer.secondary = temp;
      });
    });

      this.socket.on('playerMoved', (playerInfo) => {
        self.enemyMages.getChildren().forEach(function(otherPlayer){
          if(playerInfo.playerId === otherPlayer.playerId){
            otherPlayer.setPosition(playerInfo.x,playerInfo.y);
            otherPlayer.flipX = playerInfo.flipX;
            otherPlayer.anims.play('walk', true);
            // console.log(playerInfo);
            updatePlayerOrb(self,playerInfo);

            if(playerInfo.arrow.visible){
              otherPlayer.arrow.visible = playerInfo.arrow.visible;
              otherPlayer.arrow.x = playerInfo.arrow.x;
              otherPlayer.arrow.y = playerInfo.arrow.y;
              otherPlayer.arrow.rotation = playerInfo.arrow.rotation;
              otherPlayer.arrow.scaleX = playerInfo.arrow.scaleX;
              otherPlayer.arrow.tint = playerInfo.arrow.color;
            }
            otherPlayer.hpGui.x = playerInfo.hp_x;
            otherPlayer.hpGui.y = playerInfo.hp_y;
          }
        });
      });
      this.socket.on('playerStopped', (playerInfo) => {
        self.enemyMages.getChildren().forEach(function(otherPlayer){
          if(playerInfo.playerId === otherPlayer.playerId){
            otherPlayer.setPosition(playerInfo.x,playerInfo.y);
            otherPlayer.flipX = playerInfo.flipX;
            otherPlayer.anims.play('idle', true);
            updatePlayerOrb(self,playerInfo);
            if(playerInfo.arrow.visible){
              otherPlayer.arrow.visible = playerInfo.arrow.visible;
              otherPlayer.arrow.x = playerInfo.arrow.x;
              otherPlayer.arrow.y = playerInfo.arrow.y;
              otherPlayer.arrow.rotation = playerInfo.arrow.rotation;
              otherPlayer.arrow.scaleX = playerInfo.arrow.scaleX;
              otherPlayer.arrow.tint = playerInfo.arrow.color;
            }
          }
        });
      });
      this.socket.on('playerGotHit', (hit) => {
        let projectile;
        self.enemyProjectiles.getChildren().forEach(function(orbProjectile){
          if(orbProjectile.id == hit.projectileId){
            projectile = orbProjectile;
            orbProjectile.destroy();
          }
        });
        self.ownProjectiles.getChildren().forEach(function(orbProjectile){
          if(orbProjectile.id == hit.projectileId){
            projectile = orbProjectile;
            orbProjectile.destroy();
          }
        });
        if(hit.playerId == self.socket.id){
          self.mage.isHit(self,self.mage,projectile)
        }
      });
      this.socket.on('hpUpdated', (playerInfo) => {
        self.enemyMages.getChildren().forEach(function(otherPlayer){
          if(playerInfo.playerId === otherPlayer.playerId){
            otherPlayer.currentHp = playerInfo.hp.current;
            otherPlayer.maxHp = playerInfo.hp.max;
            otherPlayer.hpGui.setText(`${otherPlayer.currentHp}/${otherPlayer.maxHp}`);
          }
        });
      });

      this.socket.on('hpDrained', (orbLevel) =>{
        if(self.mage.currentHp < self.mage.maxHp){
            console.log(orbLevel);
            self.mage.currentHp += orbLevel;
            self.mage.updateHpValue();
        }
      })
    }
}


function addOtherPlayers(self, playerInfo){
  // const otherPlayer = new Player(self, playerInfo.x, playerInfo.y, CST.SPRITE.PLAYER);//.setScale(2);
  // otherPlayer.playerId = playerInfo.playerId;
  // self.enemyMages.add(otherPlayer);

  const otherPlayer = self.physics.add.sprite(self, playerInfo.x, playerInfo.y, CST.SPRITE.PLAYER);//.setScale(2);
  otherPlayer.playerId = playerInfo.playerId;
  otherPlayer.setScale(2);
  otherPlayer.setSize(8,21).setOffset(12,5);
  self.enemyMages.add(otherPlayer);
  otherPlayer.arrow = self.add.sprite(playerInfo.x, playerInfo.y, 'arrow').setVisible(false).setOrigin(-0.5,0.5);
  otherPlayer.currentHp = 20;
  otherPlayer.maxHp = 20;
  otherPlayer.hpGui = self.add.text(playerInfo.x, playerInfo.y-otherPlayer.height,`${otherPlayer.currentHp}/${otherPlayer.maxHp}`).setOrigin(0.5,0.5);
}

function createOrb(self, newOrb){
  let orb = new Orb(self, newOrb.x, newOrb.y, "orbs", newOrb.frameIndex, newOrb.orbId);
  self.allOrbs.add(orb);
}

function updatePlayerOrb(self,playerInfo){
  self.enemyMages.getChildren().forEach((enemy) =>{
    // console.log(playerInfo);
    if(enemy.primary){
      enemy.primary.x = playerInfo.primary.x;
      enemy.primary.y = playerInfo.primary.y;
    }
    if(enemy.secondary){
      enemy.secondary.x = playerInfo.secondary.x;
      enemy.secondary.y = playerInfo.secondary.y;
      enemy.secondary.scaleX = playerInfo.secondary.scale.x;
      enemy.secondary.scaleY = playerInfo.secondary.scale.y;
    }
  });
}

function loadSprites(self, frameConfig){
    self.load.setPath('./js/assets/sprites/')

    for(let prop in CST.SPRITE){
      self.load.spritesheet(CST.SPRITE[prop], CST.SPRITE[prop], frameConfig);
    }
  }

function loadAudio(self){
    self.load.setPath('./js/assets/audio/')

    for(let prop in CST.AUDIO){
      self.load.audio(CST.AUDIO[prop], CST.AUDIO[prop]);
    }
  }
