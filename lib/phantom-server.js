var system = require('system');
var maxWait = 10000;
var page = require('webpage').create();
page.settings.loadImages = false;
page.viewportSize = { width: 1024, height: 768 };


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
		}, maxWait);
	});
};
page.open(system.args[1], function () {

});

