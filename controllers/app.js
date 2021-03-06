'use strict';
var Pub = require('../models/Pub'),
    User = require('../models/User'),
    Playlist = require('../models/Playlist'),
    Role = require('../enums/Role'),
    logger = require('../util/logger'),
    Errors = require('../util/Errors');

var AppHandler = function() {
    var self = this;

    self.register = function(request, response) {
        try {
            if (request.body.username && request.body.password) {
                User.createUser({
                    username: request.body.username,
                    password: request.body.password,
                    email: request.body.email || '',
                    role: Role.APP
                }, function(err, user) {
                    if (err && err instanceof Errors.EntityAlreadyExists) {
                        response.status(304).end();
                    } else if (err) {
                        response.status(500).json({
                            error: err
                        });
                    } else {
                        response.status(201).json(user);
                    }
                });
            } else {
                response.status(404).json({
                    error: 'User or password not passed'
                });
            }
        } catch (e) {
            logger.error("Error registering user" + e)
            response.status(500).end();
        }
    };

    self.getPubListByGeoTag = function(request, response) {
        try {
            if (request.query.long && request.query.lat) {
                var coords = [];
                coords[0] = request.query.long;
                coords[1] = request.query.lat;
                Pub.findPubByGeoTag(coords, function(err, pubs) {
                    if (err) {
                        response.status(500).json({
                            error: err
                        });
                    } else if (pubs) {
                        response.status(200).json(pubs);
                    } else {
                        response.status(204).end();
                    }
                });
            } else {
                response.status(404).json({
                    error: 'Geotags not provided'
                });
            }
        } catch (e) {
            logger.error("Error in getPubListByGeoTag" + e)
            response.status(500).end();
        }
    };

    self.getCurrentPlaylist = function(request, response) {
        // TODO 
        // implement filters
        if (request.params.pubId) {
            Pub.getActivePlaylist(request.params.pubId, function(err, playlist) {
                if (err && err instanceof Errors.SongPopulationFailed) {
                    Playlist.findPlaylistById(playlist._id, function(e, pl) {
                        if (e || !pl) {
                            response.status(404).json({
                                error: 'No Active Playlist found'
                            });
                        } else {
                            response.status(200).json(pl);
                        }
                    });
                } else if (err && err instanceof Errors.EntityNotFound) {
                    response.status(404).json({
                        error: 'No Active Playlist found'
                    });
                } else if (playlist) {
                    response.status(200).json(playlist);
                } else {
                    response.status(404).json({
                        error: 'No Active Playlist found'
                    });
                }
            });
        } else {
            response.status(404).json({
                error: 'PubId not provided'
            });
        }
    };

    self.upvoteSong = function(request, response) {
        // TODO
        // check pub-playlist association
        if (request.params.pubId && request.params.playlistId && request.params.songId) {
            var playlistId = request.params.playlistId,
                songId = request.params.songId;

            Playlist.upvoteSong(playlistId, songId, function(err, playlist) {
                if (err) {
                    logger.error("Error Upvoting song: ", err.stack.split("\n"));
                    response.status(500).json({
                        error: err
                    });
                } else {
                    response.status(200).json({});
                }
            });
        } else {
            response.status(404).json({
                error: 'PlaylistId or SongId not provided'
            });
        }
    };
};

module.exports = new AppHandler();