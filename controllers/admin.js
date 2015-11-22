var User = require('../models/User');
var Role = require('../enums/Role');

var AdminHandler = function() {
	var self = this;
	var acceptedRoles = [Role.ADMIN];

	/**
	 * @api {put} /user Create an Owner
	 * @apiVersion 0.1.0
	 * @apiName createOwner
	 * @apiPermission Admin
	 *
	 * @apiDescription
	 *
	 * @apiParam {String} name Name of the User.
	 *
	 * @apiSuccess {String} id         The new Users-ID.
	 *
	 * @apiUse CreateUserError
	 */self.createOwner = function(request, response) {
		if (request.body.username && request.body.password) {
			User.createUser({
				username: request.body.username,
				password: request.body.password,
				email: '' || request.body.email,
				role: Role.OWNER
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
			User.deleteUserByRoleAndId(request.params.ownerId, Role.OWNER, function(err) {
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