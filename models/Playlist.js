//flush playlist
//flush votecounts
var mongoose = require('mongoose'),
	_ = require('underscore'),
	logger = require('../logger'),
	Song = require('./Song'),
	PlaylistState = require('../enums/PlaylistState');


var PlaylistSchema = new mongoose.Schema({
	name: String,
	genre: String,
	songs: [{
		details: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Song'
		},
		upvote_count: Number,
		state: String,
		type: String
	}]
});

var Playlist = mongoose.model("Playlist", PlaylistSchema);

var PlaylistManager = function() {
	var self = this;

	//sort songs by upvote count. if upvoteCount is missing, set to to 0
	function sortSongsByUpvoteCount(playlist) {
		return _.sortBy(playlist.songs, function(song) {
			return song.upvote_count;
		});
	}

	function pushSongsIfPOJO(playlist, newPlaylist) {
		_.each(playlist.songs, function(song, index, songs) {
			if (song.details && !((song.details instanceof mongoose.Types.ObjectId)) && song.details.name) {
				var songDetails = new Song(song.details);
				logger.debug('song Details', JSON.stringify(songDetails));
				song.details._id = songDetails._id;
				songDetails.save(function(err) {
					if (err) {
						logger.info('save failed: ', err);
						delete song.details._id;
					}
				});
			}
			if (song.details._id) {
				logger.debug('song already stored at : ' + song.details._id);
				newPlaylist.songs[index] = {
					details: song.details._id,
					state: song.state || 'QUEUED',
					type: song.type || 'NOT_FROZEN',
					upvote_count: song.upvote_count || 0
				};
			} else {
				logger.error("song could not be stored OR song with no song details found" + JSON.stringify(song));
			}
		});
	}

	function preProcess(playlist, newPlaylist) {
		pushSongsIfPOJO(playlist, newPlaylist);
		if (playlist && playlist.songs) {
			sortSongsByUpvoteCount(playlist);
		}
	}

	self.createPlaylist = function(playlist, cb) {
		var newPlaylist = new Playlist({
			name: playlist.name,
			genre: playlist.genre || '',
			state: playlist.state || PlaylistState.INACTIVE
		});
		preProcess(playlist, newPlaylist);

		newPlaylist.save(function(err, playlist) {
			if (err) {
				logger.error(err);
				cb(err);
			} else {
				logger.info('Playlist saved');
				cb(null, playlist);
			}
		});
		// Playlist.create(playlist, function(err, doc) {
		// 	if (err) {
		// 		logger.error(err.stack.split("\n"));
		// 		cb(err);
		// 	} else {
		// 		cb(null, doc);
		// 	}
		// });
	}

	self.findPlaylistById = function(playlistId, cb) {
		Playlist.findById(playlistId, function(err, playlist) {
			if (err) {
				logger.error(err.stack.split("\n"));
				cb(err);
			} else if (playlist) {
				cb(null, playlist);
			} else {
				cb('No playlist found');
			}
		});
	}

	self.updatePlaylistById = function(playlistId, playlist, cb) {
		preProcess(playlist);
		Playlist.findOneAndUpdate({
			_id: playlistId
		}, playlist, {
			upsert: false
		}, function(err, playlist) {
			if (err) {
				logger.error(err.stack.split("\n"));
				cb(err);
			} else {
				cb(null, playlist);
			}
		});
	}

	self.deletePlaylistById = function(playlistId, cb) {
		Playlist.findByIdAndRemove(playlistId, function(err) {
			if (err) {
				logger.error(err.stack.split("\n"));
			}
			cb(err);
		});
	}

	self.updateSongType = function(playlistId, songId, type, cb) {
		self.findPlaylistById(playlistId, function(err, playlist) {
			if (err) {
				logger.error(err.stack.split("\n"));
				cb(err);
			} else {
				var songIndex = _.findIndex(playlist.songs, function(song) {
					if (song.details && song.details._id && song.details._id === songId) {
						return true;
					}
					return false;
				});
				playlist.songs[songIndex].type = type;
				this.updatePlaylistById(playlistId, playlist, function(err) {
					logger.error(err.stack.split("\n"));
					cb(err);
				});
			}
		});
	}

	self.updateSongState = function(playlistId, songId, state, cb) {
		self.findPlaylistById(playlistId, function(err, playlist) {
			if (err) {
				logger.error(err.stack.split("\n"));
				cb(err);
			} else {
				var songIndex = _.findIndex(playlist.songs, function(song) {
					if (song.details && song.details._id && song.details._id === songId) {
						return true;
					}
					return false;
				});
				playlist.songs[songIndex].state = state;
				this.updatePlaylistById(playlistId, playlist, function(err) {
					logger.error(err.stack.split("\n"));
					cb(err);
				});
			}
		});
	}

	self.upvoteSong = function(playlistId, songId, cb) {
		self.findPlaylistById(playlistId, function(err, playlist) {
			if (err) {
				logger.error(err.stack.split("\n"));
				cb(err);
			} else {
				var songIndex = _.findIndex(playlist.songs, function(song) {
					if (song.details && song.details._id && song.details._id === songId) {
						return true;
					}
					return false;
				});
				playlist.songs[songIndex].upvote_count = playlist.songs[songIndex].upvote_count + 1;
				this.updatePlaylistById(playlistId, playlist, function(err) {
					logger.error(err.stack.split("\n"));
					cb(err);
				});
			}
		});
	}
}

module.exports = new PlaylistManager();