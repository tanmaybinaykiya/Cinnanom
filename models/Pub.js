'use strict';
var mongoose = require('mongoose'),
	PlaylistState = require('../enums/PlaylistState'),
	async = require('async'),
	logger = require('../util/logger');

var PubSchema = new mongoose.Schema({
	name: String,
	address: String,
	genre: String,
	loc: {
		type: [Number], // [<longitude>, <latitude>]
		index: '2d' // create the geospatial index
	},
	playlists: [{
		details: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Playlist'
		},
		state: String
	}]
}, {
	strict: true
});


var Pub = mongoose.model("Pub", PubSchema);

var PubManager = function() {
	var self = this;
	self.registerPub = function(pub, cb) {
		Pub.create(pub, function(err, doc) {
			if (err) {
				logger.error("Pub create:", err);
			}
			cb(err, doc);
		});
	};

	self.deletePubById = function(pubId, cb) {
		Pub.findByIdAndRemove(pubId, function(err) {
			if (err) {
				logger.error("Error deleting pub by Id:", err.stack.split("\n"));
			}
			cb(err);
		});
	};


	self.updatePubById = function(pubId, pub, cb) {
		Pub.findOneAndUpdate({
			_id: pubId
		}, pub, {
			upsert: false
		}, function(err, pub) {
			if (err) {
				logger.error("Error updating Pub By Id", err.stack.split("\n"));
			}
			cb(err, pub);
		});
	};

	self.findPubByFilter = function(filter, cb) {
		Pub.find(filter)
			.exec(cb);
	};

	self.findPubById = function(pubId, cb) {
		this.findPubByFilter({
			_id: pubId
		}, function(err, pub) {
			if (err) {
				logger.error("Error finding Pub By Id", err.stack.split("\n"));
				cb(err);
			} else if (pub && pub[0]) {
				cb(null, pub[0]);
			} else {
				cb('No pub found');
			}
		});
	};

	self.findPubByGeoTag = function(coords, cb) {
		var maxDistance = 5 / 6371;
		this.findPubByFilter({
			loc: {
				$near: coords,
				$maxDistance: maxDistance
			}
		}, function(err, locations) {
			if (err) {
				logger.error("Error findPubByGeoTag", err.stack.split("\n"));
			}
			cb(err, locations);
		});
	};

	self.addPlaylist = function(pubId, playlistDetails, cb) {
		var self = this;
		async.waterfall([
				function(cb) {
					self.findPubById(pubId, cb);
				},
				function(pub, cb) {
					try{
						var playlist = {
							details: playlistDetails,
							state: PlaylistState.INACTIVE
						};
						if(!pub.playlists){
							pub.playlists=[];
						}
						pub.playlists.push(playlist);
						logger.info("Pub: " + JSON.stringify(pub, null, 4))
						pub.save(cb);
					} catch (e){
						cb(e)
					}
				}
			],
			function(err, pubFound) {
				if (!err && pubFound) {
					cb(null, pubFound);
				} else if (err) {
					logger.error("Error adding playlist" + err);
					cb(err);
				} else {
					cb('No Pub found with given id');
				}
			});
	};

	self.getFilteredPlaylist = function(pubId, filters, limit, cb) {
		Pub.find({
				_id: pubId
			}).populate({
				path: 'playlists.details',
				match: filters,
				limit: limit,
				populate: {
					path: 'songs.details'
				}
			})
			.exec(function(err, pubs) {
				if (err) {
					logger.error("Error getting FilteredPlaylist", err.stack.split("\n"));
					cb(err);
				} else if (pubs && pubs[0] && pubs[0].playlists && pubs[0].playlists[0] && pubs[0].playlists[0].details) {
					cb(null, pubs);
				} else {
					logger.error('Error getting filteredPlaylist');
					logger.error('pubs: ' + pubs);
					logger.error('pubs0: ' + pubs[0]);
					logger.error('playlists: ' + pubs[0].playlists);
					logger.error('playlists0: ' + pubs[0].playlists[0]);
					logger.error('playlists0Details: ' + pubs[0].playlists[0].details);
					cb('INTERNAL_ERROR');
				}
			});
	};

	self.setActivePlaylist = function(pubId, playlistId, state, cb) {
		var self = this;
		async.waterfall([function(callback) {
			self.getFilteredPlaylist(pubId, {
				_id: playlistId
			}, 5, callback);
		}, function(pubs, callback) {
			if (pubs && pubs[0] && pubs[0].playlists && pubs[0].playlists[0]) {
				if (state === pubs[0].playlists[0].state) {
					callback(204);
				} else {
					pubs[0].playlists[0].state = state;
					callback(null, pubs[0]);
				}
			} else {
				callback('Not FOUND');
			}
		}, function(pub, callback) {
			pub.save(callback);
		}], function(err, pub) {
			if (err) {
				logger.error("Error setActivePlaylist", err.stack.split("\n"));
			}
			cb(err, pub);
		});
	};

	self.getActivePlaylist = function(pubId, limit, cb) {
		Pub.findOne({
				_id: pubId
			}).populate({
				path: 'playlists',
				match: {
					state: PlaylistState.ACTIVE
				},
				limit: 1,
				populate: {
					path: 'details',
					populate: {
						path: 'songs'
					}
				}
			})
			.exec(function(err, pub) {
				if (err) {
					logger.error("Error getActivePlaylist", err);
					cb(err);
				} else if (pub && pub.playlists && pub.playlists[0] && pub.playlists[0].details) {
					// logger.info('getActivePlaylist: ' + JSON.stringify(pub, null, 4));
					cb(null, pub.playlists[0].details);
				} else {
					logger.error('error getActivePlaylist');
					logger.error('pubs: ' + pub);
					logger.error('pubs0: ' + pub);
					logger.error('playlists: ' + pub.playlists);
					logger.error('playlists0: ' + pub.playlists[0]);
					cb('INTERNAL_ERROR');
				}
			});
	};
};

module.exports = new PubManager();