var config = {
    type: Phaser.AUTO,
    parent: 'phaser-example',
    width: 800,
    height: 600,
    pixelArt: true,
    physics: {
        default: 'arcade',
        arcade: {
            debug: true,
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
    speed: 80
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
}

function create() {

    var self = this;
    this.socket = io();
    this.otherPlayers = this.physics.add.group();

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

    this.socket.on('newPlayer',
      function (playerInfo) {
          addOtherPlayers(self, playerInfo);
      });

    this.socket.on('disconnect', function (playerId) {
        self.otherPlayers.getChildren().forEach(function (otherPlayer) {
            if (playerId === otherPlayer.playerId) {
                otherPlayer.destroy();
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
        right: Phaser.Input.Keyboard.KeyCodes.D
    });

}

function update() {

    if (this.mage) {

        this.mage.axis = new Phaser.Math.Vector2();
        let axis = this.mage.axis.normalize();

        let left = this.cursors.left.isDown ? 1 : 0;
        let right = this.cursors.right.isDown ? 1 : 0;
        let down = this.cursors.down.isDown ? 1 : 0;
        let up = this.cursors.up.isDown ? 1 : 0;

        this.mage.axis.x = right - left;
        this.mage.axis.y = down - up;

        let pointOrigin = new Phaser.Geom.Point(0, 0);
        let pointAxis = new Phaser.Geom.Point(axis.x, axis.y);

        let dir = Phaser.Math.Angle.BetweenPoints(pointOrigin, pointAxis);
        console.log(Phaser.Math.RoundTo(dir))

        //from this directions, determine where the player would face
        if (this.mage.axis.x != 0 || this.mage.axis.y != 0) {
            this.mage.setVelocityX(game.player.speed * axis.x);
            this.mage.setVelocityY(game.player.speed * axis.y);
            this.mage.anims.play('walk', true);
        }
        else {
            this.mage.setVelocity(0);
            this.mage.anims.play('idle', true);
        }


        // this.mage.setVelocity(game.player.speed*axis);
        // console.info(left,right,down,up);
        // console.info(this.mage.axisX,this.mage.axisY);
        // this.mage.setVelocity(game.player.speed*);
        // if(this.cursors.left.isDown){
        //   this.mage.setVelocityX(-50);
        //   // this.mage.scaleX = -1;
        //   this.mage.anims.play('walk', true);
        // }
        // else if(this.cursors.right.isDown){
        //   this.mage.setVelocityX(50);
        //   // this.mage.scaleX = 1;
        //   this.mage.anims.play('walk', true);
        // }
        // else if(this.cursors.down.isDown){
        //   this.mage.setVelocityY(50);
        //   this.mage.anims.play('walk', true);
        // }
        // else if(this.cursors.up.isDown){
        //   this.mage.setVelocityY(-50);
        //   this.mage.anims.play('walk', true);
        // }
    }
}

function addPlayer(self, playerInfo) {
    self.mage = self.physics.add.sprite(playerInfo.x, playerInfo.y, 'player').setOrigin(0, 0);//.setScale(2);
    self.mage.setCollideWorldBounds(true);
}

function addOtherPlayers(self, playerInfo) {
    // const otherPlayer = self.+
    const otherPlayer = self.physics.add.sprite(playerInfo.x, playerInfo.y, 'player').setOrigin(0, 0);//.setScale(2);
    otherPlayer.playerId = playerInfo.playerId;
    self.otherPlayers.add(otherPlayer);
}



// ______________________
