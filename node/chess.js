/****************************************************************
 *  file:       chess.js                                        *
 *  author:     dan sparks                                      *
 *  purpose:    server side code for the chess app.             *
 ****************************************************************/


 
var users = {};
var handles = {};
var opponents = {};



/* this function outlines what to do when a user connects */
exports.loadChess = function(socket, io, data) {
    
    /* first, the new user is greeted with a list of all connected users */
    socket.emit('userList', handles);
    
    /* add the user to the userlist */
    addUser(socket, io, data);
    
    /* (if) the user challenges another user */
    socket.on('challenge', function(data) { 
        sendChallenge(socket.id, data.id);
    });
    
    /* (if) the user accepts a challenge placed by another user (note: an exploit issue exists, keep track of challenges?) */
    socket.on('acceptChallenge', function(data) {
        startGame(socket.id, data.id);
    });
    
    /* (if) the user wishes to play a new move */
    socket.on('newMove', function(data) {
        users[opponents[socket.id]].emit('newMove', data.move);
    });
    
    /* (if) the user wishes to offer a draw */
    socket.on('offerDraw', function(data) {
        users[opponents[socket.id]].emit('offerDraw');
    });
    
    /* (if) the user wishes to accept a draw offer */
    socket.on('acceptDraw', function(data) {
        users[opponents[socket.id]].emit('acceptedDraw');
    });
    
    /* (if) the user wishes to decline a draw offer */
    socket.on('declineDraw', function(data) {
        users[opponents[socket.id]].emit('declinedDraw');
    })
    
    /* (if) the user wishes to resign */
    socket.on('resign', function(data) {
        users[opponents[socket.id]].emit('resign');
    });
    
    /* (if) the user wishes to take back a move */
    socket.on('requestUndo', function(data) {
        users[opponents[socket.id]].emit('requestUndo');
    });
    
    /* (if) the user allows the opponent to take back a move */
    socket.on('acceptUndo', function(data) { 
        users[opponents[socket.id]].emit('acceptedUndo');
    });
    
    /* (if) the user disconnects, the other parties are informed */
    socket.on('disconnect', function(data) {
        removeUser(socket.id, io);
    });
    
}


/* add a user to the userlist */
function addUser(socket, io, data) {
    users[socket.id] = socket;
    handles[socket.id] = data.handle;
    io.sockets.emit('addUser', { 'id' : socket.id , 'handle' : data.handle });
    console.log('Userid=' + socket.id + ' has connected and set handle to ' + data.handle + '.');
}

/* add or change a user's handle */
function setHandle(id, io, handle) {
    handles[id] = handle;
    io.sockets.emit('removeUser', { 'id' : id });
    io.sockets.emit('addUser', { 'id' : id , 'handle' : handles[id] });
    console.log('Userid=' + id + ' has set handle to ' + handle);
}

/* remove a user from the userlist */
function removeUser(id, io) {
	delete users[id];
	delete handles[id];
    io.sockets.emit('removeUser', { 'id' : id });
	console.log('Userid=' + id + ' has disconnected from chat.');
}

/* sends a challenge to a specific user */
function sendChallenge(from, to) {
    users[to].emit('challenge', {'id' : from, 'handle' : handles[from] });
    console.log(from + ' challenges ' + to);
}

/* begins a game */
function startGame(whitePlayer, blackPlayer) {
    opponents[whitePlayer] = blackPlayer;
    opponents[blackPlayer] = whitePlayer;
    users[blackPlayer].emit('acceptedChallenge', { 'id' : whitePlayer, 'handle' : handles[whitePlayer] });
    console.log(whitePlayer + " vs " + blackPlayer + " begin");
}