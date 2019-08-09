var config = {
    type: Phaser.AUTO,
    parent: 'phaser-example',
    width: 800,
    height: 600,
    pixelArt: true,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: { y: 0 }
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);
game.player = {
  canFire: true,
  walkSound: null,
  speed: 80,
  orbs: 0,
  orbVelocity: new Phaser.Math.Vector2(),
};

function preload() {
    this.load.spritesheet("player", "assets/player.png", {
        frameWidth: 32,
        frameHeight: 32
    });

    this.load.spritesheet("orbs", "assets/orbs.png", {
        frameWidth: 17,
        frameHeight: 17
    });

    this.load.audio("shoot", "assets/shoot.wav");
    this.load.audio("step", "assets/step.wav");
}

function create() {
  var self = this;
  this.socket = io();
  this.otherPlayers = this.physics.add.group({
    primary: null
  });
  this.orbs = this.physics.add.group({
      key: 'orbs',
      frame: [0, 1, 2],
      frameQuantity: 0,
      frameIndex: 0,
      id: '0',
      type: 'none'
  });

  //<editor-fold> socket events
  this.socket.on('currentPlayers',
    function (players) {
      Object.keys(players).forEach(
        function (id) {
          if (players[id].playerId === self.socket.id) {
              addPlayer(self, players[id]);
          }
          else {
              addOtherPlayers(self, players[id]);
          }
        });
    });

  this.socket.on('currentOrbs',
  function(orbs){
    Object.keys(orbs).forEach(
      function (id) {
        createOrbs(self, orbs[id]);
      });
  });

  this.socket.on('newPlayer',
    function (playerInfo) {
        addOtherPlayers(self, playerInfo);
    });

  this.socket.on('disconnect',
  function (playerId) {
      self.otherPlayers.getChildren().forEach(function (otherPlayer) {
          if (playerId === otherPlayer.playerId) {
              otherPlayer.destroy();
          }
      });
  });

  this.socket.on('newOrb',function(newOrb){
    createOrbs(self, newOrb);
  });
  this.socket.on('orbCollected',function(pickUp){
    self.orbs.getChildren().forEach(function(orb) {
      if (pickUp.orbId === orb.id) {
        self.otherPlayers.getChildren().forEach(function (otherPlayer) {
          if (pickUp.playerId === otherPlayer.playerId) {
            otherPlayer.primary = self.physics.add.sprite(otherPlayer.x+otherPlayer.x/3,otherPlayer.y,'orbs',orb.frameIndex);
          }
        });
        orb.destroy();
      }
    });
  });

  this.socket.on('playerWalked',
  function(playerInfo){
    self.otherPlayers.getChildren().forEach(function(otherPlayer){
      if(playerInfo.playerId === otherPlayer.playerId){
        otherPlayer.setPosition(playerInfo.x,playerInfo.y);
        otherPlayer.flipX = playerInfo.flipX;
        otherPlayer.anims.play('walk', true);
      }
    });
  });
  this.socket.on('playerIdled',
  function(playerInfo){
    self.otherPlayers.getChildren().forEach(function(otherPlayer){
      if(playerInfo.playerId === otherPlayer.playerId){
        otherPlayer.setPosition(playerInfo.x,playerInfo.y);
        otherPlayer.flipX = playerInfo.flipX;
        otherPlayer.anims.play('idle', true);
      }
    });
  });

  //</editor-fold> socket events

  //<editor-fold> animations
  this.anims.create({
      key: "idle",
      frames: this.anims.generateFrameNumbers("player", {
          start: 0,
          end: 3
      }),
      frameRate: 8,
      repeat: -1
  });

  this.anims.create({
      key: "walk",
      frames: this.anims.generateFrameNumbers("player", {
          start: 4,
          end: 9
      }),
      frameRate: 10,
      repeat: -1
  });


  //</editor-fold> animations
  this.cursors = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
  });

  this.input.on('pointerup', function(pointer){
    if(game.player.primary){
      let angle = Phaser.Math.Angle.BetweenPoints(game.player.primary, pointer);
      self.physics.velocityFromRotation(angle, 400, game.player.orbVelocity);
    }
  });
  this.input.on('pointerup', function () {
    if(game.player.primary){
      game.player.primary.setVelocity(game.player.orbVelocity.x, game.player.orbVelocity.y);
      game.player.primary = null;
      this.sound.play('shoot',{volume:.5});
    }
  }, this);

  game.player.walkSound = this.sound.add('step');
}//create

function update() {

    if (this.mage) {
      this.mage.axis = new Phaser.Math.Vector2();

      let left = this.cursors.left.isDown ? 1 : 0;
      let right = this.cursors.right.isDown ? 1 : 0;
      let down = this.cursors.down.isDown ? 1 : 0;
      let up = this.cursors.up.isDown ? 1 : 0;

      this.mage.axis.x = right - left;
      this.mage.axis.y = down - up;
      let axis = this.mage.axis.normalize();

      let pointOrigin = new Phaser.Geom.Point(0, 0);
      let pointAxis = new Phaser.Geom.Point(axis.x, axis.y);

      let dir = Phaser.Math.Angle.BetweenPoints(pointOrigin, pointAxis);
      // console.log(Math.abs(Phaser.Math.RoundTo(dir)))

      //from this directions, determine where the player would face
      if (this.mage.axis.x != 0 || this.mage.axis.y != 0) {
          this.mage.setVelocityX(game.player.speed * axis.x);
          this.mage.setVelocityY(game.player.speed * axis.y);
          this.mage.anims.play('walk', true);
          this.mage.flipX = this.mage.axis.x<0?true:false;
          this.mage.setSize(8,14).setOffset(12,10);
          // if(game.player.walkSound){
          //   this.sound.play('step');
          //   game.player.walkSound = false;
          // }
          if(!game.player.walkSound.isPlaying){
            game.player.walkSound.play({delay:.1});
          }
      }
      else {
          this.mage.setVelocity(0);
          this.mage.anims.play('idle', true);
      }
      this.mage.depth = this.mage.y + this.mage.height / 2;

      var x = this.mage.x;
      var y = this.mage.y;
      var flipX = this.mage.flipX;
      if(this.mage.oldPosition && (x!==this.mage.oldPosition.x||
      y!==this.mage.oldPosition.y||flipX!==this.mage.oldPosition.flipX)){
        this.socket.emit('playerWalk',{x:this.mage.x,y:this.mage.y,flipX:this.mage.flipX});
      }
      else{
        this.socket.emit('playerIdle',{x:this.mage.x,y:this.mage.y,flipX:this.mage.flipX});
      }

      //save old pos data
      this.mage.oldPosition = {
        x: this.mage.x,
        y: this.mage.y,
        flipX: this.mage.flipX,
      };

      //primary orbs
      if(game.player.primary){
        if(this.mage.flipX){
          game.player.primary.x = this.mage.x + this.mage.width/2;
        }
        else{
          game.player.primary.x = this.mage.x + this.mage.width*1.5;
        }
        game.player.primary.y = this.mage.y + this.mage.height;
      }

      this.otherPlayers.getChildren().forEach(function(otherPlayer){
        if(otherPlayer.primary){
          if(otherPlayer.flipX){
            otherPlayer.primary.x = otherPlayer.x + otherPlayer.width/2;
          }
          else{
            otherPlayer.primary.x = otherPlayer.x + otherPlayer.width*1.5;
          }
          otherPlayer.primary.y = otherPlayer.y + otherPlayer.height;
        }
      });

  }//if this.mage
}//update

function addPlayer(self, playerInfo) {
    self.mage = self.physics.add.sprite(playerInfo.x, playerInfo.y, 'player').setOrigin(0, 0);//.setScale(2);
    self.mage.setCollideWorldBounds(true);
    self.mage.setScale(2);
    self.mage.setSize(8,14).setOffset(12,10);
}

function addOtherPlayers(self, playerInfo) {
    const otherPlayer = self.physics.add.sprite(playerInfo.x, playerInfo.y, 'player').setOrigin(0, 0);//.setScale(2);
    otherPlayer.playerId = playerInfo.playerId;
    otherPlayer.setScale(2);
    otherPlayer.setSize(8,14).setOffset(12,10);
    self.otherPlayers.add(otherPlayer);
    if(playerInfo.primary){
      otherPlayer.primary = self.physics.add.sprite(otherPlayer.x+otherPlayer.x/3,otherPlayer.y,'orbs',playerInfo.primary.frameIndex);
    }
}

function createOrbs(self, newOrb) {
  orb = self.orbs.create(newOrb.x, newOrb.y, 'orbs', newOrb.frameIndex);
  orb.id = newOrb.orbId;
  orb.type = newOrb.type;
  orb.frameIndex = newOrb.frameIndex;
  orb.setCircle(8);
  orb.depth = orb.y + orb.height / 4;

  self.physics.add.overlap(self.mage, orb, function(mage,orb){
    let orbProp = {
      id: orb.id,
      frameIndex: orb.frameIndex
    };
    this.socket.emit('orbCollect',orbProp);
    game.player.primary = self.physics.add.sprite(self.mage.x+self.mage.x/3,self.mage.y,'orbs',orb.frameIndex);
    game.player.primary.setCircle(8);
    orb.destroy();
    console.log(orb.id)
    console.log(orb.frameIndex)
  }, null, self);
}


// ______________________
