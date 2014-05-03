/****************************************************************
 *  file:       chessui.js                                      *
 *  author:     daniel sparks                                   *
 *  purpose:    piece movement animation, etc.                  *
 ****************************************************************/



var movingData = {  ob: undefined,                              // the event.target object
                    x: 0,                                       // mouse position X at start of drag
                    y: 0,                                       // mouse position Y ar start of drag
                    x_0: 0,                                     // object's starting position X
                    y_0: 0,                                     // object's starting posiiton Y
                    
                    id: function() { return (this.ob != undefined)? extractInt(this.ob.id) : undefined},
                    deltaX: function() { return parseInt(this.ob.style.left) - this.x_0; },
                    deltaY: function() { return parseInt(this.ob.style.top) - this.y_0; },
                    set: function(nOb, nX, nY, nX_0, nY_0) { this.ob = nOb; this.x = nX; this.y = nY; this.x_0 = nX_0; this.y_0 = nY_0; }
                 };
var legalMoves = {  moves : [],
                    generated : false,
                    checkLegality : function(move) {
                        if(!this.generated) this.moves = movegen();
                        this.generated = true;
                        for(var x = 0; x < this.moves.length; x++)
                            if(move.source == this.moves[x].source && move.dest == this.moves[x].dest)
                                return true;
                        return false;
                    }
                 };
                 

/* functions for dragging / dropping chess pieces */
                 
function dragStart(event) {
    if(notMyTurn(event.target.id) || !canPlay()) return;
    $( "table.chess" ).addClass("mouseDown");
    movingData.set(event.target, event.clientX, event.clientY, parseInt(event.target.style.left), parseInt(event.target.style.top));
    $( "#pc" + movingData.id() ).addClass("inHand");
}

function dragMove(event) {
    if(!pieceInHand()) return;
    movingData.ob.style.left = (event.clientX - movingData.x) + movingData.x_0;
    movingData.ob.style.top = (event.clientY - movingData.y) + movingData.y_0;
}

function dragDrop(event) {
    if(!pieceInHand()) return;
    $( "table.chess" ).removeClass("mouseDown");
    $( "#pc" + movingData.id() ).removeClass("inHand"); 
    var move = getNearestMove(movingData.deltaX(), movingData.deltaY());
    (isDefined(move))? userMove(move) : sendHome();
    movingData.set(undefined, 0, 0, 0, 0);
}



/* other UI functions */

function showClocks() {
    $( 'div[id*="fTime"]' ).addClass("flip");
    $( '#oppTime' ).removeClass("white black").addClass((playerColor? "black" : "white"));
    $( '#myTime').removeClass("white black").addClass((playerColor? "white" : "black"));
    $( '#oppNameBox' ).removeClass("white black").addClass((playerColor? "black" : "white")).html(opponentHandle);
    $( '#myNameBox' ).removeClass("white black").addClass((playerColor? "white" : "black")).html(myHandle);
}

function drawBoard() {
    for(var x = 0; x < 32; x++) {
        if(gs.board[picSq[x]] != 0) {
            $( "#pc" + x ).attr("src", "img/piece" + ((gs.board[picSq[x]] > 0)? "1" : "0") + (Math.abs(gs.board[picSq[x]])) + ".png").removeClass("hidden");
            if((Math.abs(gs.board[picSq[x]]) % 3) == 1) $( "#pc" + x ).addClass("bigPiece");
        }
    }
}

function userMove(move) {
    move.source = picSq[movingData.id()];
    move.dest = 16 * move.y + move.x;
    move.attacker = gs.board[move.source];
    move.promoteTo = 0;
    if(isPromotion(move)) move.promoteTo = 5; /* later we'll prompt user for promo type */
    move.defender = ((Math.abs(move.attacker) == 1 && move.dest == gs.enPassant)? -move.attacker : gs.board[move.dest]);
    
    /* eventually we'll test for legality, for now, merely: */
    if(!legalMoves.checkLegality(move)) return sendHome();
    
    if(playerColor != "none") socket.emit('newMove', { 'move' : move });
    makeMove(move);
}



/* utility/support functions */

function getNearestMove(left, top) {
    var src = {x: rotateIfBlack(getX(picSq[movingData.id()])), y: rotateIfBlack(getY(picSq[movingData.id()]))};
    if(isNearWhole(left) && isNearWhole(top) && isBound(left, src.x) && isBound(top, src.y))
        return {x : rotateIfBlack(src.x + getWhole(left)), y: rotateIfBlack(src.y + getWhole(top))};
    else
        return {x : undefined, y : undefined};
}

function sendHome() {
    movingData.ob.style.left = movingData.x_0;
    movingData.ob.style.top = movingData.y_0;
}

function handleKeyPress(event) { if(pressedEnter(event) && handleOK($( '#handleBox' ).val())) return setHandle(); }    
function handleOK(handle) { if(handle != "") return true; } // add handle criteria here
function pressedEnter(event) { return (event.which == 13 || event.keyCode == 13); }