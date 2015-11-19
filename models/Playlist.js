//flush playlist
//flush votecounts
var mongoose = require('mongoose');

var PlaylistSchema = new mongoose.Schema({
	name: String,
	genre: String,
	songs: [{
		song_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Song'
		},
		upvote_count: Number
	}]
});

var Playlist = mongoose.model("Playlist", PlaylistSchema);

var PlaylistManager= function(){
	var self=this;
	
	self.createPlaylist=function(playlist, cb){
		Playlist.create(playlist, function(err, doc){
			if (err) {
				cb(err);
			} else {
				cb(null, doc);
			}
		});
	}
	
	self.findPlaylistById=function(playlistId, cb){
		Playlist.findById(playlistId, function(err, playlist){
			if(err){
				cb(err);
			}
			else if(playlist){
				cb(null, playlist);
			}else{
				cb('No playlist found');
			}
		});
	}
	
	self.updatePlaylistById=function(playlistId, playlist, cb) {
		Playlist.findOneAndUpdate({ _id : playlistId }, playlist, {upsert:false}, function(err, playlist){
    		if (err) { 
    			cb(err);
    		}
   			else{ 
   				cb(null, playlist);
   			}
		});
	}
	
	self.deletePlaylistById=function(playlistId, cb){
		Playlist.findByIdAndRemove(playlistId, function(e) {
			if (e) {
				cb(e);
			} else {
				cb(null);
			}
		});
	}
}

module.exports = new PlaylistManager();