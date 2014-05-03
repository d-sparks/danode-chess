/****************************************************************
 *	file:		router.js									    *
 *	author:		daniel sparks								    *
 *	purpose:	there is a separate routing function for now,   *
 *              even though there is only one file to serve.    *
 ****************************************************************/



var fs = require('fs');
var url = require('url');


 
exports.route = function(request, response) {
	var correctPath = '.' + url.parse(request.url).pathname;
	if(correctPath == './') correctPath = './chess.html';
	fs.readFile(correctPath, function(error, file) {
		if(error) {
			response.writeHead(404, {"Content-Type": "text/html"});
			response.end('404');
		} else {
			response.writeHead(200, {"Content-Type": "text/html"});
			response.end(file);
		}
	});
	
	if(correctPath != '/favicon.ico') console.log('Request received for ' + correctPath);
}