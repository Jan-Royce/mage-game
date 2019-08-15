var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);
var players = {};
var orbs = {};
var projectiles = {};

app.use(express.static(__dirname + '/public'));

app.get('/',function(req,res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection',function(socket){
  console.log('a player has connected');
  let side = 0;
  if(Object.keys(players).length % 2 != 0){
    side = 400;
  }

  players[socket.id] = {
    x: Math.floor(Math.random() * 400) + side,
    y: Math.floor(Math.random() * 500) + 50,
    flipX: false,
    primary: {},
    secondary: {},
    playerId: socket.id
  };
  //send player object to the new player
  socket.emit('currentPlayers', players);
  socket.emit('currentOrbs', orbs);
  //update other players with the new player
  socket.broadcast.emit('newPlayer', players[socket.id]);

  socket.on('disconnect',function(){
    console.log('a player has disconnected');
    delete players[socket.id]; //remove player from players obj
    //remove player from the other players
    io.emit('disconnect', socket.id);
  });

  socket.on('playerMovement',function(newPosition){
    players[socket.id].x = newPosition.x;
    players[socket.id].y = newPosition.y;
    players[socket.id].flipX = newPosition.flipX;
    if(newPosition.orb2){
      /*
      players[socket.id].secondary.x = newPosition.orb2.x;
      players[socket.id].secondary.y = newPosition.orb2.y;
      players[socket.id].secondary.scaleX = newPosition.orb2.scale.x;
      players[socket.id].secondary.scaleY = newPosition.orb2.scale.y;
      */
      players[socket.id].secondary = newPosition.orb2;
    }
    //broadcast movement to other clients
    socket.broadcast.emit('playerMoved',players[socket.id]);
  });
  socket.on('playerStop',function(idlePosition){
    players[socket.id].x = idlePosition.x;
    players[socket.id].y = idlePosition.y;
    players[socket.id].flipX = idlePosition.flipX;
    if(idlePosition.orb2){
      players[socket.id].secondary = idlePosition.orb2;

    }
    //broadcast movement to other clients
    socket.broadcast.emit('playerStopped',players[socket.id]);
  });

  socket.on('orbGetPrimary',function(orbProp){
    delete orbs[orbProp.id]; //remove orb
    players[socket.id].primary = {
      id: orbProp.id,
      frameIndex: orbProp.frameIndex
    };
    let pickup = {
      orbId: orbProp.id,
      playerId: socket.id
    };
    socket.broadcast.emit('orbGotPrimary', pickup);
  });
  socket.on('orbStackPrimary',function(orbProp){
    delete orbs[orbProp.stack];
    players[socket.id].primary.level = orbProp.level;
    let pickup = {
      playerId: socket.id,
      stack: orbProp.stack,
      level: orbProp.level,
    };
    socket.broadcast.emit('orbStackedPrimary', pickup);
  });
  socket.on('orbGetSecondary',function(orbProp){
    delete orbs[orbProp.id]; //remove orb
    players[socket.id].secondary = {
      id: orbProp.id,
      frameIndex: orbProp.frameIndex
    };
    let pickup = {
      orbId: orbProp.id,
      playerId: socket.id
    };
    socket.broadcast.emit('orbGotSecondary', pickup);
  });
  socket.on('orbStackSecondary',function(orbProp){
    delete orbs[orbProp.stack];
    players[socket.id].secondary.level = orbProp.level;
    let pickup = {
      playerId: socket.id,
      stack: orbProp.stack,
      level: orbProp.level,
    };
    socket.broadcast.emit('orbStackedSecondary', pickup);
  });

  socket.on('primaryThrow',function(id){
    socket.broadcast.emit('primaryThrown', socket.id);
  });
  socket.on('projectileCreate',function(id){
    socket.broadcast.emit('projectileCreated', id);
  });
  socket.on('projectileMove',function(projectile){
    socket.broadcast.emit('projectileMoved', projectile);
  });
  socket.on('projectileDestroy',function(id){
    socket.broadcast.emit('projectileDestroyed', id);
  });

  socket.on('orbDestroy',function(id){
    socket.broadcast.emit('orbDestroyed', id);
  });
  socket.on('orbSwap',function(){
    socket.broadcast.emit('orbSwapped');
  });
  socket.on('orbLevelChange',function(orbInfo){
    socket.broadcast.emit('orbLevelChanged', orbInfo);
  });



  //generate orbs
  generateOrb();
});//'connection' event

server.listen(8081,function(){
  console.log(`Listening on ${server.address().port}`);
});

function generateOrb(){
  if(Object.keys(players).length > 1 &&
  // if(Object.keys(players).length > 0 &&
  Object.keys(orbs).length < 10){
    console.log("new orb!");
    let orbId = uniqid("orb-");
    orbs[orbId] = {
      x: Math.floor(Math.random() * 700) + 50,
      y: Math.floor(Math.random() * 500) + 50,
      // type: 'fire',
      orbId: orbId,
      frameIndex: Math.floor(Math.random() * 3)
    };
    io.emit('newOrb',orbs[orbId]);
  }
  setTimeout(generateOrb,5000);
}

function uniqid(a = "",b = false){
    var c = Date.now()/1000;
    var d = c.toString(16).split(".").join("");
    while(d.length < 14){
        d += "0";
    }
    var e = "";
    if(b){
        e = ".";
        var f = Math.round(Math.random()*100000000);
        e += f;
    }
    return a + d + e;
}
