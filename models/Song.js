var mongoose = require('mongoose');

var SongSchema = new mongoose.Schema({
	name: String,
	genre: String,
	artist: String,
	album: String,
	year: Number,
	composer: String,
	lyrics: String,
	duration: Number // [seconds]
});

module.exports = mongoose.model('Song', SongSchema);