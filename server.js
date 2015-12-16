"use strict";
var express = require('express'),
	http = require('http'),
	bodyParser = require('body-parser'),
	mongoose = require('mongoose'),
	logger = require('./util/logger'),
	apiHandler = require('./lib/apiHandler'),
	wsServer = require('./lib/wsServer');

var dbConnTimeout = setTimeout(function () {
	logger.error("Failed to set up DB in 5 seconds");
	process.kill();
}, 5000);
logger.info("Setting up DB...");
mongoose.connect('mongodb://localhost/grep');
var db = mongoose.connection,
	app, 
	server,
	myIP='127.0.0.1';

function errorHandler(err, req, res, next) {
  res.status(500);
  res.render('error', { error: err });
}

function cleanup() {
	mongoose.disconnect();
}

function configureApp() {
	logger.info("Setting up App...");
	app = express();

	var port = process.env.PORT || 80; // set our port
	app.set('port', port);
	app.disable('x-powered-by');
	app.use(bodyParser.urlencoded({
		extended: true
	}));
	app.use(bodyParser.json());
	app.use('/api', apiHandler);
	app.use(errorHandler);

	app.on('error',function () {
		logger.error('connection error');
		cleanup();
	});
	server=http.createServer(app)
	logger.info("App setup Successful");
}

function configureWS(){
	logger.info("configuring WS... ");
	var WS = new wsServer(server);
	logger.info("configured WS Successfully");
}

function startApp() {
	logger.info("Starting up App...");
	server.listen(app.get('port'), myIP);
	logger.info("App is now listening at", app.get('port'));
	configureWS();
}

function configureDb(db) {
	db.on('error', function () {
		logger.error('connection error');
		cleanup();
	});

	db.once('open', function (callback) {
		logger.info("DB Setup Successful");
		clearTimeout(dbConnTimeout);
		configureApp();
		startApp();
	});
}

configureDb(db);
