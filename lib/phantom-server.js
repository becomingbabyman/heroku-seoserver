var page = require('webpage').create();
page.settings.loadImages = false;
// page.settings.localToRemoteUrlAccessEnabled = true;
page.viewportSize = { width: 1024, height: 768 };

var system = require('system');



//
// SEOSERVER
//

// var debug = true;

// var lastReceived = new Date().getTime();
// var requestCount = 0;
// var responseCount = 0;
// var requestIds = [];
// var requestTimes = {};

// var startTime = new Date().getTime();


// page.onResourceReceived = function (response) {
//   if(requestIds.indexOf(response.id) !== -1) {
//     lastReceived = new Date().getTime();
//     if(debug) {
//       console.log("time:",response.url,":",lastReceived-requestTimes[response.id],":",requestTimes[response.id]-startTime,"-",lastReceived-startTime);
//     }
//     responseCount++;
//     requestIds[requestIds.indexOf(response.id)] = null;
//   }
// };
// page.onResourceRequested = function (request) {
//   if(requestIds.indexOf(request.id) === -1) {
//     requestIds.push(request.id);
//     requestCount++;
//     if(debug) {
//       requestTimes[request.id] = new Date().getTime();
//     }
//   }
// };

// page.onError = function (msg, trace) {
//   if(debug) {
//     console.log("error: " + msg);
//   }
// };
// page.onConsoleMessage = function(message) {
//   if(debug) {
//     console.log("message: " + message);
//   }
// };

// page.open(system.args[1], function () {

// });

// var checkComplete = function () {
//   if(new Date().getTime() - lastReceived > 500 && requestCount === responseCount)  {
//     clearInterval(checkCompleteInterval);
//     console.log(page.content);
//     phantom.exit();
//   } else {
//   }
// }

// var checkCompleteInterval = setInterval(checkComplete, 1);





//
// ANGULAR SEO
//
page.onCallback = function() {
	console.log(page.content);
	phantom.exit();
	// page.close();
};
// page.onConsoleMessage = function(msg, lineNum, sourceId) {
// 	console.log('CONSOLE: ' + msg + ' (from line #' + lineNum + ' in "' + sourceId + '")');
// };
page.onInitialized = function() {
  page.evaluate(function() {
		document.addEventListener('__htmlReady__', function() {
			window.callPhantom();
		}, false);
		setTimeout(function() {
			window.callPhantom();
		}, 10000);
	});
};
page.open(system.args[1], function () {
	
});

