
export class Orb extends Phaser.Physics.Arcade.Sprite{
  constructor(scene, x, y, texture){
    super(scene, x, y, texture)
    scene.sys.updateList.add(this);
    scene.sys.displayList.add(this);
    scene.physics.world.enableBody(this, 0);
    this.socket = scene.socket;

    this.init();
    this.preload(scene);
    this.create(scene);
  }

  init(){

  }

  preload(){

  }

  create(){

  }
}
