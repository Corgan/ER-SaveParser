const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const port = process.argv[2] || 8080;

http.createServer(function (req, res) {
  console.log(`${req.method} ${req.url}`);
  const parsedUrl = url.parse(req.url);
  let pathname = `.${parsedUrl.pathname}`;

  if(!parsedUrl.pathname.startsWith('/src/')) {
    if(parsedUrl.pathname.indexOf('/src/') > -1) {
        pathname = '.' + parsedUrl.pathname.slice(parsedUrl.pathname.indexOf('/src/'));
    } else {
        pathname = './index.html'
    }
  }
  const ext = path.parse(pathname).ext;
  const map = {
    '.html': 'text/html',
    '.js': 'text/javascript'
  };

  fs.exists(pathname, function (exist) {
    if(!exist || fs.statSync(pathname).isDirectory()) {
      res.statusCode = 404;
      return;
    }

    fs.readFile(pathname, function(err, data){
      if(err){
        res.statusCode = 500;
        res.end(`Error getting the file: ${err}.`);
      } else {
        res.setHeader('Content-type', map[ext] || 'text/plain' );
        res.end(data);
      }
    });
  });


}).listen(parseInt(port));

console.log(`Server listening on port ${port}`);