var mongoose = require('mongoose'),
	logger = require('../logger');

var SongSchema = new mongoose.Schema({
	song_name: String,
	song_genre: String,
	song_artist: String,
	song_album: String,
	song_year: Number,
	song_composer: String,
	song_lyrics: String,
	song_duration: Number // [seconds]
}, {
	strict: true
});

var Song = mongoose.model("Song", SongSchema);

var SongManager = function() {
	var self = this;

	self.create = function(song, cb) {
		Song.create(song, function(err, song) {
			cb(err, song);
		});

	};
};

module.exports = new SongManager();