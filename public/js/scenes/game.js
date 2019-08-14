
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
  }

  create(){
    var self = this;

    this.enemyMages = this.physics.add.group();
    this.allOrbs = this.physics.add.group();
    this.sockets()
    //this.mage = this.physics.add.sprite(50, 50, CST.SPRITE.PLAYER);

    this.input.on('pointerup', function(pointer){
      if(self.mage.orb1){
        self.mage.orb1.throwOrb(self,pointer);
        self.mage.orb1 = null;
        if(self.mage.orb2){
          self.mage.orb1 = self.mage.orb2;
          self.mage.orb2 = null;
        }
      }
      if(self.mage.orb1){console.log("orb1: ",self.mage.orb1.type," : ",self.mage.orb1.level);}
      if(self.mage.orb2){console.log("orb2: ",self.mage.orb2.type," : ",self.mage.orb2.level);}

      //   let newOrb = {
      //     x: pointer.x,
      //     y: pointer.y,
      //     frameIndex: Math.floor(Math.random() * 3),
      //     orbId: Math.floor(Math.random() * 1000)
      //   };
      //   createOrb_click(self, newOrb);
    });
  }


  update(){
    if(this.mage){
      this.mage.update();
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
          }
        });
      });

      this.socket.on('newOrb',function(orb){
        createOrb(self, orb);
      });
      this.socket.on('orbCollected',function(pickUp){
        self.allOrbs.getChildren().forEach(function(orb) {
          if (pickUp.orbId === orb.id) {
            // self.otherPlayers.getChildren().forEach(function (otherPlayer) {
            //   if (pickUp.playerId === otherPlayer.playerId) {
            //     let otherPlayerOrb = otherPlayer.primary = self.physics.add.sprite(otherPlayer.x+otherPlayer.x/3,otherPlayer.y,'orbs',orb.frameIndex);
            //     otherPlayerOrb.setCircle(8);
            //   }
            // });
            orb.destroy();
          }
        });
      });

      this.socket.on('playerMoved', (playerInfo) => {
        self.enemyMages.getChildren().forEach(function(otherPlayer){
          if(playerInfo.playerId === otherPlayer.playerId){
            otherPlayer.setPosition(playerInfo.x,playerInfo.y);
            otherPlayer.flipX = playerInfo.flipX;
            otherPlayer.anims.play('walk', true);
          }
        });
      });
      this.socket.on('playerStopped', (playerInfo) => {
        self.enemyMages.getChildren().forEach(function(otherPlayer){
          if(playerInfo.playerId === otherPlayer.playerId){
            otherPlayer.setPosition(playerInfo.x,playerInfo.y);
            otherPlayer.flipX = playerInfo.flipX;
            otherPlayer.anims.play('idle', true);
          }
        });
      });
 }
}


function addOtherPlayers(self, playerInfo){
  // const otherPlayer = new Player(self, playerInfo.x, playerInfo.y, CST.SPRITE.PLAYER);//.setScale(2);
  // otherPlayer.playerId = playerInfo.playerId;
  // self.enemyMages.add(otherPlayer);

  const otherPlayer = self.physics.add.sprite(self, playerInfo.x, playerInfo.y, CST.SPRITE.PLAYER);//.setScale(2);
  otherPlayer.playerId = playerInfo.playerId;
  otherPlayer.setScale(2);
  otherPlayer.setSize(8,14).setOffset(12,10);
  self.enemyMages.add(otherPlayer);
}

function createOrb(self, newOrb){
  let orb = new Orb(self, newOrb.x, newOrb.y, "orbs", newOrb.frameIndex, newOrb.orbId);
  self.allOrbs.add(orb);
}
// function createOrb_click(self, newOrb){
//   let orb = new Orb(self, newOrb.x, newOrb.y, "orbs", newOrb.frameIndex, newOrb.orbId);
//   self.allOrbs.add(orb);
//
//   let orbVelocity = new Phaser.Math.Vector2();
//   let orb_pt = new Phaser.Geom.Point(orb.x,orb.y);
//   let newOrb_pt = new Phaser.Geom.Point(newOrb.x+20, newOrb.y+20);
//
//   let angle = Phaser.Math.Angle.BetweenPoints(orb_pt, newOrb_pt);
//   self.physics.velocityFromRotation(angle, 100, orbVelocity);
//   orb.setVelocity(orbVelocity.x, orbVelocity.y);
// }

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
