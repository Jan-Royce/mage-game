import { CST } from "../CST.js";
export class Orb extends Phaser.Physics.Arcade.Sprite{
  constructor(scene, x, y, texture, frame, id, level){
    super(scene, x, y, texture, frame, id, level)
    scene.sys.updateList.add(this);
    scene.sys.displayList.add(this);
    scene.physics.world.enableBody(this, 0);
    this.socket = scene.socket;

    this.init(x,y,id,level,frame);
    this.preload(scene);
    this.create(scene,texture);
    // this.getOrbType(frame);
  }

  init(x,y,id,level,frame){
    this.id = id;
    this.fired = false;
    this.x = x;
    this.y = y;
    // this.type = 'none';
    this.getOrbType(frame);
    this.level = level!=null?level:1;
    this.setCircle(8);
    this.depth = this.y + this.height/4;
  }

  preload(){

  }

  create(scene, texture){
    scene.popSound = scene.sound.add(CST.AUDIO.POP);
    this.anims.play(this.type+this.level, true);

    this.setInteractive();

    this.on('pointerup',function(){
      console.log(this.x,this.y);
    }, this);
  }

  update(scene){
    if(this.fired){
      if(this.x >= scene.game.config.width && this.x <= 0 &&
      this.y >= scene.game.config.height && this.y <= 0){
        this.destroy();
        this.socket.emit('projectileDestroy',this.id);
      }//within world bounds
      else{//exceeds world bounds
        var projectile = {
          id: this.id,
          orbVelocity: this.orbVelocity,
        };
        this.socket.emit('projectileMove',projectile);
      }
    }
  }

  getOrbType(frame){
    let type = null;
    switch(frame){
      case 0:
        type = "rock";
        break;
      case 1:
        type = "paper";
        break;
      case 2:
        type = "scissors";
        break;
    }
    this.type = type;
  }

  destroyOrb(){
    if(this.fired){
      this.socket.emit('projectileDestroy',this.id);
    }
    else{
      this.socket.emit('orbDestroy',this.id);
    }

    this.destroy();
  }

  changeOrbLevel(level){
    this.level = level;
    this.anims.play(this.type+this.level, true);
    this.socket.emit('orbLevelChange',{id:this.id,level:level});
  }

  throwOrb(scene,pointer){

    this.fired = true;
    scene.ownProjectiles.add(this);
    this.socket.emit('projectileCreate',this.id);

    //orb - orb collision
    scene.physics.add.overlap(this,scene.allOrbs,function(orb, other){
      // console.log("orb:",orb.type)
      // console.log("other:",other.type)

      if(orb.type == other.type){ //temp handler, should prolly make 'em combine
        orb.changeOrbLevel(Math.min(other.level+orb.level,3));
        orb.anims.play(orb.type+orb.level, true);
        // other.level = Math.min(other.level+orb.level,3);
        // console.log(orb.id," | ",orb.type," | ",orb.level,"[same type]")
        // console.log(other.id," | ",other.type," | ",other.level,"[same type]")
        if(orb.fired){
          other.destroyOrb();
        }
        scene.popSound.play({volume:.05});
      }
      /*
      else if(orb.type == "rock" && other.type == "paper"){
        other.changeOrbLevel(other.level - orb.level);
        // other.level = other.level - orb.level;
        if(other.level <= 0){
          other.destroyOrb();
        }
        orb.destroyOrb();
      }
      else if(orb.type == "rock" && other.type == "scissors"){
        orb.changeOrbLevel(orb.level - other.level);
        // orb.level = orb.level - other.level;
        if(orb.level <= 0){
          orb.destroyOrb();
        }
        other.destroyOrb();
      }
      else if(orb.type == "paper" && other.type == "rock"){
        orb.changeOrbLevel(orb.level - other.level);
        // orb.level = orb.level - other.level;
        if(orb.level <= 0){
          orb.destroyOrb();
        }
        other.destroyOrb();
      }
      else if(orb.type == "paper" && other.type == "scissors"){
        other.changeOrbLevel(other.level - orb.level);
        // other.level = other.level - orb.level;
        if(other.level <= 0){
          other.destroyOrb();
        }
        orb.destroyOrb();
      }
      else if(orb.type == "scissors" && other.type == "rock"){
        other.changeOrbLevel(other.level - orb.level);
        // other.level = other.level - orb.level;
        if(other.level <= 0){
          other.destroyOrb();
        }
        orb.destroyOrb();
      }
      else if(orb.type == "scissors" && other.type == "paper"){
        orb.changeOrbLevel(orb.level - other.level);
        // orb.level = orb.level - other.level;
        if(orb.level <= 0){
          orb.destroyOrb();
        }
        other.destroyOrb();
      }
      */
    }, null, scene);

    // this.setActive(true);
    // this.setVisible(true);
    // this.body.enable = true;

    /*
    if(scene.mage.flipX){
      this.x = scene.mage.x + scene.mage.width/2;
    }
    else{
      this.x = scene.mage.x + scene.mage.width*1.5;
    }
    this.y = scene.mage.y;
    */

    this.orbVelocity = new Phaser.Math.Vector2();
    let mage_pt = new Phaser.Geom.Point(scene.mage.x,scene.mage.y);
    let newOrb_pt = new Phaser.Geom.Point(pointer.x, pointer.y);
    let angle = Phaser.Math.Angle.BetweenPoints(mage_pt, newOrb_pt);
    let angle_rounded = Math.abs(Math.round(angle));

    switch(angle_rounded){
      case 0:
      case 1:
        this.x = scene.mage.x + scene.mage.width/2;
        break;
      case 2:
      case 3:
        this.x = scene.mage.x - scene.mage.width;
        break;
    }
    this.y = scene.mage.y;

    // console.log("rad round: ",angle_rounded);
    // console.log("rad angle: ",angle);
    // console.log("deg angle: ",angle*180/Math.PI);

    scene.physics.velocityFromRotation(angle, 400, this.orbVelocity);//this.level * something for speed depending on level
    this.setVelocity(this.orbVelocity.x , this.orbVelocity.y);

  }
}
