'use strict';
//flush playlist
//flush votecounts
var mongoose = require('mongoose'),
    _ = require('underscore'),
    Song = require('./Song'),
    SongState = require('../enums/SongState'),
    SongKind = require('../enums/SongType'),
    async = require('async'),
    PlaylistState = require('../enums/PlaylistState'),
    logger= require('../util/logger');

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

var PlaylistManager = function () {
    var self = this;

    //sort songs by upvote count. if upvoteCount is missing, set it to 0
    function sortSongsByUpvoteCount(playlist, cb) {
        async.sortBy(playlist.songs, function(song, callback) {
            if (!song.upvote_count) {
                song.upvote_count = 0;
            }
            callback(null, song.upvote_count);
        }, function(err) {
            cb(err, playlist);
        });
    }

    function pushSong(song, newPlaylist, callback) {
        if (song.details._id) {
            newPlaylist.songs.push({
                details: song.details._id,
                upvote_count: song.upvote_count || 0,
                state: song.state || SongState.QUEUED,
                kind: song.kind || SongKind.NOT_FROZEN
            });
            callback();
        } else {
            Song.create(song.details, function(err, obj) {
                if (err) {
                    callback(err);
                } else {
                    newPlaylist.songs.push({
                        details: obj._id,
                        upvote_count: song.upvote_count,
                        state: song.state || SongState.QUEUED,
                        kind: song.kind || SongKind.NOT_FROZEN
                    });
                    callback();
                }
            });
        }
    }

    self.createPlaylist = function(playlist, callback) {
        async.waterfall([function(cb) {
                var newPlaylist = new Playlist({
                    name: playlist.name || '',
                    genre: playlist.genre || '',
                    songs: []
                });
                cb(null, newPlaylist);
            },
            function(newPlaylist, cb) {
                sortSongsByUpvoteCount(playlist, function(err, playlist) {
                    cb(err, playlist, newPlaylist);
                });
            },
            function(playlist, newPlaylist, cb) {
                _.each(playlist.songs, function(song, index, list) {
                    pushSong(song, newPlaylist, function(err) {
                        if (err) {
                            cb(err);
                        } else if (list.length - index === 1) {
                            cb(null, newPlaylist);
                        }
                    });
                });
            },
            function(newPlaylist, cb) {
                Playlist.create(newPlaylist, function(err, cPlaylist) {
                    cb(err, cPlaylist);
                });
            }
        ], function(err, playlist) {
            if (!err && !playlist) {
                callback("Playlist not created");
            } else {
                callback(err, playlist);
            }
        });
    };

    self.findPlaylistById = function(playlistId, cb) {
        Playlist.find({
                _id: playlistId
            })
            .populate('songs.details')
            .exec(function(err, playlists) {
                if (playlists && playlists[0]) {
                    cb(null, playlists[0]);
                } else if (playlists) {
                    cb("Something is wrong, playlists: ", playlists);
                } else if (err) {
                    cb(err);
                } else {
                    cb('No playlist found');
                }
            });
    };

    self.updatePlaylistById = function(playlistId, playlist, cb) {
        // preProcess(playlist);
        Playlist.findOneAndUpdate({
            _id: playlistId
        }, playlist, {
            upsert: false
        }, function(err, playlist) {
            if (err) {
                logger.error("Error updating playlist by Id:", err.stack.split("\n"));
                cb(err);
            } else {
                cb(null, playlist);
            }
        });
    };

    self.deletePlaylistById = function(playlistId, cb) {
        Playlist.findByIdAndRemove(playlistId, function(err) {
            if (err) {
                logger.error("Error deleting Playlist By Id",err.stack.split("\n"));
            }
            cb(err);
        });
    };

    self.updateSong = function(playlistId, songId, updateFunc, cb) {
        var self= this;
        async.waterfall([function(callback) {
            self.findPlaylistById(playlistId, callback);
        }, function(playlist, callback) {
            var song = _.find(playlist.songs, function(song) {
                if (song.details._id == songId) {
                    return true;
                }
                return false;
            });
            if (song) {
                updateFunc(song, playlist, callback);
            } else {
                callback('song Not Found');
            }
        }, function(playlist, callback) {
            playlist.save(callback);
        }], function(err, playlist) {
            if (err) {
                logger.error("Error updateSong", err);
            }
            cb(err, playlist);
        });
    };


    self.updateSongKind = function(playlistId, songId, kind, cb) {
        // assert song state
        this.updateSong(playlistId, songId, function(song, playlist, callback) {
            if (song.kind === kind) {
                callback(304);
            } else {
                song.kind = kind;
                callback(null, playlist);
            }
        }, cb);
    };

    self.updateSongState = function(playlistId, songId, state, cb) {
        // assert song state
         this.updateSong(playlistId, songId, function(song, playlist, callback) {
            if (song.state === state) {
                callback(304);
            } else {
                song.state = state;
                callback(null, playlist);
            }
        }, cb);
    };

    self.upvoteSong = function(playlistId, songId, cb) {
         this.updateSong(playlistId, songId, function(song, playlist, callback) {
                song.upvote_count = song.upvote_count + 1;
                callback(null, playlist);
        }, cb);
    };
};

module.exports = new PlaylistManager();