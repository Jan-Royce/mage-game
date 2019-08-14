
function orbCollision(mage, orb){
  if(orb.fired){
      mage.scaleX -= mage.scaleX/128;
      mage.scaleY -= mage.scaleY/128;
  }
  else{
    pickUpOrb(mage, orb);
  }
}

function pickUpOrb(mage, orb){
  if(!mage.orb1 && !mage.orb2){
    scene.pickupSound.play({volume:.5});

  }
}
