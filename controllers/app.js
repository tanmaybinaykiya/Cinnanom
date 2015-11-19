var Pub = require('../models/Pub')
var AppHandler = function() {
    var self = this;
    var acceptedRoles = ['ADMIN', 'APP'];

    self.getPubListByGeoTag = function(request, response) {
        if (request.params.long && request.params.lat) {
            var coords = [];
            coords[0] = request.params.long;
            coords[1] = request.params.lat;
            Pub.findPubByGeoTag(coords, function(err, pubs) {
                if (err) {
                    response.status(404).json({
                        error: err
                    });
                } else if(pubs) {
                    response.status(200).json(pubs);
                } else{
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
        if (request.params.pubId) {
            Pub.findPubById(request.params.pubId, function(err, pub) {
                if (err) {
                    response.status(404).json({
                        error: err
                    });
                } else {
                    if (Pub.playlists) {
                        var found =false;
                        for (playlist in playlists) {
                            if (playlists[playlist].status === "ACTIVE") {
                                response.status(200).json(playlists[playlist]);
                                found = true;
                                break;
                            }
                        }
                        if (!found) {
                            response.status(404).end();
                        }
                    } else {
                        response.status(204).end();
                    }
                }
            });
        } else {
            response.status(404).json({
                error: 'PlaylistId not provided'
            });
        }
    };

    self.upvoteSong = function(request, response) {
        // TODO
        // authorize
        // check pub-playlist association
        if (request.params.pubId && request.params.playlistId && request.params.songId) {
            Playlist.getPlaylistById(request.params.playlistId, function(err, playlist) {
                if (err) {
                    response.status(404).json({
                        error: err
                    });
                }
                else{
                    var found = false;
                    for(song in playlist.songs){
                        if(request.params.songId === playlist.songs[song].id){
                            playlist.songs[song].upvoteCount = playlist.songs[song].upvoteCount++;
                            response.status(200).end();
                            found=true;
                            break;
                        }
                    }
                    if(!found){
                        response.status(404).json({
                            error: 'Song not found in playlist'
                        });
                    }                    
                }
            });
        } else {
            response.status(404).json({
                error: 'PlaylistId or SongId not provided'
            });
        }
    };
}

module.exports = new AppHandler();