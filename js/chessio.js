/****************************************************************
 *  file:       chessio.js                                      *
 *  author:     daniel sparks                                   *
 *  purpose:    interaction of the client with the server; it   *
 *              is this file which facilitates online play.     *
 ****************************************************************/



var socket = io.connect();



/* set handle, and 'login' to the server */

function setHandle() {
    myHandle = $( '#handleBox' ).val();
    socket.emit('loadChess', {'handle' : myHandle});
    $( '.promptLayer' ).addClass('hide');
}



/* listen for information about other users */

socket.on('userList', function(data) {
	for(var property in data)
		userList.options[userList.options.length] = new Option(data[property], property);
});

socket.on('removeUser', function(data) {
	for(var x = 0; x < userList.options.length; x++) {
		if(userList[x].value == data.id) {
			userList.remove(x);
			break;
		}
	}
});

socket.on('addUser', function(data) {
    userList.options[userList.options.length] = new Option(data.handle, data.id);
});



/* send client moves to the server and listen for opponent's moves */

socket.on('newMove', function(data) {
    makeMove(data);
});



/* these functions inform the server of requests/statements from the client */

function challenge() {
    if(userList[userList.selectedIndex].value == null) return;
    socket.emit('challenge', {'id' : userList[userList.selectedIndex].value});
}

function resign() {
    socket.emit('resign');
    endGame(!playerColor);
}

function offerDraw() {
    socket.emit('offerDraw');
}
    
function requestUndo() {
    socket.emit('requestUndo');
}



/* answers to the preceding queries, as well as requests from our opponent, are heard here */

socket.on('challenge', function(data) {
    if(!confirm(data.handle + " challenges you.  Press OK to accept the challenge, or Cancel to decline.")) return;
    socket.emit('acceptChallenge', { 'id' : data.id });
    newGame(data.handle, true, "def");
});

socket.on('resign', function(data) {
    endGame(playerColor);
});

socket.on('offerDraw', function(data) {
    socket.emit(opponentOffersDraw());
});

socket.on('requestUndo', function(data) {
    socket.emit(opponentRequestsUndo());
});

socket.on('acceptedChallenge', function(data) {
    newGame(data.handle, false, "def");
});

socket.on('acceptedDraw', function(data) {
    endGame("neither");
});

socket.on('acceptedUndo', function(data) {
    undoMove(playerColor);
});



/* the functions which are called in the event of a draw or undo */

function opponentOffersDraw() {
    if(confirm(opponentHandle + " has proposed a draw.  To accept, press OK, to decline, press Cancel.")) {
        endGame("neither");
        return 'acceptDraw';
    } else
        return 'declineDraw';
}

function opponentRequestsUndo() {
    if(confirm(opponentHandle + " has requested an undo.  To let " + opponentHandle + " take back their last move, press OK, otherwise, press Cancel.")) {
        undoMove(!playerColor);
        return 'acceptUndo';
    } else
        return 'declineUndo';
}

function removeMove() {
    unmakeMove();
    $( "#movelist" ).contents().find( "#mv" + history.moveNum ).remove();
    $( "#movelist" ).contents().find( "#lbl" + history.moveNum ).remove();
    $( "#movelist" ).contents().find( "#rw" + history.moveNum ).remove();
    history.moves.length--;
    history.totalMoves--;
}

function undoMove(color) {
    removeMove();
    if(gs.wtm != color) removeMove();
}
