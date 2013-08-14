var nf = require('../nodefly');
var proxy = require('../proxy');
var samples = require('../samples');
var counts = require('../counts');
var tiers = require('../tiers');
var _ = require('underscore');
var topFunctions = require('../topFunctions');
var graphHelper = require('../graphHelper');


var internalCommands = [
	'_executeQueryCommand', 
	'_executeInsertCommand', 
	'_executeUpdateCommand', 
	'_executeRemoveCommand'
];

var commandMap = {
	'_executeQueryCommand': 'find', 
	'_executeInsertCommand': 'insert', 
	'_executeUpdateCommand': 'update', 
	'_executeRemoveCommand': 'remove'
};

var tier = 'mongodb';
function recordExtra(extra, timer) {
	if (extra) {

		extra[tier] = extra[tier] || 0;
		extra[tier] += timer.ms;

		if (extra.closed) {
			tiers.sample(tier + '_out', timer);
		}
		else {
			tiers.sample(tier + '_in', timer);
		}
	}
	else {
		tiers.sample(tier + '_in', timer);
	}
}

module.exports = function(mongodb) {
	internalCommands.forEach(function(internalCommand) {
		proxy.before(mongodb.Db.prototype, internalCommand, function(obj, args) {
			var command = args[0] || {};
			var options = args[1] || {};

			var cmd = commandMap[internalCommand];
			var query = JSON.stringify(command.query);
			var spec = JSON.stringify(command.spec);
			var q = query || spec || '{}';
			var collectionName = command.collectionName;

			var fullQuery = collectionName + '.' + cmd + '(' + q;


			var timer = samples.timer("MongoDB", commandMap[internalCommand]);
			var hasCb = _.any(args, function(arg) { return (typeof arg === 'function'); });

			var graphNode = graphHelper.startNode('MongoDB', fullQuery, nf);
			counts.sample('mongodb');

			if (!hasCb) {
				// updates and inserts are fire and forget unless safe is set
				// record these in top functions, just for tracking
				topFunctions.add('mongoCalls', fullQuery, 0);
				tiers.sample(tier + '_in', timer);
			}
			else {
				proxy.callback(args, -1, function(obj, args, extra, graph, currentNode) {
					timer.end();
					topFunctions.add('mongoCalls', fullQuery, timer.ms);

					recordExtra(extra, timer);

					graphHelper.updateTimes(graphNode, timer);
				});
			}

			if (graphNode) nf.currentNode = graphNode.prevNode;
		});
	}); // all commands
}; // require mongo








