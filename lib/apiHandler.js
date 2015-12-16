'use strict';
var express = require('express'),
	jwt = require('jsonwebtoken'),
	logger = require('../util/logger'),
	adminHandler = require('../controllers/admin'),
	owner = require('../controllers/owner'),
	djHandler = require('../controllers/dj'),
	appHandler = require('../controllers/app'),
	config = require('../conf//config'),
	security = require('../controllers/security'),
	Role = require('../enums/Role');

var router = express.Router();

router.use(function(req, res, next) {
	logger.info("Method: "+ req.method)
	logger.info("Path: /api" + req.url)
	if(Object.keys(req.body).length){
		logger.info("Obj: " +JSON.stringify(req.body, null, 4))
	}
	next();
});

router.route('/token')
	.post(security.generateToken);

router.route('/owner/register')
	.put(security.authorizeRequests(Role.ADMIN), adminHandler.createOwner);

router.route('/owner/:ownerId')
	.delete(security.authorizeRequests(Role.ADMIN), adminHandler.deleteOwner);

router.route('/pub/register')
	.put(security.authorizeRequests(Role.OWNER), owner.registerPub);

router.route('/pub/:pubId')
	.delete(security.authorizeRequests(Role.OWNER), owner.deletePub)
	.get(security.authorizeRequests(Role.OWNER), owner.getPubDetails)
	.post(security.authorizeRequests(Role.OWNER), owner.updatePubDetails);

router.route('/pub/:pubId/dj')
	.put(security.authorizeRequests(Role.OWNER), owner.createDJAccount);

router.route('/pub/:pubId/dj/:djId')
	.delete(security.authorizeRequests(Role.OWNER), owner.deleteDJAccount);

router.route('/pub/:pubId/playlist/:playlistId/song/:songId/upvote')
	.post(security.authorizeRequests(Role.APP), appHandler.upvoteSong);

router.route('/pub/:pubId/playlist/:playlistId/song')
	.put(security.authorizeRequests(Role.DJ), djHandler.addSong);

router.route('/pub/:pubId/playlist/:playlistId/song/:songId')
	.delete(security.authorizeRequests(Role.DJ), djHandler.removeSong);

router.route('/pub/:pubId/playlist/:playlistId/song/:songId')
	.post(security.authorizeRequests(Role.DJ), djHandler.updateSong);

router.route('/pub/:pubId/playlist')
	.put(security.authorizeRequests(Role.DJ), djHandler.createPlaylist);

router.route('/pub/:pubId/playlist/:playlistId')
	.get(security.authorizeRequests(Role.DJ), djHandler.getPlaylist)
	.post(security.authorizeRequests(Role.DJ), djHandler.updatePlaylist)
	.delete(security.authorizeRequests(Role.DJ), djHandler.deletePlaylist);

router.route('/user/register')
	.put(appHandler.register);

router.route('/pub/:pubId/playlist')
	.get(security.authorizeRequests(Role.APP), appHandler.getCurrentPlaylist);

router.route('/pub')
	.get(security.authorizeRequests(Role.APP), appHandler.getPubListByGeoTag);

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