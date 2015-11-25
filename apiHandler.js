var express = require('express');
var jwt = require('jsonwebtoken');

var adminHandler = require('./controllers/admin');
var owner = require('./controllers/owner');
var djHandler = require('./controllers/dj');
var appHandler = require('./controllers/app');
var config = require('./config');
var security = require('./security');
var Role = require('./enums/Role');

var router = express.Router();

router.use(function(req, res, next) {
	console.log("Access::\n\t" + /*"[" + Date.now() + "] "+*/req.method+": /api" + req.url + "\n\t" + JSON.stringify(req.body));
	next();
});

router.route('/token')
	.post(security.generateToken);

router.route('/owner/register')
	.put(security.authorize(Role.ADMIN), adminHandler.createOwner);

router.route('/owner/:ownerId')
	.delete(security.authorize(Role.ADMIN), adminHandler.deleteOwner);

router.route('/pub/register')
	.put(security.authorize(Role.OWNER), owner.registerPub);

router.route('/pub/:pubId')
	.delete(security.authorize(Role.OWNER), owner.deletePub)
	.get(security.authorize(Role.OWNER), owner.getPubDetails)
	.post(security.authorize(Role.OWNER), owner.updatePubDetails);

router.route('/pub/:pubId/dj')
	.put(security.authorize(Role.OWNER), owner.createDJAccount);

router.route('/pub/:pubId/dj/:djId')
	.delete(security.authorize(Role.OWNER), owner.deleteDJAccount);
// .post(djHandler.joinPub);

router.route('/pub/:pubId/playlist')
	.put(security.authorize(Role.DJ), djHandler.createPlaylist);

router.route('/pub/:pubId/playlist/:playlistId')
	.get(security.authorize(Role.DJ), djHandler.getPlaylist)
	.post(security.authorize(Role.DJ), djHandler.updatePlaylist)
	.delete(security.authorize(Role.DJ), djHandler.deletePlaylist);

router.route('/pub/:pubId/playlist/:playlistId/song')
	.put(security.authorize(Role.DJ), djHandler.addSong);

router.route('/pub/:pubId/playlist/:playlistId/song/:songId')
	.delete(security.authorize(Role.DJ), djHandler.removeSong);

router.route('/pub/:pubId/playlist/:playlistId/song/:songId')
	.post(security.authorize(Role.DJ), djHandler.updateSong);

router.route('/user/register')
	.put(appHandler.register);

router.route('/pub/:pubId/playlist')
	.get(security.authorize(Role.APP), appHandler.getCurrentPlaylist);

router.route('/pub/:long/:lat')
	.get(security.authorize(Role.APP), appHandler.getPubListByGeoTag);

router.route('/pub/:pubId/playlist/:playlistId/song/:songId/upvote')
	.post(security.authorize(Role.APP), appHandler.upvoteSong);

router.route('/test')
	.get(function(req, res, next) {
		console.log("test");
		next();
	}, function(req, res) {
		res.status(204).json({});
	});

module.exports = router;