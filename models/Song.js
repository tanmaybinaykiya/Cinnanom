var mongoose = require('mongoose');

var SongSchema = new mongoose.Schema({
	song_name: String,
	song_genre: String,
	song_artist: String,
	// song_album: String,
	// song_year: Number,
	// song_composer: String,
	// song_lyrics: String,
	// song_duration: Number // [seconds]
}, {
	strict: true
});

var Song = mongoose.model("Song", SongSchema);

var SongManager = function() {
	var self = this;

	self.create = function(song, cb) {
		Song.create(song)
			.then(function(song) {
				console.log(song);
				cb(null, song);
			}, function(err) {
				cb(err);
			});

	};
};

module.exports = new SongManager();