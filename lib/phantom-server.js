var page = require('webpage').create();
var system = require('system');

var debug = false;

var lastReceived = new Date().getTime();
var requestCount = 0;
var responseCount = 0;
var requestIds = [];
var requestTimes = {};

var startTime = new Date().getTime();

page.settings.loadImages = false
page.viewportSize = { width: 1024, height: 768 };

page.onResourceReceived = function (response) {
  if(requestIds.indexOf(response.id) !== -1) {
    lastReceived = new Date().getTime();
    if(debug) {
      console.log("time:",response.url,":",lastReceived-requestTimes[response.id],":",requestTimes[response.id]-startTime,"-",lastReceived-startTime);
    }
    responseCount++;
    requestIds[requestIds.indexOf(response.id)] = null;
  }
};
page.onResourceRequested = function (request) {
  if(requestIds.indexOf(request.id) === -1) {
    requestIds.push(request.id);
    requestCount++;
    if(debug) {
      requestTimes[request.id] = new Date().getTime();
    }
  }
};

page.onError = function (msg, trace) {
  if(debug) {
    console.log("error: " + msg);
  }
};
page.onConsoleMessage = function(message) {
  if(debug) {
    console.log("message: " + message);
  }
};

page.open(system.args[1], function () {

});

var checkComplete = function () {
  if(new Date().getTime() - lastReceived > 500 && requestCount === responseCount)  {
    clearInterval(checkCompleteInterval);
    console.log(page.content);
    phantom.exit();
  } else {
  }
}
var checkCompleteInterval = setInterval(checkComplete, 1);
