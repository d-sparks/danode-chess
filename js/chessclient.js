/****************************************************************
 *  file:       chessclient.js                                  *
 *  author:     daniel sparks                                   *
 *  purpose:    client side code for chess game.                *
 ****************************************************************/



$( document ).ready(function() {
    setBoard('default');
    $( document ).mousemove(function(event) { dragMove(event); });
    $( document ).mouseup(function(event) { dragDrop(event); });
    $( ".piece" ).mousedown(function(event) { dragStart(event); });
    $( '#handlePrompt' ).addClass('show');
    moveList = $( "#movelist" )[0].contentWindow.document;
    userList = $( '#userList' )[0];
    pgnList = $( '#pgn' )[0];
    document.getElementById('handleBox').select();
});



/* gamestate data */

var picSq   = [];
var gs      = { board : [],
                enPassant : -1,
                castling : [],
                wtm : true };
var myHandle;
var opponentHandle;
var playerColor = "none";
var gameLive = false;                
var history = { moveNum : 0,
                totalMoves : 0,
                moves : [],
                result : "",
                pushback : function(move) {
                    if(this.moveNum == this.totalMoves) {
                        this.moves[this.moveNum] = move;
                        writeToMovelist(move, this.moveNum);
                        this.totalMoves = this.moveNum + 1;
                    }
                    selectMove(this.moveNum++);
                },
                pop : function() {
                    selectMove(--this.moveNum - 1);
                    return this.moveNum;
                },
                clear : function() {
                    this.moveNum = 0;
                    this.totalMoves = 0;
                    this.moves = [];
                    this.result = "";
                }};
                
                

/* functions which have to do with manipulation of the board */

function setBoard(FEN) {
    for(var x = 0; x < 128; x++) gs.board[x] = 0;
    for(var x = 0; x < 32; x++) { picSq[x] = -1; $( "#pc" + x ).addClass("hidden"); }
    
    makePiece(0, -4); makePiece(7, -4); makePiece(1, -2); makePiece(6, -2); makePiece(2, -3); makePiece(5, -3); makePiece(3, -5); makePiece(4, -6);
    for(var x = 0; x < 8; x++) {
        makePiece(x + 16, -1); makePiece(x + 96, 1); makePiece(x + 112, -gs.board[x]);
    }
    
    gs.enPassant = -1;
    gs.castling = 15;
    gs.wtm = true;
}

function newGame(opponent, color, level) {
    opponentHandle = opponent;
    playerColor = color;
    gameLive = true;
    setBoard("default");
    initializeMovelist();
    history.clear();
    showClocks();
}

function endGame(winner) {
    history.result = (winner == "neither")? "draw" : (winner? "white" : "black");
    gameLive = false;
    $( 'div[id*="fTime"]' ).removeClass("flip");
}

function killPiece(square) {
    if(gs.board[square]) $( "#pc" + picSq.indexOf(square) ).addClass("hidden");
    picSq[picSq.indexOf(square)] = -1;
    gs.board[square] = 0;
}

function makePiece(square, piece) {
    gs.board[square] = piece;
    var x = picSq.indexOf(-1);
    if(x == -1) return; // error handling
    picSq[x] = square;
    var pic = $( "#pc" + x );
    pic.attr("src", "img/piece" + ((piece > 0)? "1" : "0") + Math.abs(piece) + ".png").removeClass("hidden");
    pic.css("left", sizeSquare * (getRotatedX(square, initialSquare(x))) + "px").css("top", sizeSquare * (getRotatedY(square, initialSquare(x))) + "px");
    ((Math.abs(piece) % 3) == 1)? pic.addClass("bigPiece") : pic.removeClass("bigPiece");
}

function movePiece(source, dest, picId) {
    var pic = $( "#pc" + picId );
    gs.board[dest] = gs.board[source];
    gs.board[source] = 0;
    picSq[picId] = dest;
    pic.addClass("snap");
    pic.css("left", sizeSquare * (getRotatedX(dest, initialSquare(picId))) + "px").css("top", sizeSquare * (getRotatedY(dest, initialSquare(picId))) + "px");
    setTimeout(function() { pic.removeClass("snap"); }, 325);
}



/* functions for playing chess */

function makeMove(move) {
    /* set a flag indicating that movegen has not yet been called */
    legalMoves.generated = false;
    
    /* move the piece, remove the defender if necessary */
    if(move.defender) killPiece(move.dest);
    movePiece(move.source, move.dest, picSq.indexOf(move.source));
    
    /* special move stuff */
    if(wasKingsideCastle(move.source, move.dest)) { movePiece(move.dest + 1, move.dest - 1, picSq.indexOf(move.dest + 1)); }
    if(wasQueensideCastle(move.source, move.dest)) { movePiece(move.dest - 2, move.dest + 1, picSq.indexOf(move.dest - 2)); }
    if(wasEnPassantCapture(move.source, move.dest)) { killPiece(16 * getY(move.source) + getX(move.dest)); }
    gs.enPassant = wasDoublePawnMove(move.source, move.dest)? ((move.source + move.dest) / 2) : -1;
    if(move.promoteTo) { promote(move.dest, move.promoteTo); }
    
    /* change the color to move */
    gs.wtm = !gs.wtm;
    
    /* add the move to the movelist and internal history */
    history.pushback(move);
}

function unmakeMove() {
    /* set a flag indicating that movegen has not yet been called */
    legalMoves.generated = false;
    
    /* pop from the move history object */
    var n = history.pop(), enPassantDelta = 0;
    var move = history.moves[n];
    
    /* change the color to move */
    gs.wtm = !gs.wtm;
    
    if(move.promoteTo) { promote(move.dest, gs.wtm? 1 : -1); }
    gs.enPassant = ((n != 0) && wasDoublePawnMove(history.moves[n-1].source, history.moves[n-1].dest))? ((history.moves[n-1].source + history.moves[n-1].dest) / 2) : -1;
    if(wasEnPassantCapture(move.source, move.dest)) { enPassantDelta = 16 * (getY(move.source) - getY(move.dest)); }
    if(wasQueensideCastle(move.source, move.dest)) { movePiece(move.dest + 1, move.dest - 2, picSq.indexOf(move.dest + 1)); }
    if(wasKingsideCastle(move.source, move.dest)) { movePiece(move.dest - 1, move.dest + 1, picSq.indexOf(move.dest - 1)); }
    
    /* unmove the piece, replace the defender if necessary */
    movePiece(move.dest, move.source, picSq.indexOf(move.dest));
    if(move.defender) makePiece(move.dest + enPassantDelta, move.defender);
    
}

function promote(dest, promoteTo) {
    gs.board[dest] = promoteTo;
    var x = $( "#pc" + picSq.indexOf(dest) ).attr("src", "img/piece" + ((promoteTo > 0)? "1" : "0") + Math.abs(promoteTo) + ".png").removeClass("bigPiece");
    if(Math.abs(promoteTo) % 3 == 1) x.addClass("bigPiece");
}



/* these are general chess-related support functions */

function getAlgebra(square) {
    switch(getX(square)) {
        case 0: var algebra = "a"; break;   case 1: var algebra = "b"; break;   case 2: var algebra = "c"; break;   case 3: var algebra = "d"; break;
        case 4: var algebra = "e"; break;   case 5: var algebra = "f"; break;   case 6: var algebra = "g"; break;   case 7: var algebra = "h"; break;
    }
    return algebra + (8 - getY(square));
}

function isBigPiece(piece) { return (Math.abs(piece) % 3) == 1; }
function pieceInHand() { return movingData.ob != undefined; }
function notMyTurn(picId) { return ((gs.board[picSq[extractInt(picId)]] > 0) ^ !gs.wtm) != 1; }

function getX(sqIndex) { return sqIndex % 16; }
function getY(sqIndex) { return Math.round((sqIndex - getX(sqIndex)) / 16);}
function rotateIfBlack(coordinate) { return (playerColor == false)? 7 - coordinate : coordinate; }
function getRotatedX(dest, initial) { return rotateIfBlack(getX(dest)) - getX(initial); }
function getRotatedY(dest, initial) { return rotateIfBlack(getY(dest)) - getY(initial); }
function extractInt(stringIn) { return parseInt(stringIn.substr(2, stringIn.length - 2));}
function initialSquare(picId) { return picId + ((picId % 16 >= 8)? 8 : 0) + ((picId >= 16)? 80 : 0); }
function isDefined(move) { return move.x != undefined && move.y != undefined; }

function isNearWhole(locus) { var z = locus / sizeSquare; return (Math.abs(z - Math.round(z)) < 0.4); }
function isBound(locus, squareIndex) { var z = getWhole(locus) + squareIndex; return (z >= 0) && (z <= 7); }
function getWhole(locus) { return Math.round(locus / sizeSquare); }

function pieceType(square) { return Math.abs(gs.board[square]); }
function wasKingsideCastle(source, dest) { return (dest - source) == 2 && pieceType(dest) == 6; } /* note: called after king moved */
function wasQueensideCastle(source, dest) { return (source - dest) == 2 && pieceType(dest) == 6; } /* note: ditto */
function wasDoublePawnMove(source, dest) { return Math.abs(dest - source) == 32 && (pieceType(dest) == 1 || pieceType((source + dest) / 2) == 1); } /* note: ... */
function wasEnPassantCapture(source, dest) { return dest == gs.enPassant && pieceType(dest) == 1 ; } /* ... */
function isPromotion(move) { return (move.y == 0 || move.y == 7) && Math.abs(gs.board[move.source]) == 1; }
function canPlay() { return (playerColor == gs.wtm || !gameLive) && history.totalMoves == history.moveNum; }