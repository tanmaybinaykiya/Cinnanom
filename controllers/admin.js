var User = require('../models/User');
var Roles = require('../Roles');

var AdminHandler = function() {
	var self = this;
	var acceptedRoles = ['ADMIN'];

	self.createOwner = function(request, response) {
		if (request.body.username && request.body.password) {
			User.createUser({
				username: request.body.username,
				password: request.body.password,
				email: '' || request.body.email,
				role: Roles.OWNER
			}, function(err, user) {
				if (err) {
					response.status(404).json({
						error: err
					});
				} else {
					response.status(201).json(user);
				}
			});
		} else {
			response.status(404).json({
				error: 'User or password not passed'
			});
		}
	};

	self.deleteOwner = function(request, response) {
		if (request.params.ownerId) {
			User.deleteUserByRoleAndId(request.params.ownerId, Roles.OWNER, function(err) {
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