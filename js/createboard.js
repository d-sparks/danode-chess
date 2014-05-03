/****************************************************************
 *  file:       createboard.js                                  *
 *  author:     daniel sparks                                   *
 *  purpose:    writes a chessboard to the html, for use with   *
 *              chessclient.js.                                 *
 ****************************************************************/



if(size == undefined) var size = 550;
if(lightColor == undefined) var lightColor = "ffffdd";
if(darkColor == undefined) var darkColor = "cc9966";
if(interactive == undefined) var interactive = false;
 
size = size - (size % 8);
var sizeSquare = Math.round(size / 8);
var sizePiece = Math.round(0.8 * sizeSquare);
size = 8 * sizeSquare;

document.write("<style>");
document.write("table.chessboard { width: " + size + "; height: " + size + ";}");
document.write("td.light { width: " + sizeSquare + "; height: " + sizeSquare + "; background-color: " + lightColor + "; text-align: center;}");
document.write("td.dark { width: " + sizeSquare + "; height: " + sizeSquare + "; background-color: " + darkColor + "; text-align: center;}");
document.write(".piece { width: " + sizePiece + "; height: " + sizePiece + "; visibility: visible; opacity: 1; position: relative; transition: all .325s ease-in-out;}");
document.write(".piece.hidden { opacity: 0; visibility: hidden; transition: all .325s linear;}");
document.write(".piece.bigPiece { width: " + Math.round(0.8 * sizePiece) + "; height: " + Math.round(0.9 * sizePiece) + ";}");
document.write(".inHand {transition: all 0s linear; z-index: 1001;}");
document.write(".snap {transition: left .1s ease-in-out, top .1s ease-in-out; z-index: 1000; }")
document.write(".slow {transition: all 1s ease-in-out;}")
document.write(".slow.hidden {transition: all 1s ease-in-out;}")
document.write("</style>");

document.write("<table class='chessboard' cellpadding='0' cellspacing='0'>");
for(var x = 0, sq; x < 8; x++) {
    document.write("<tr>");
    for(var y = 0, sq = 8 * x + y; y < 8; y = y + 1, sq = 8 * x + y) {
        document.write("<td class='" + ((((x + y) % 2) == 0)? "light" : "dark") + "' id='tb" + sq + "' valign='center'>");
        if(x <= 1) document.write("<img class='piece' style='left: 0; top: 0' id='pc" + sq + "' draggable='false'>");
        if(x >= 6) document.write("<img class='piece' style='left: 0; top: 0' id='pc" + (sq - 32) + "' draggable='false'>");
        document.write("</td>");
    }
    document.write("</tr>");
}
document.write("</table>");
