var Primus = require('primus'),
	express = require('express'),
	http = require('http'),
	bodyParser = require('body-parser'),
	security = require('../controllers/security'),
	Role = require('../enums/Role'),
	logger = require('../util/logger');

function connectionHandler(spark) {
	logger.info("Connection:: ");

	if (!spark.djInfo) {
		spark.djInfo = spark.request.decoded;
	}
	connectedSparks[spark.djInfo._id] = spark.id;

	spark.on("error", function message(err) {
		console.log('Error: ', err);
	});

	spark.on('message', function(body) {
		if (spark.djInfo) {
			spark.write("Replying for now: ", body);
		} else {
			logger.error("Spark tried to talk to me without registering")
			spark.end()
		}
	});

	spark.on('data', function message(data) {
		data = JSON.parse(data);
		var messageType = data.type;
		if (data.type && data.body) {
			spark.emits(data.type, data.body);
		}
	});
}

function disconnectionHandler(spark) {
	console.log("disconnected connection ", spark.user.name);
	spark.leaveAll();
}

function errorHandler(err) {
	console.error('Something horrible has happened', err.stack);
}

function reconnectHandler(opts) {
	console.log('Reconnection attempt started');
}

var connectedSparks = {};

module.exports = function(server) {
	var self = this,
		wsServerOptions = {
			transformer: "sockjs",
			parser: 'JSON',
			authorization: security.authorizeWS(Role.DJ),
			pathname: '/ws',
			timeout: false
		},
		primus = new Primus(server, wsServerOptions);

	primus.on('connection', connectionHandler);
	primus.on('disconnection', disconnectionHandler);
	primus.on('error', errorHandler);
	primus.on('reconnect', reconnectHandler);

	self.sendMessageToDJBasedOnId = function(djId, message) {
		var sparkId = connectedSparks[djId];
		var spark = primus.spark(sparkId);
		spark.write(message);
	}
}