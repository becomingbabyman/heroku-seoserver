var nf;

var stats = require('./node-measured').createCollection('tiers');

exports.init = function() {
	nf = global.nodefly;
	start();
}

exports.sample = function(code,time) {
	stats.aggregator(code).mark(time.ms);
}

function start() {
	setInterval(function(){
		var data = stats.toJSON();
		//data._ts = nf.millis();
		nf.emit('tiers', data);
		stats.reset();
	}, 15*1000);
}