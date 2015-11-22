var Playlist = require('../models/Playlist'),
    Pub = require('../models/Pub'),
    logger = require('../logger'),
    PlaylistState = require('../enums/PlaylistState');

function isValidPlaylistState(state) {
    return (state === PlaylistState.ACTIVE || state === PlaylistState.DELETED || state === PlaylistState.INACTIVE);
}

var DJHandler = function() {
    var self = this;
    var acceptedRoles = ['ADMIN', 'DJ'];

    self.createPlaylist = function(request, response) {
        //TODO 
        // verify all params of playlist
        if (request.params.pubId && request.body.name) {
            // TODO
            // add request.playlist.status
            logger.info("request.body: " + JSON.stringify(request.body));
            Playlist.createPlaylist(request.body, function(err, playlist) {
                if (err) {
                    logger.error(err);
                    response.status(404).json({
                        error: err
                    });
                } else if (playlist) {
                    //TODO
                    //associate dj with his playlist
                    Pub.addPlaylist(request.params.pubId, playlist, function(err, pub) {
                        if (!err) {
                            response.status(201).json(playlist);
                        } else {
                            logger.error('Failed to associate pub with playlist');
                            response.status(404).json({
                                error: 'Failed to associate pub with playlist'
                            });
                        }
                    });
                } else {
                    logger.error('Playlist Not Created');
                    response.status(404).json({
                        error: 'Playlist Not Created'
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
                    response.status(200).end();
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
                    logger.error(err);
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
                    logger.error(err);
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
        if (req.params.pubId && req.params.playlistId && req.params.songId && req.query.state) {
            var playlistId = req.params.playlistId,
                songId = req.params.songId,
                state = req.query.state;
            Playlist.updateSongState(playlistId, songId, state, function(err) {
                if (err) {
                    logger.error(err);
                    res.status(404).json({
                        error: err
                    });
                } else {
                    res.status(200).end();
                }
            });
        } else if (req.params.pubId && req.params.playlistId && req.params.songId && req.query.type) {
            var playlistId = req.params.playlistId,
                songId = req.params.songId,
                type = req.query.type;
            Playlist.updateSongType(playlistId, songId, type, function(err) {
                if (err) {
                    logger.error(err);
                    res.status(404).json({
                        error: err
                    });
                } else {
                    res.status(200).end();
                }
            });
        } else {
            res.status(404).json({
                error: 'Invalid params passed'
            });
        }
    };
};

module.exports = new DJHandler();