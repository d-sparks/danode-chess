/****************************************************************
 * file:        movegen.js                                      *
 * author:      dan sparks                                      *
 * purpose:     generates the legal chess moves in a given      *
 *              position.                                       *
 ****************************************************************/
 
var PAWN = 1, KNIGHT = 2, BISHOP = 3, ROOK = 4, QUEEN = 5, KING = 6;

/* note: the program expects a move object to contain the following:
    - source square "source"
    - destination square "dest"
    - attacking piece type "attacker"
    - defending piece type "defender"
    - promote to piece type "promoteTo"     */

 
/* generates the legal moves in a given position */
function movegen() {
    
    /* create an empty movelist */
    var moves = [];

    /* the gamestate is stored in the "0x88" format, an array with 127 entries */
    for(var square = 0; square < 127; square++) {
        
        /* check if the square is on the board, and whether the active player has a piece on it */
        if(!isLegal(square) || !isOccupiedBy(square, gs.wtm)) continue;
        
        /* determine which type of piece is on the given square */
        switch(pieceType(square)) {
            
        case PAWN:      moves = moves.concat(pawngen(square));                      break;
        case KNIGHT:    moves = moves.concat(knightgen(square));                    break;
        case BISHOP:    moves = moves.concat(bishopgen(square));                    break;
        case ROOK:      moves = moves.concat(rookgen(square));                      break;
        case QUEEN:     moves = moves.concat(rookgen(square), bishopgen(square));   break;
        case KING:      moves = moves.concat(kinggen(square));                      break;
        
        }    

    }
    
    /* return the completed movelist as an array */
    return moves;
}


/* generates the pawn moves of for a pawn on a given square */
function pawngen(sq) {
    var rankShift = (gs.wtm? -16 : 16), moves = [], dest;
    
    /* a concise way of handling pawn promotion generation */
    if(isPromotingRank(sq, gs.wtm)) var promoData = { 'num' : 4 , 'delta' : 1 };
    else var promoData = { 'num' : 1, 'delta' : 0 };
    
    /* first try to move one rank forward or back */
    dest = sq + rankShift;
    if(isEmpty(dest)) {
        moves = moves.concat(pawnpush(sq, dest, promoData));
        
        /* check whether a double pawn move is a possibility */
        dest += rankShift;
        if(isInitialRank(sq, gs.wtm) && isEmpty(dest)) moves.push(getMove(sq, dest, 0));
    }
    
    /* capture left (including en passant) */
    dest = sq + rankShift - 1;
    if(isLegal(dest) && (isOccupiedBy(dest, !gs.wtm) || gs.enPassant == dest)) moves = moves.concat(pawnpush(sq, dest, promoData));
    
    /* capture right (including en passant)  */
    dest = sq + rankShift + 1;
    if(isLegal(dest) && (isOccupiedBy(dest, !gs.wtm) || gs.enPassant == dest)) moves = moves.concat(pawnpush(sq, dest, promoData));
    
    return moves;
}

/* a support function for pawngen, which helps with pawn promotion */
function pawnpush(source, dest, promoData) {
    for(var x = 0, y = 2 * promoData.delta, moves = []; x < promoData.num; x++, y += promoData.delta) moves.push(getMove(source, dest, y));
    return moves;
}

/* generates the knight moves for a knight on a given square */

function knightgen(sq) {
    var moves = [], moveDeltas = [33, 31, 18, 14, -14, -18, -31, -33];
    
    /* cycle through the 8 knight move directions, and check if the move is OK */
    for(var x = 0; x < 8; x++) {
        dest = sq + moveDeltas[x];
        if(isLegal(dest) && !isOccupiedBy(dest, gs.wtm)) moves.push(getMove(sq, dest, 0));
    }
    
    return moves;
}

/* generates the pseudolegal  moves from a given square */
function bishopgen(sq) {
    var moveDeltas = [15, 17, -15, -17];
    return slidingPieceGen(sq, moveDeltas);
}

/* generates the pseudolegal  moves from a given square */
function rookgen(sq) {
    var moveDeltas = [16, 1, -1, -16];
    return slidingPieceGen(sq, moveDeltas);
}

/* generates the pseudolegal sliding moves from a given square */
function slidingPieceGen(sq, moveDeltas) {
    var moves = [];
    
    /* cycle through the four possible directions */
    for(var direction = 0; direction < 4; direction++) {
        
        /* continue adding moves in that direction until the board runs out, or we hit a piece */
        for(var dest = sq + moveDeltas[direction]; true; dest += moveDeltas[direction]) {
            if(!isLegal(dest)) break;
            if(!isOccupiedBy(dest, gs.wtm)) moves.push(getMove(sq, dest, 0));
            if(!isEmpty(dest)) break;
        }
    }
    
    return moves;
}

/* generates the king moves from a given square */
function kinggen(sq) {
    var moves = [], dest, moveDeltas = [16, 17, 1, -15, -16, -17, -1, 15];
    
    /* the eight directional moves are generated in the usual way */
    for(var direction = 0; direction < 8; direction++) {
        dest = sq + moveDeltas[direction];
        if(isLegal(dest) && !isOccupiedBy(dest, gs.wtm)) moves.push(getMove(sq, dest, 0));
    }
    
    /* now castling is checked */
    // if(castling conditions) add castling moves
    
    return moves;
}

/* makes a move object for a given source and destination */
function getMove(source, dest, promoteTo) {
    var move = {'source' : source, 'dest' : dest, 'attacker' : gs.board[source], 'promoteTo' : promoteTo };
    move.defender = gs.board[dest];
    if(gs.enPassant == dest && pieceType(source) == PAWN) move.defender = gs.wtm? PAWN : -PAWN;
    return move;
}

// function pieceType(square) [ see chessclient.js ]
function isLegal(square) { return (square & 136) == 0; }
function isEmpty(square) { return gs.board[square] == 0; }
function isOccupiedBy(square, color) { return (gs.board[square] != 0) && (((gs.board[square] < 0) ^ color) == 1); }
function isPromotingRank(square, color) { return (getY(square) == 1 && color) || (getY(square) == 6 && !color); }
function isInitialRank(square, color) { return isPromotingRank(square, !color); }