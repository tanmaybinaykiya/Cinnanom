//flush playlist
//flush votecounts
var mongoose = require('mongoose'),
	_ = require('underscore'),
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
	}
	/*, {
		strict: true
	}*/
);


var Playlist = mongoose.model("Playlist", PlaylistSchema);

var PlaylistManager = function() {
	var self = this;

	//sort songs by upvote count. if upvoteCount is missing, set it to 0
	function sortSongsByUpvoteCount(playlist) {
		return _.sortBy(playlist.songs, function(song) {
			if (!song.upvote_count) {
				song.upvote_count = 0;
			}
			return song.upvote_count;
		});
	}

	self.createPlaylist = function(playlist, cb) {

		try {
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
					Song.create(song.details, function(err, obj) {
						console.log("saved song, pushing now:", obj);
						newPlaylist.songs.push({
							details: obj._id,
							upvote_count: song.upvote_count,
							state: song.state || SongState.QUEUED,
							kind: song.kind || SongKind.NOT_FROZEN
						});
					});
				}
			});
			Playlist.create(newPlaylist, function(err, obj) {
				if (err) {
					console.error("err: ", err);
				}
				console.log("playlist: ", obj);
				cb(err, obj);
			});
		} catch (err) {
			cb(err);
			return;
		}
	}

	self.findPlaylistById = function(playlistId, cb) {
		Playlist.findById(playlistId)
			.then(function(playlist) {
				console.log("find: ", playlist);
				if (playlist) {
					cb(null, playlist);
				} else {
					cb('No playlist found');
				}
			}, function(err) {
				console.log(err.message, err.stack);
				cb(err);
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
				console.log(err.stack.split("\n"));
				cb(err);
			} else {
				cb(null, playlist);
			}
		});
	}

	self.deletePlaylistById = function(playlistId, cb) {
		Playlist.findByIdAndRemove(playlistId, function(err) {
			if (err) {
				console.log(err.stack.split("\n"));
			}
			cb(err);
		});
	}

	self.updateSongKind = function(playlistId, songId, kind, cb) {
		self.findPlaylistById(playlistId, function(err, playlist) {
			if (err) {
				console.log(err.stack.split("\n"));
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
					console.log(err.stack.split("\n"));
					cb(err);
				});
			}
		});
	}

	self.updateSongState = function(playlistId, songId, state, cb) {
		self.findPlaylistById(playlistId, function(err, playlist) {
			if (err) {
				console.log(err.stack.split("\n"));
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
					console.log(err.stack.split("\n"));
					cb(err);
				});
			}
		});
	}

	self.upvoteSong = function(playlistId, songId, cb) {
		self.findPlaylistById(playlistId, function(err, playlist) {
			if (err) {
				console.log(err.stack.split("\n"));
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
					console.log(err.stack.split("\n"));
					cb(err);
				});
			}
		});
	}
}

module.exports = new PlaylistManager();