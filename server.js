/****************************************************************
 *	file:		server.js									    *
 *	author: 	daniel sparks								    *
 *	purpose: 	this is the main node file which listens and    *
 *				serves chess.html,                              *
 ****************************************************************/



var http = require('http');
var router = require('./node/router.js');

var serverIp = '127.0.0.1';
var serverPort = 8888;

var server = http.createServer(router.route).listen(serverPort, serverIp);
var io = require('socket.io').listen(server);

var chess = require('./node/chess.js');

console.log('danodechess by dan sparks');
console.log('server listening at http://' + serverIp + ':' + serverPort + '/');

io.sockets.on('connection', function(socket) {
	
    socket.on('loadChess', function(data) {
        chess.loadChess(socket, io, data);
    });
    
});