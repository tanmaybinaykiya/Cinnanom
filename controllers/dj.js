var Playlist = require('../models/Playlist')

var DJHandler = function() {
    var self = this;
    var acceptedRoles=['ADMIN','DJ'];

    self.createPlaylist =  function(request, response) {
        //TODO 
        // verify all params of playlist
        if(request.playlist){
            // TODO
            // add request.playlist.status
            Playlist.createPlaylist(request.playlist, function(err, playlist){
                if(err){
                    response.status(404).json({error:err});
                }
                else{
                    //TODO
                    //associate dj with his playlist
                    response.status(201).json(playlist);
                }
            });
        }
        else{
            response.status(404).json({error:'Playlist not provided'});
        }
    };

    self.getPlaylist = function (request, response) {
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

    self.updatePlaylist = function (request, response) {
         // TODO 
        // Authorize
        if (request.params.playlistId && request.playlist) {
            Playlist.updatePlaylistById(request.params.playlistId, request.playlist, function(err, pub) {
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
                error: 'PlaylistId and Playlist not provided'
            });
        }
    };
    
    self.deletePlaylist = function (request, response) {
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
};

module.exports = new DJHandler();