//flush playlist
//flush votecounts
var mongoose = require('mongoose'),
	_ = require('underscore'),
	logger = require('../logger'),
	Song = require('./Song'),
	SongState = require('../enums/SongState'),
	SongKind = require('../enums/SongType'),
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
		kind: String
	}]
}, {
	strict: true
});


var Playlist = mongoose.model("Playlist", PlaylistSchema);

var PlaylistManager = function() {
	var self = this;

	//sort songs by upvote count. if upvoteCount is missing, set to to 0
	function sortSongsByUpvoteCount(playlist) {
		return _.sortBy(playlist.songs, function(song) {
			if (!song.upvote_count) {
				song.upvote_count = 0;
			}
			return song.upvote_count;
		});
	}

	function pushNewSongs(playlist, newPlaylist, cb) {

	}

	self.createPlaylist = function(playlist, cb) {
		var newPlaylist = new Playlist({
			name: playlist.name || '',
			genre: playlist.genre || '',
			songs: []
		});

		sortSongsByUpvoteCount(playlist);

		_.each(playlist.songs, function(song, index, list) {
			if (song.details._id) {
				newPlaylist.songs.push({
					details: song.details._id,
					upvote_count: song.upvote_count || 0,
					state: song.state || SongState.QUEUED,
					kind: song.kind || SongKind.NOT_FROZEN
				});
			} else {
				logger.info("object:", song.details);
				Song.create(song.details, function(err, obj) {
					logger.info("newSong:", obj);
					process.nextTick(function() {
						newPlaylist.songs.push({
							details: obj._id,
							upvote_count: song.upvote_count || 0,
							state: song.state || SongState.QUEUED,
							kind: song.kind || SongKind.NOT_FROZEN
						});
					});
				});
				// process.nextTick(function() {
				// 	logger.info("newSong:", id);
				// 	newPlaylist.songs.push({
				// 		details: {
				// 			_id: id
				// 		},
				// 		upvote_count: song.upvote_count || 0,
				// 		state: song.state || SongState.QUEUED,
				// 		kind: song.kind || SongKind.NOT_FROZEN
				// 	});
				// });
			}
		});

		newPlaylist.save();
	}

	self.findPlaylistById = function(playlistId, cb) {
		// Playlist.findById(playlistId)
		// 	.populate('songs songs.details', function(err, playlists) {
		// 		if (err) {
		// 			logger.error(err.message,err.stack);
		// 			cb(err);
		// 		} else if (playlists) {
		// 			cb(null, playlists);
		// 		} else {
		// 			cb('No playlist found');
		// 		}
		// 	});

		// Playlist.findById(playlistId, function(err, playlist) {
		// 	if (err) {
		// 		logger.error(err.stack.split("\n"));
		// 		cb(err);
		// 	} else if (playlist) {
		// 		logger.info("WILL POPULATE");
		// 		playlist
		// 			.populate('songs')
		// 			.populate('details', function(err, playlist) {
		// 				logger.info("Playlist", JSON.stringify(playlist))
		// 			});
		// 		// logger.info('execPopulate: ', JSON.stringify(playlist));
		// 		// if (pl) {
		// 		// 	cb(err);
		// 		// } else if (obj) {
		// 		// 	cb(err, obj);
		// 		// } else {
		// 		cb(null, playlist);
		// 		// }
		// 	} else {
		// 		cb('No playlist found');
		// 	}
		// });


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

	self.updateSongKind = function(playlistId, songId, kind, cb) {
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
				playlist.songs[songIndex].kind = kind;
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