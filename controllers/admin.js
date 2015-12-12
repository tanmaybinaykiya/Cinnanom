'use strict';
var User = require('../models/User'),
	Role = require('../enums/Role'),
	logger = require('../util/logger'),
	Errors = require('../util/Errors');

var AdminHandler = function () {
	var self = this,
		acceptedRoles = [Role.ADMIN];

	self.createOwner = function (request, response) {
		if (request.body.username && request.body.password) {
			User.createUser({
				username: request.body.username,
				password: request.body.password,
				email: request.body.email || '',
				role: Role.OWNER
			}, function (err, obj) {
				if (err && err instanceof Errors.EntityAlreadyExists){
					response.status(304).json({
						error: 'User already exists'
					});
				} else if (err){
					response.status(500).json({
						error: err
					});
				} else if (obj) {
					response.status(201).json(obj);
				} else {
					response.status(500).end();
				}
			});
		} else {
			response.status(404).json({
				error: 'User or password not passed'
			});
		}
	};

	self.deleteOwner = function (request, response) {
		if (request.params.ownerId) {
			User.deleteUserByRoleAndId(request.params.ownerId, Role.OWNER, function (err) {
				if (err) {
					response.status(404).json({
						error: err
					});
				} else {
					response.status(200).end();
				}
			});
		} else {
			response.status(404).json({
				error: 'user not found'
			});
		}
	};
};

module.exports = new AdminHandler();