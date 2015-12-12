'use strict';
var express = require('express'),
	jwt = require('jsonwebtoken'),
	logger = require('./util/logger'),
	adminHandler = require('./controllers/admin'),
	owner = require('./controllers/owner'),
	djHandler = require('./controllers/dj'),
	appHandler = require('./controllers/app'),
	config = require('./config'),
	security = require('./controllers/security'),
	Role = require('./enums/Role');

var router = express.Router();

router.use(function(req, res, next) {
	logger.info("\n" + req.method + ": /api" + req.url + "\n\t" + JSON.stringify(req.body, null, 4));
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

router.route('/pub/:pubId/playlist/:playlistId/song/:songId/upvote')
	.post(security.authorize(Role.APP), appHandler.upvoteSong);

router.route('/pub/:pubId/playlist/:playlistId/song')
	.put(security.authorize(Role.DJ), djHandler.addSong);

router.route('/pub/:pubId/playlist/:playlistId/song/:songId')
	.delete(security.authorize(Role.DJ), djHandler.removeSong);

router.route('/pub/:pubId/playlist/:playlistId/song/:songId')
	.post(security.authorize(Role.DJ), djHandler.updateSong);

router.route('/pub/:pubId/playlist')
	.put(security.authorize(Role.DJ), djHandler.createPlaylist);

router.route('/pub/:pubId/playlist/:playlistId')
	.get(security.authorize(Role.DJ), djHandler.getPlaylist)
	.post(security.authorize(Role.DJ), djHandler.updatePlaylist)
	.delete(security.authorize(Role.DJ), djHandler.deletePlaylist);

router.route('/user/register')
	.put(appHandler.register);

router.route('/pub/:pubId/playlist')
	.get(security.authorize(Role.APP), appHandler.getCurrentPlaylist);

router.route('/pub')
	.get(security.authorize(Role.APP), appHandler.getPubListByGeoTag);

router.route('/test')
	.get(function(req, res, next) {
		logger.info("test");
		next();
	}, function(req, res) {
		res.status(200).json({
			lala: "lala"
		});
	});

module.exports = router;