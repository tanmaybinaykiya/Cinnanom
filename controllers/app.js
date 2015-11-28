var Pub = require('../models/Pub'),
    User = require('../models/User'),
    Playlist = require('../models/Playlist'),
    Role = require('../enums/Role');

var AppHandler = function() {
    var self = this;

    self.register = function(request, response) {
        if (request.body.username && request.body.password) {
            User.createUser({
                username: request.body.username,
                password: request.body.password,
                email: '' || request.body.email,
                role: Role.APP
            }, function(err, user) {
                if (err) {
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
    };

    self.getPubListByGeoTag = function(request, response) {
        if (request.params.long && request.params.lat) {
            var coords = [];
            coords[0] = request.params.long;
            coords[1] = request.params.lat;
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
    };

    self.getCurrentPlaylist = function(request, response) {
        // TODO 
        // implement filters
        if ( request.params.pubId ) {
            var limit = 20;
            if (request.params.pageSize) {
                limit = request.params.pageSize;
            }
            Pub.getActivePlaylist(request.params.pubId, limit, function(err, playlist) {
                if (err) {
                    response.status(500).json({
                        error: err
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
        console.log("upvoteSong");
        // TODO
        // authorize
        // check pub-playlist association
        if (request.params.pubId && request.params.playlistId && request.params.songId) {
            var playlistId=request.params.playlistId,
                songId=request.params.songId;

            Playlist.upvoteSong(playlistId, songId, function(err, playlist) {
                if (err) {
                    console.log("err: ", err);
                    response.status(500).json({
                        error: err
                    });
                } else {
                    response.status(200).json({});
                }
            });
        } else {
            console.log(request.params.pubId, request.params.playlistId, request.params.songId);
            response.status(404).json({
                error: 'PlaylistId or SongId not provided'
            });
        }
    };
};

module.exports = new AppHandler();