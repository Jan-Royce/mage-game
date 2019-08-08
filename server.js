var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);
var players = {};

app.use(express.static(__dirname + '/public'));

app.get('/',function(req,res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection',function(socket){
  console.log('a player has connected');
  players[socket.id] = {
    x: Math.floor(Math.random() * 700) + 50,
    y: Math.floor(Math.random() * 500) + 50,
    playerId: socket.id
  };

  //send player object to the new player
  socket.emit('currentPlayers', players);
  //update other players with the new player
  socket.broadcast.emit('newPlayer', players[socket.id]);

  socket.on('disconnect',function(){
    console.log('a player has disconnected');
    delete players[socket.id]; //remove player from players obj
    //remove player from the other players
    io.emit('disconnect', socket.id);
  });

  socket.on('playerWalk',function(newPosition){
    players[socket.id].x = newPosition.x;
    players[socket.id].y = newPosition.y;
    //broadcast movement to other clients
    socket.broadcast.emit('playerWalked',players[socket.id]);
  });
  socket.on('playerIdle',function(idlePosition){
    players[socket.id].x = idlePosition.x;
    players[socket.id].y = idlePosition.y;
    //broadcast movement to other clients
    socket.broadcast.emit('playerIdled',players[socket.id]);
  });
});//'connection' event

server.listen(8081,function(){
  console.log(`Listening on ${server.address().port}`);
});
