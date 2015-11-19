var mongoose = require('mongoose');
var logger = require('../logger');

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

var PlaylistManager = function() {
	var self = this;
	this.registerPub = function(pub, cb) {
		logger.info("PlaylistManager.registerPub")
		Pub.create(pub, function(err, doc) {
			logger.info("Pub.create cb")
			if (err) {
				logger.info(err);
				cb(err);
			} else {
				cb(null, doc);
			}
		});
	}

	this.deletePubById = function(pubId, cb) {
		Pub.findByIdAndRemove(pubId, function(e) {
			if (e) {
				cb(e);
			} else {
				cb(null);
			}
		});
	}

	this.findPubById = function(pubId, cb) {
		Pub.findById(pubId, function(err, pub) {
			if (err) {
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
				cb(err);
			} else {
				cb(null, pub);
			}
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
				cb(err);
			}
			cb(null, err);
		});
	}
}

module.exports = new PlaylistManager();