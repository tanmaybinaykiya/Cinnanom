var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/grep');
var db = mongoose.connection;


db.on('error', function() {
	logger.info('connection error');
	cleanup();
});

db.once('open', function(callback) {
	logger.info("DB Setup Successful");
	saveBar();
});

var FooSchema = new mongoose.Schema({
	name: String,
	year: Number
});

var Foo = mongoose.model('Foo', FooSchema);

var BarSchema = new mongoose.Schema({
	name: String,
	foo: [{
		details: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Foo'
		},
		count: Number
	}]
});

var Bar = mongoose.model('Bar', BarSchema);

function saveBar() {
	var newBar = new Bar({
		name: "bar",
		foo: [{
			details: {
				name: "foo",
				year: 2015
			},
			count: 0
		}, {
			details: {
				name: "foo1",
				year: 2014
			},
			count: 1
		}, {
			details: {
				name: "foo2",
				year: 2013
			},
			count: 2
		}]
	});
	id = newBar._id;
	newBar.save(function(err) {
		console.log("err:", err);
		getBar();
	});
}

function getBar() {
	Bar.find({
			_id: id
		})
		.exec(function(err, doc) {
			console.log("get ", err, doc);
		});
}