var express = require('express');
var jwt = require('jsonwebtoken');

var adminHandler = require('./roles/admin');
var pubHandler = require('./roles/pub');
var djHandler = require('./roles/dj');
var appHandler = require('./roles/app');
var config = require('./config');

var router = express.Router();

function verifyUser (role, username, password, callback) {
	Users.findByUsername(username, function(err, user) {
		if (err) {
			Users.findByEmail(username, function(e, user) {
				if (e) {
					callback('User not found');
				} else if (user.password !== password) {
					callback('Email password do not match');
				} else if (user.role !== role) {
					callback('Authorization failed');
				} else {
					callback(null, role, user);
				}
			});
		} else if (user.password !== password) {
			callback('Username password do not match');
		} else if (user.role !== role) {
			callback('Authorization failed');
		} else {
			callback(null, role, user);
		}
	});
}

function generateToken (req, res) {
	var role = req.body.role,
		username = req.body.username,
		password = req.body.password;
	if (role && username && password) {
		verifyUser(role, username, password, function(err, user) {
			if (!err) {
				var access_token = jwt.sign({
					role: user.role,
					user_id: user.id
				}, config.secret, {
					expiresInMinutes: config.tokenExpiryInMinutes // expires in 1 hour
				});
				res.json({
					token: access_token
				});
			} else {
				res.status(401).json({
					error: err
				});
			}
		});
	} else {
		res.status(401).end();
	}
}

router.use(function(req, res, next) {
	console.log("[" + Date.now() + "] Req: " + req.route);
	next();
});

router.use(function(req, res, next) {
	token = req.get("Authorization");
	jwt.verify(token, config.secret, function(err, decoded) {
		if (!err) {
			req.decoded = decoded;
		} else if (err.name === 'JsonWebTokenError') {
			res.status(401).json({
				error: err.message
			});
		} else if (err.name === 'TokenExpiredError') {
			res.status(401).json({
				error: 'TOKEN_EXPIRED'
			});
		} else {
			res.status(500).json({
				error: 'INTERNAL_SERVER_ERROR'
			});
		}
	});
	next();
});

router.route('/token')
	.post(generateToken);
	
router.route('/owner/register')
	.put(adminHandler.createOwner);

router.route('/owner/:ownerId')	
	.delete(adminHandler.deleteOwner);

router.route('/pub/register')
	.put(owner.registerPub);

router.route('/pub/:pubId')
	.delete(owner.deletePub)
	.get(owner.getPubDetails)
	.post(owner.updatePubDetails);

router.route('/pub/:pubId/dj')
	.put(owner.createDJAccount);

router.route('/pub/:pubId/dj/:djId')
	.delete(owner.deleteDJAccount)
	.post(djHandler.joinPub);

router.route('/pub/:pubId/playlist')
	.put(djHandler.createPlaylist);

router.route('/pub/:pubId/playlist/:playlistId')
	.get(djHandler.getPlaylist)
	.post(djHandler.updatePlaylist)
	.delete(djHandler.deletePlaylist);

router.route('/pub/:geoTag')
	.get(appHandler.getPubList);

router.route('/pub/:pubId/playlist')
	.get(appHandler.getCurrentPlaylist);

router.route('/pub/:pubId/playlist/:playlistId/song/:songId')
	.post(appHandler.upvoteSong);

//to be deprecated
router.get('/test', generateToken);

module.exports = router;