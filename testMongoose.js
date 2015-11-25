var mongoose = require('mongoose');
var _ = require('underscore');

var Song = require('./models/Song')

mongoose.connect('mongodb://localhost/test');
var db = mongoose.connection;


db.on('error', function() {
	console.log('connection error');
});

db.once('open', function(callback) {
	console.log("DB Setup Successful");
	saveBar();
});

// var FooSchema = new mongoose.Schema({
// 	name: String,
// 	year: Number
// });

// var Foo = mongoose.model('Foo', FooSchema);

// var BarSchema = new mongoose.Schema({
// 	name: String,
// 	foo: [{
// 		details: {
// 			type: mongoose.Schema.Types.ObjectId,
// 			ref: 'Foo'
// 		},
// 		count: Number
// 	}],
// 	songs: [{
// 		type: mongoose.Schema.Types.ObjectId,
// 		ref: 'Song'
// 	}]
// });

// var Bar = mongoose.model('Bar', BarSchema);

function saveBar() {

	// var foo0 = {
	// 	name: "foo",
	// 	year: 2015
	// };
	// foo0 = new Foo(foo0);
	// foo0.save();
	// console.log("foo0[", typeof foo0, "]", foo0);
	// var foo = new Foo({
	// 	name: "foo",
	// 	year: 2015
	// });

	// foo.save();
	// console.log("foo", foo);
	// var foo1 = new Foo({
	// 	name: "foo1",
	// 	year: 2015
	// });
	// foo1.save();
	// var foo2 = new Foo({
	// 	name: "foo2",
	// 	year: 2015
	// });
	// foo2.save();
	// var newBar = new Bar({
	// 	name: "bar",
	// 	foo: [],
	// 	songs: []
	// });

	// newBar.songs.push(song);

	// newBar.foo.push({
	// 	details: foo0._id,
	// 	count: 0
	// });

	// newBar.foo.push({
	// 	details: foo._id,
	// 	count: 0
	// });

	// newBar.foo.push({
	// 	details: foo2._id,
	// 	count: 2
	// });

	// newBar.foo.push({
	// 	details: foo1._id,
	// 	count: 1,

	// });

	// id = newBar._id;
	// console.log(newBar);

	var song = Song.create({
		name: "String",
		genre: "String",
		artist: "String",
		album: "String",
		year: 2010,
		composer: "String",
		lyrics: "String",
		duration: 120 // [seconds]
	}/*, function(err, ssong){
		console.log(err, ssong);
	}*/);

	song.then(function(ssong){
		console.log("zzzzzzzzzzzzzz:",ssong);
	});



	// newBar.save(function(err) {
	// 	console.log("err:", err);
	// 	getBar();
	// });
}

// function getBar() {
// 	Bar.find({
// 			_id: id
// 		}).populate('foo')
// 		.exec(function(err, doc) {
// 			console.log("get ", err, doc);
// 		});
// }