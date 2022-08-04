const express = require('express');
const https = require('https');
const path = require('path');
const fs = require('fs');
const url = require('url');
const ent = require('ent');
const app = express();


var options = {
    key: fs.readFileSync(path.join(__dirname, 'cert', 'key.pem')),
    cert: fs.readFileSync(path.join(__dirname, 'cert', 'cert.pem')),
    NPNProtocols: ['http/2.0', 'spdy', 'http/1.1', 'http/1.0']
}


const sslServer = https.createServer(options,handleRequest);

sslServer.listen(443, () => {
    console.log('Here is a secure server');
})

function handleRequest(request, response) {
	console.log('Path Hit: ' + request.url);
	if (request.url === '/') {
		fs.readFile(__dirname + '/triliza.html', function(err, data) {
		if (err) {
			response.writeHead(500);
			return response.end('Error loading index.html');
		}
		response.writeHead(200);
		response.end(data);
		});
	}else {
		fs.readFile(__dirname + request.url, function(err, data) {
			if (err) {
				response.writeHead(500);
				return response.end('Error in loading page');
			}
			response.writeHead(200);
			response.end(data);
		});
	}
};

var io = require('socket.io')(sslServer); 
var players = {};
var unmatched;


io.sockets.on('connection', function(socket, username) {

  socket.on('new_client', function(username) {
    username = ent.encode(username);
    socket.username = username;
    socket.broadcast.emit('new_client', username);
  });

  socket.on('message', function(message) {
    message = ent.encode(message);
    socket.broadcast.emit('message', {
      username: socket.username,
      message: message
    });
  });


socket.on('video call', function(data) {
    socket.broadcast.emit('video call', data);
  });

  joinGame(socket);

  if (getOpponent(socket)) {
    socket.emit("game.begin", {
      symbol: players[socket.id].symbol,
     
    });
    getOpponent(socket).emit("game.begin", {
      symbol: players[getOpponent(socket).id].symbol,
      
      
    });
  }

  socket.on('begin', function(data) {
    console.log(data);
    socket.broadcast.emit('begin',data);
  })
  
    socket.on('make-move',mouseMsg);
   // socket.on('turn',displayTurn);
    socket.on('display-winner', displayWinner);
   
    function mouseMsg(data) {
        console.log(data);
       // socket.broadcast.emit('make-move',data);
       if (!getOpponent(socket)) {
        return;
      }
      socket.emit("move.made", data);
      getOpponent(socket).emit("move.made", data);
       
    }

    function displayWinner(data) {
        console.log(data);
        socket.broadcast.emit('display-winner', data);
    }
     
});

function joinGame(socket) {

    players[socket.id] = {
      opponent: unmatched,
  
      symbol: "X",
      socket: socket,
    };

    if (unmatched) {
      players[socket.id].symbol = "O";
      players[unmatched].opponent = socket.id;
      unmatched = null;
    } else {
      unmatched = socket.id;
    }
    console.log(players);
  }
  
  function getOpponent(socket) {
    if (!players[socket.id].opponent) {
      return;
    }
    return players[players[socket.id].opponent].socket;
  }

