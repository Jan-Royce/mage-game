import { CST } from "../CST.js";
export class Orb extends Phaser.Physics.Arcade.Sprite{
  constructor(scene, x, y, texture, frame, id){
    super(scene, x, y, texture, frame)
    scene.sys.updateList.add(this);
    scene.sys.displayList.add(this);
    scene.physics.world.enableBody(this, 0);
    this.socket = scene.socket;

    this.init(x,y,id);
    this.preload(scene);
    this.create(scene);
    this.getOrbType(frame);
  }

  init(x,y,id){
    this.id = id;
    this.fired = false;
    this.x = x;
    this.y = y;
    this.type = 'none';
    this.level = 1;
    this.setCircle(8);
    this.depth = this.y + this.height/4;
  }

  preload(){

  }

  create(scene, frame){
    scene.popSound = scene.sound.add(CST.AUDIO.POP);

    /*
    //orb - orb collision
    scene.physics.add.overlap(scene.allOrbs,this,function(other, orb){
      console.log("orb:",orb.type)
      console.log("other:",other.type)

      if(orb.type == other.type){ //temp handler, should prolly make 'em combine
        // console.log(orb.id," | ",orb.type," | ",orb.level)
        other.level = Math.min(other.level+orb.level,3);
        if(orb.fired){
          orb.destroy();
        }
        console.log("same type");
      }
      else if(orb.type == "rock" && other.type == "paper"){
        // orb.level = orb.level - other.level;
        // if(orb.level <= 0){
          orb.destroy();
        // }
      }
      else if(orb.type == "rock" && other.type == "scissors"){
        // orb.level = orb.level - other.level;
        // if(orb.level <= 0){
          orb.destroy();
        // }
      }
      else if(orb.type == "paper" && other.type == "rock"){
        // orb.level = orb.level - other.level;
        // if(orb.level <= 0){
          orb.destroy();
        // }
      }
      else if(orb.type == "paper" && other.type == "scissors"){
        // orb.level = orb.level - other.level;
        // if(orb.level <= 0){
          orb.destroy();
        // }
      }
      else if(orb.type == "scissors" && other.type == "rock"){
        // orb.level = orb.level - other.level;
        // if(orb.level <= 0){
          orb.destroy();
        // }
      }
      else if(orb.type == "scissors" && other.type == "paper"){
        // orb.level = orb.level - other.level;
        // if(orb.level <= 0){
          orb.destroy();
        // }
      }
      scene.popSound.play({volume:.05});
    }, null, scene);
    */
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

  throwOrb(scene,pointer){
    //orb - orb collision
    scene.physics.add.overlap(this,scene.allOrbs,function(orb, other){
      console.log("orb:",orb.type)
      console.log("other:",other.type)

      if(orb.type == other.type){ //temp handler, should prolly make 'em combine
        // console.log(orb.id," | ",orb.type," | ",orb.level)
        other.level = Math.min(other.level+orb.level,3);
        if(orb.fired){
          orb.destroy();
        }
        console.log("same type");
      }
      else if(orb.type == "rock" && other.type == "paper"){
        other.level = other.level - orb.level;
        if(other.level <= 0){
          other.destroy();
        }
        orb.destroy();
      }
      else if(orb.type == "rock" && other.type == "scissors"){
        orb.level = orb.level - other.level;
        if(orb.level <= 0){
          orb.destroy();
        }
        other.destroy();
      }
      else if(orb.type == "paper" && other.type == "rock"){
        orb.level = orb.level - other.level;
        if(orb.level <= 0){
          orb.destroy();
        }
        other.destroy();
      }
      else if(orb.type == "paper" && other.type == "scissors"){
        other.level = other.level - orb.level;
        if(other.level <= 0){
          other.destroy();
        }
        orb.destroy();
      }
      else if(orb.type == "scissors" && other.type == "rock"){
        other.level = other.level - orb.level;
        if(other.level <= 0){
          other.destroy();
        }
        orb.destroy();
      }
      else if(orb.type == "scissors" && other.type == "paper"){
        orb.level = orb.level - other.level;
        if(orb.level <= 0){
          orb.destroy();
        }
        other.destroy();
      }
      scene.popSound.play({volume:.05});
    }, null, scene);

    this.setActive(true);
    this.setVisible(true);
    this.body.enable = true;
    this.fired = true;

/*
    if(scene.mage.flipX){
      this.x = scene.mage.x + scene.mage.width/2;
    }
    else{
      this.x = scene.mage.x + scene.mage.width*1.5;
    }
    this.y = scene.mage.y;
    */

    let orbVelocity = new Phaser.Math.Vector2();
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

    console.log("rad round: ",angle_rounded);
    console.log("rad angle: ",angle);
    console.log("deg angle: ",angle*180/Math.PI);
    scene.physics.velocityFromRotation(angle, 400, orbVelocity);
    this.setVelocity(orbVelocity.x, orbVelocity.y);
    // console.log("orbVelocity: ",orbVelocity);
  }
}
