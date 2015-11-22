var mongoose = require('mongoose'),
	logger = require('../logger'),
	PlaylistState = require('../enums/PlaylistState');

var PubSchema = new mongoose.Schema({
	name: String,
	address: String,
	genre: String,
	loc: {
		type: [Number], // [<longitude>, <latitude>]
		index: '2d' // create the geospatial index
	},
	playlists: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Playlist'
	}]
});

var Pub = mongoose.model("Pub", PubSchema);

var PubManager = function() {
	var self = this;
	this.registerPub = function(pub, cb) {
		logger.info("PubManager.registerPub")
		Pub.create(pub, function(err, doc) {
			logger.info("Pub.create cb")
			if (err) {
				logger.error(err);
			}
			cb(err, doc);
		});
	}

	this.deletePubById = function(pubId, cb) {
		Pub.findByIdAndRemove(pubId, function(e) {
			if (e) {
				logger.error(e.stack.split("\n"));
			}
			cb(e);
		});
	}

	this.findPubById = function(pubId, cb) {
		Pub.findById(pubId, function(err, pub) {
			if (err) {
				logger.error(err.stack.split("\n"));
				cb(err);
			} else if (pub) {
				cb(null, pub);
			} else {
				cb('No pub found');
			}
		});
	}

	this.updatePubById = function(pubId, pub, cb) {
		Pub.findOneAndUpdate({
			_id: pubId
		}, pub, {
			upsert: false
		}, function(err, pub) {
			if (err) {
				logger.error(err.stack.split("\n"));
			}
			cb(err, pub);
		});
	}

	this.findPubByGeoTag = function(coords, cb) {
		var maxDistance = 5 / 6371;
		Pub.find({
			loc: {
				$near: coords,
				$maxDistance: maxDistance
			}
		}).limit(10).exec(function(err, locations) {
			if (err) {
				logger.error(err.stack.split("\n"));
			}
			cb(err, locations);
		});
	}

	this.addPlaylist = function(pubId, playlist, cb) {
		this.findPubById(pubId, function(err, pub) {
			if (!err && pub) {
				pub.playlists.push(playlist);
				pub.save(function(e, pubFound) {
					if (e) {
						logger.error(e.stack.split("\n"));
					}
					cb(e, pubFound);
				});
			} else if (err) {
				cb(err);
			} else {
				cb('No Pub found with given id');
			}
		});
	}

	this.getFilteredPlaylist = function(pubId, filters, limit, cb) {
		Pub.findOne({
				_id: pubId
			})
			.populate({
				path: 'playlists',
				match: filters,
				options: {
					limit: limit
				}
			})
			.exec(function(err, Pub) {
				if (err) {
					cb(err);
				} else if (Pub && Pub.playlists && Pub.playlists[0]) {
					cb(null, Pub.playlists[0]);
				} else if (Pub && Pub.playlists) {
					cb(null, null);
				} else if (Pub) {
					cb('No playlists found for pub');
				} else {
					cb('Invalid pub');
				}
			});
	}

	this.setActivePlaylist = function(pubId, playlistId, state, cb) {
		this.getFilteredPlaylist(pubId, {
			_id: playlistId
		}, 1, function(err, pub) {
			if(err){
				cb(err);
				return;
			}
			else if(state === pub.playlists[0].state ){
				cb(204);
				return;
			}
			else if (pub && pub.playlists && pub.playlists[0]){
				pub.playlists[0].state=state;
			} else{
				cb('Not FOUND')
				return;
			}
			pub.save(function(e, pubFound) {
				if (e) {
					logger.error(e.stack.split("\n"));
				}
				cb(e, pubFound);
			});
		});
	}

	this.getActivePlaylist = function(pubId, limit, cb) {
		this.getFilteredPlaylist(pubId, {
			state: PlaylistState.ACTIVE
		}, limit, cb);
	}
}

module.exports = new PubManager();