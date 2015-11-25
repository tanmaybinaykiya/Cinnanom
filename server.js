var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
// mongoose.Promise = global.Promise;

var apiHandler = require('./apiHandler');

dbConnTimeout = setTimeout(function() {
	console.log("Failed to set up DB in 5 seconds");
	process.kill();
}, 5000);
console.log("Setting up DB...");
mongoose.connect('mongodb://localhost/grep');
var db = mongoose.connection;
var app;

function configureDb(db) {
	db.on('error', function() {
		console.log('connection error');
		cleanup();
	});

	db.once('open', function(callback) {
		console.log("DB Setup Successful");
		clearTimeout(dbConnTimeout);
		configureApp();
		startApp();
	});
}


function configureApp() {
	console.log("Setting up App...");
	app = express();

	var port = process.env.PORT || 8080; // set our port
	app.set('port', port);
	app.use(bodyParser.urlencoded({
		extended: true
	}));
	app.use(bodyParser.json());
	app.use('/api', apiHandler);

	console.log("App setup Successful");
}

function startApp() {
	console.log("Starting up App...");
	app.listen(app.get('port'));
	console.log("App is now listening at", app.get('port'));
}

function cleanup() {
	mongoose.disconnect();
}

configureDb(db);