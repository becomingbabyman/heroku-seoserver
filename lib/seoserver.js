require('newrelic');
var express = require('express');
var app = express();
var arguments = process.argv.splice(2);
var port = arguments[0] !== 'undefined' ? arguments[0] : 4000;
var clientHost = arguments[1] !== 'undefined' ? arguments[1] : "example.com";

var getContent = function(url, callback) {
  var content = '';
  var phantom = require('child_process').spawn('phantomjs', [__dirname + '/phantom-server.js', url]);
  phantom.stdout.setEncoding('utf8');
  phantom.stdout.on('data', function(data) {
    content += data.toString();
  });
  phantom.stderr.on('data', function (data) {
  console.log('stderr: ' + data);
});
  phantom.on('exit', function(code) {
    if (code !== 0) {
      console.log('We have an error');
    } else {
      callback(content);
    }
  });
};

var respond = function (req, res) {
  // process.nextTick();
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");

  var url;
  if(req.headers.referer)
    url = req.headers.referer;
  // if(clientHost !== 'example.com' || url === null)
  //   url = 'http://' + clientHost + req.url;
  if(req.headers['x-forwarded-host'])
    url = 'http://' + req.headers['x-forwarded-host'] + req.url;

  console.log('url:', url);
  getContent(url, function (content) {
    res.send(content);
  });

}


console.log("port:", port)
console.log("clientHost:", clientHost)

app.get(/(.*)/, respond);
app.listen(port);

console.log("SeoServer successfully started")
