'use strict';
var Playlist = require('../models/Playlist'),
    Pub = require('../models/Pub'),
    PlaylistState = require('../enums/PlaylistState'),
    async = require('async'),
    logger = require('../util/logger');

function isValidPlaylistState(state) {
    return (state === PlaylistState.ACTIVE ||
        state === PlaylistState.DELETED ||
        state === PlaylistState.INACTIVE);
}

var DJHandler = function() {
    var self = this;

    self.createPlaylist = function(request, response) {
        if (request.params.pubId && request.body.name) {
            async.waterfall([function(cb) {
                    Playlist.createPlaylist(request.body, cb);
                },
                function(playlist2, cb) {
                    Pub.addPlaylist(request.params.pubId, playlist2, cb);
                }
            ], function(err, pub) {
                if ((!err) && pub) {
                    response.status(201).json(pub);
                } else if (err) {
                    response.status(404).json({
                        error: err
                    });
                } else {
                    logger.error("Pub not created");
                    response.status(500).json({
                        error: "INTERNAL_SERVER_ERROR"
                    });
                }
            });
        } else {
            logger.error('Playlist not provided');
            response.status(404).json({
                error: 'Playlist not provided'
            });
        }
    };

    self.getPlaylist = function(request, response) {
        // TODO 
        // Authorize
        // check if that pub has the playlist
        if (request.params.pubId) {
            Playlist.findPlaylistById(request.params.playlistId, function(err, playlist) {
                if (err) {
                    response.status(404).json({
                        error: err
                    });
                } else {
                    response.status(200).json(playlist);
                }
            });
        } else {
            response.status(404).json({
                error: 'PlaylistId not provided'
            });
        }
    };

    self.updatePlaylist = function(request, response) {
        var pubId = request.params.pubId,
            playlistId = request.params.playlistId,
            state = request.query.state;
        if (pubId && playlistId && state) {
            if (!isValidPlaylistState(state)) {
                response.status(404).json({
                    error: 'Invalid Input'
                });
            }
            Pub.setActivePlaylist(pubId, playlistId, state, function(err) {
                if (err) {
                    response.status(500).json({
                        error: err
                    });
                } else {
                    response.status(200).json({});
                }
            });
        } else {
            response.status(404).json({
                error: 'Invalid Input'
            });
        }
    };

    self.deletePlaylist = function(request, response) {
        // TODO 
        // Authorize
        if (request.params.playlistId) {
            Playlist.deletePlaylistById(request.params.playlistId, function(err) {
                if (err) {
                    response.status(404).json({
                        error: err
                    });
                } else {
                    response.status(200).end();
                }
            });
        } else {
            response.status(404).json({
                error: 'PlaylistId not provided'
            });
        }
    };
    self.addSong = function(req, res) {
        if (req.params.pubId && req.params.playlistId && req.body.song && req.body.song.details && (req.body.song.details._id || req.body.song.details.name)) {
            var playlistId = req.params.playlistId,
                song = req.body.song;
            Playlist.addSong(playlistId, song, function(err) {
                if (err) {
                    logger.error("Error adding song", err.stack.split("\n"));
                    res.status(404).json({
                        error: err
                    });
                } else {
                    res.status(201).end();
                }
            });
        } else {
            res.status(404).json({
                error: 'Invalid params passed'
            });
        }
    };

    self.removeSong = function(req, res) {
        if (req.params.pubId && req.params.playlistId && req.body.songId) {
            var playlistId = req.params.playlistId,
                songId = req.body.songId;
            Playlist.removeSong(playlistId, songId, function(err) {
                if (err) {
                    logger.error("Error removing song:", err);
                    res.status(404).json({
                        error: err
                    });
                } else {
                    res.status(201).end();
                }
            });
        } else {
            res.status(404).json({
                error: 'Invalid params passed'
            });
        }
    };

    self.updateSong = function(req, res) {
        if (req.params.pubId && req.params.playlistId && req.params.songId) {
            var playlistId = req.params.playlistId,
                songId = req.params.songId;
            if (req.query.state && !(req.query.kind)) {
                var state = req.query.state;
                Playlist.updateSongState(playlistId, songId, state, function(err) {
                    if (err) {
                        logger.error("Error updating song:", err.stack.split("\n"));
                        res.status(404).json({
                            error: err
                        });
                    } else {
                        res.status(200).json({}).end();
                    }
                });
            } else if (req.query.kind) {
                var kind = req.query.kind;
                Playlist.updateSongKind(playlistId, songId, kind, function(err) {
                    if (err) {
                        logger.error("Error updating song: ", err.stack.split("\n"));
                        res.status(404).json({
                            error: err
                        });
                    } else {
                        res.status(200).json({}).end();
                    }
                });
            } else {
                res.status(404).json({
                    error: 'Invalid params passed'
                });
            }
        } else {
            res.status(404).json({
                error: 'Invalid params passed'
            });
        }
    };
};

module.exports = new DJHandler();