var mongoose = require('mongoose'),
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
		details: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Playlist'
		},
		state: 'String'
	}]
}, {
	strict: true
});


var Pub = mongoose.model("Pub", PubSchema);

var PubManager = function() {
	var self = this;
	this.registerPub = function(pub, cb) {
		console.log("PubManager.registerPub")
		Pub.create(pub, function(err, doc) {
			console.log("Pub.create cb")
			if (err) {
				console.log(err);
			}
			cb(err, doc);
		});
	}

	this.deletePubById = function(pubId, cb) {
		Pub.findByIdAndRemove(pubId, function(e) {
			if (e) {
				console.log(e.stack.split("\n"));
			}
			cb(e);
		});
	}

	this.findPubById = function(pubId, cb) {
		Pub.findById(pubId, function(err, pub) {
			if (err) {
				console.log(err.stack.split("\n"));
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
				console.log(err.stack.split("\n"));
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
			})
			.limit(10)
			.exec(function(err, locations) {
				if (err) {
					console.log(err.stack.split("\n"));
				}
				cb(err, locations);
			});
	}

	this.addPlaylist = function(pubId, playlistDetails, cb) {
		this.findPubById(pubId, function(err, pub) {
			if (!err && pub) {
				playlist = {
					details: playlistDetails,
					state: PlaylistState.INACTIVE
				}
				pub.playlists.push(playlist);
				pub.save(function(e, pubFound) {
					if (e) {
						console.log(e.stack.split("\n"));
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
		Pub.find({
				_id: pubId
			}).populate({
				path: 'playlists.details',
				match: filters,
				limit: limit
			})
			.exec(function(err, pubs) {
				if (err) {
					console.log(err);
					cb(err);
				} else if (pubs && pubs[0] && pubs[0].playlists && pubs[0].playlists[0] && pubs[0].playlists[0].details) {
					cb(null, pubs);
				} else {
					console.log('pubs: ' + pubs);
					console.log('pubs0: ' + pubs[0]);
					console.log('playlists: ' + pubs[0].playlists);
					console.log('playlists0: ' + pubs[0].playlists[0]);
					console.log('playlists0Details: ' + pubs[0].playlists[0].details);
					cb('INTERNAL_ERROR');
				}
			});
	}

	this.setActivePlaylist = function(pubId, playlistId, state, cb) {
		this.getFilteredPlaylist(pubId, {
			_id: playlistId
		}, 5, function(err, pubs) {
			if (err) {
				cb(err);
				return;
			} else if (pubs && pubs[0] && pubs[0].playlists && pubs[0].playlists[0]) {
				if (state === pubs[0].playlists[0].state) {
					cb(204);
					return;
				}
				pubs[0].playlists[0].state = state;
			} else {
				// console.log("pub:", pub);
				// console.log("playlists:", pub.playlists);
				// console.log("playlists[0]:", pub.playlists[0]);
				cb('Not FOUND')
				return;
			}
			pubs[0].save(function(e, pubFound) {
				if (e) {
					console.log(e.stack.split("\n"));
				}
				cb(e, pubFound);
			});
		});
	}

	this.getActivePlaylist = function(pubId, limit, cb) {
		Pub.find({
				_id: pubId
			}).populate({
				path: 'playlists',
				match: {
					state: PlaylistState.ACTIVE
				},
				limit: 5
			})
			.exec(function(err, pubs) {
				if (err) {
					console.log(err);
					cb(err);
				} else if (pubs && pubs[0] && pubs[0].playlists && pubs[0].playlists[0] && pubs[0].playlists[0].details) {
					console.log('pubs: ' + JSON.stringify(pubs));
					pubs[0]
						.populate('playlists.details')
						.populate('playlists.details.songs')
						.populate('playlists.details.songs.details')
						.execPopulate();

					cb(null, pubs[0].playlists[0].details);
				} else {
					logger.debug('pubs: ' + pubs);
					logger.debug('pubs0: ' + pubs[0]);
					logger.debug('playlists: ' + pubs[0].playlists);
					logger.debug('playlists0: ' + pubs[0].playlists[0]);
					cb('INTERNAL_ERROR');
				}
			});
	}
}

module.exports = new PubManager();