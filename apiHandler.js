var express = require('express');
var jwt = require('jsonwebtoken');

var adminHandler = require('./controllers/admin');
var owner = require('./controllers/owner');
var djHandler = require('./controllers/dj');
var appHandler = require('./controllers/app');
var User = require('./models/User');
var config = require('./config');
var authenticator = require('./authenticator');
var logger = require('./logger');

var router = express.Router();

function verifyUser (role, username, password, callback) {
	User.findByUsername(username, role, function(err, user) {
		if (err) {
			User.findByEmail(username, role, function(e, user) {
				if (e) {
					callback('User not found');
				} else if (user.password !== password) {
					callback('Email password do not match');
				} else if (user.role !== role) {
					callback('Authorization failed');
				} else {
					callback(null, user);
				}
			});
		} else if (user && user.password !== password) {
			callback('Username password do not match');
		} else if (user && user.role !== role) {
			callback('Authorization failed');
		} else if (user){
			callback(null, user);
		} else{
			callback('Some error');
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
					user_id: user._id
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
	logger.access("[" + Date.now() + "] Request: [" + req.url + "] "+ JSON.stringify(req.body));
	next();
});

// router.use(authenticator);

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
	.delete(owner.deleteDJAccount);
	// .post(djHandler.joinPub);

router.route('/pub/:pubId/playlist')
	.put(djHandler.createPlaylist);

router.route('/pub/:pubId/playlist/:playlistId')
	.get(djHandler.getPlaylist)
	.post(djHandler.updatePlaylist)
	.delete(djHandler.deletePlaylist);

router.route('/pub/:long/:lat')
	.get(appHandler.getPubListByGeoTag);

router.route('/pub/:pubId/playlist')
	.get(appHandler.getCurrentPlaylist);

router.route('/pub/:pubId/playlist/:playlistId/song/:songId')
	.post(appHandler.upvoteSong);

//to be deprecated
router.get('/test', generateToken);

module.exports = router;