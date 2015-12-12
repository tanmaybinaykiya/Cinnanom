"use strict";
var express = require('express'),
	bodyParser = require('body-parser'),
	mongoose = require('mongoose'),
	logger = require('./util/logger'),
	apiHandler = require('./apiHandler');

var dbConnTimeout = setTimeout(function () {
	logger.error("Failed to set up DB in 5 seconds");
	process.kill();
}, 5000);
logger.info("Setting up DB...");
mongoose.connect('mongodb://localhost/grep');
var db = mongoose.connection;
var app;

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

	var port = process.env.PORT || 8080; // set our port
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
	logger.info("App setup Successful");
}

function startApp() {
	logger.info("Starting up App...");
	app.listen(app.get('port'));
	logger.info("App is now listening at", app.get('port'));
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