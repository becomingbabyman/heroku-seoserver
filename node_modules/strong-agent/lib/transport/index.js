function debug(format, args) {
	var args = ['NODEFLY TRANSPORT: ' + format].concat(args || []);
	if (/transport/.test(process.env.NODEFLY_DEBUG) ) {
		console.log.apply(console, args);
	}
}

var timeout = 5000;

var retryStart = 100;
var retry = 100;
var maxRetry = 10000;

var util = require('util');
var request = require('request');

var apiVersion = 'v1';

var agent;
var agentVersion;
var config = global.nodeflyConfig;

function Transport() {
	this.sessionId = null;
}

Transport.prototype._send = function(url, update) {
	var self = this;

	if (!self.sessionId) {
		self.getSession(function() {
			self._send(url, update);
		});
		return;
	}

	var postData = {
		data: update,
		hostname: agent.hostname,
		appName: agent.appName,
		agentVersion: agentVersion,
		sessionId: this.sessionId
	};

	var body = '';
	try {
		body = JSON.stringify(postData);
	}
	catch (err) {
		console.log('Problem stringify-ing data to send to NodeFly');
	}

	var options = {
		url: url,
		body: body,
		headers: {
			'Content-type': 'application/json'
		}
	};

	request.post(options, function(err, res, body) {
		if (err) {
			console.log('NodeFly transport error:\n', err);
		}
		else {
			if (res.statusCode && res.statusCode != 202) {
				debug('unexpected status fo %s: ', [url, res.statusCode]);
			}
		}
	});
}


Transport.prototype.getSession = function(callback) {
	var self = this;

	// we already have a session ID
	if (self.sessionId) {
		console.log('have session')
		return callback(self.sessionId);
	}

	// we are trying to retrieve the session already just come back later for it
	if (self.retrievingSession) {
		return setTimeout(function() {
			self.getSession(callback);
		}, 100);
	}

	self.retrievingSession = true;

	var options = {
		url: config.server + '/' + apiVersion + '/' + agent.key + '/session',
		timeout: timeout,
		json: {
			hostname: agent.hostname,
			appName: agent.appName,
			agentVersion: agentVersion
		}
	};

	request.post(options, function(err, res, body) {
		if (err) {
			console.log('NODEFLY ERROR: could not establish session\n', err);
			self.sessionId = null;
			self.retrievingSession = false;
		}
		else {
			if (res.statusCode && res.statusCode != 201) {
				console.log('NODEFLY ERROR: could not establish session (%s)\n', res.statusCode || 0, res.body);
			}
			else {
				/*
				var data = {};
				try {
					data = JSON.parse(body);
				}
				catch(err) {
					console.log('Could not parse NodeFly session data\n', body);
					return;
				}
				*/
				var data = body;
				self.sessionId = agent.sessionId = data.sessionId;
				agent.appHash = data.appHash;
				self.retrievingSession = false;
				callback(self.sessionId);
			}
		}
	});
}

Transport.prototype.update = function(update) {
	var url = config.server + '/' + apiVersion + '/' + agent.key + '/update';
	this._send(url, update);
};

Transport.prototype.instances = function(update) {
	var url = config.server + '/' + apiVersion + '/' + agent.key + '/instances';
	this._send(url, update);
};

Transport.prototype.topCalls = function(update) {
	var url = config.server + '/' + apiVersion + '/' + agent.key + '/topCalls';
	this._send(url, update);
};

exports.init = function(options) {
	agent = options.agent;
	agentVersion = options.agentVersion;
	var transport = new Transport();
	transport.getSession(function(){ /* do nothing */});
	return transport;
}

