/****************************************************************
 *  file:       movelist.js                                     *
 *  author:     daniel sparks                                   *
 *  purpose:    functions relating to the visual movelist.      *
 ****************************************************************/



function writeToMovelist(move, moveNum) {
    /* on the first move, format the movelist */
    if(moveNum == 0) initializeMovelist();
    if(moveNum % 2 == 0) moveList.write("</tr><tr id='rw" + moveNum + "'><td width='29' id='lbl" + moveNum + "'>" + (moveNum / 2 + 1) + ". </td>");
    moveList.write("<td class='move' width='100' id='mv" + moveNum + "' onclick='parent.goToMove(" + (moveNum + 1) + ")'>");
    moveList.write(getAlgebra(move.source) + "-" + getAlgebra(move.dest) + "</td>");
}

function selectMove(moveNum) {
    $( "#movelist" ).contents().find( ".move" ).removeClass("selected");
    $( "#movelist" ).contents().find( "#mv" + moveNum ).addClass("selected");    
}

function initializeMovelist() {
    moveList.close();
    moveList.open();
    moveList.write("<style>                                                                         ");
    moveList.write("td {                    font-family:        verdana, helvetica, arial;          ");
    moveList.write("                        font-size:          10pt;                               ");
    moveList.write("                        text-align:         center;                             ");
    moveList.write("                        padding-top:        2px;                                ");
    moveList.write("                        padding-bottom:     3px;                                ");
    moveList.write("                        cursor:             default;                        }   ");
    moveList.write("td.move {               background-color:   ffffff;                         }   ");
    moveList.write("td.move:hover {         background-color:   cfffcf;                         }   ");
    moveList.write(".move.selected {        background-color:   efefef;                         }   ");
    moveList.write(".move.selected:hover {  background-color:   efefef;                         }   ");
    moveList.write("</style>                                                                        ");
    moveList.write("<div style='visibility: hidden' id='hiddenMoveNum'></div>                       ");
    moveList.write("<table width='229' cellpadding='0' cellspacing='0' border='0'>                  ");
}

function goToMove(targetMoveNum) {
    if(gameLive) return;
    if(Math.abs(targetMoveNum - history.moveNum) > 1) {
        $( '[id*="pc"]' ).addClass("slow");
        setTimeout( function() { $( 'img[id*="pc"]' ).removeClass("slow"); }, 1000)
    }
    if(targetMoveNum < 0 || targetMoveNum > history.totalMoves) return;
    while(history.moveNum != targetMoveNum)
        (targetMoveNum > history.moveNum)? makeMove(history.moves[history.moveNum]) : unmakeMove();
}