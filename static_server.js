var http = require("http"),
  url = require("url"),
  path = require("path"),
  fs = require("fs"),
port = process.argv[2] || 8888;

http.createServer(function(request, response) {

  var uri = url.parse(request.url).pathname
    , filename = path.join(process.cwd(), uri);

  if (uri === "/get/children/") {
    var query = url.parse(request.url, true).query, result = [];
    if (query.id === "#") {
      result.push({
        "text": "Root",
        "children": true
      });
    } else {
      result.push({
        "text": "newNode",
        "children": true
      });
    }

    response.writeHead(200, {"Content-Type": "application/json; charset=utf-8"});
    response.write(JSON.stringify(result));
    response.end();
    return;
  }

  path.exists(filename, function(exists) {
    if(!exists) {
      response.writeHead(404, {"Content-Type": "text/html"});
      response.write("404 Not Found\n");
      response.end();
      return;
    }

    if (fs.statSync(filename).isDirectory()) filename += '/index.html';

    fs.readFile(filename, "binary", function(err, file) {
      if(err) {
        response.writeHead(500, {"Content-Type": "text/html"});
        response.write(err + "\n");
        response.end();
        return;
      }
      console.log('write 200');
      response.writeHead(200);
      response.write(file, "binary");
      response.end();
    });
  });
}).listen(parseInt(port, 10));

console.log("Static file server running at\n  => http://localhost:" + port + "/\nCTRL + C to shutdown")