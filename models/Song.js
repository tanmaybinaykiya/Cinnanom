var mongoose = require('mongoose');

var SongSchema = new mongoose.Schema({
	name: String,
	genre: String,
	artist: String,
	album: String,
	year: Number,
	composer: String,
	lyrics: String
});

module.exports = mongoose.model("Song", SongSchema);