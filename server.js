var express = require('express');
var apiHandler = require('./apiHandler');

var app = express();
var port = process.env.PORT || 8080;        // set our port

// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());
app.use('/api',apiHandler);	

app.listen(port);