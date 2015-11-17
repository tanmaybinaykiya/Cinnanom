var Pub  = require('../models/Pub');
var User =  require('../models/User');
var Roles = require('../Roles');

var Owner = function() {
    var self = this;
    var acceptedRoles = ['ADMIN', 'PUB'];

    self.registerPub = function(request, response) {
        if (request.pub.name && request.pub.gpsLocation) {
            Pub.create({
                name: request.pub.name,
                address: '' || request.pub.address,
                gpsLocation: request.pub.gpsLocation,
                genre: '' || request.pub.genre
            }, function(err, pub) {
                if (err) {
                    response.status(404).json({
                        error: 'INTERNAL_SERVER_ERROR'
                    });
                } else {
                    // TODO
                    // associate 'request.decoded.user_id' owner with 'pubId'
                    // find user by user_id and 
                    response.status(201).json(pub);
                }
            });
        } else {
            response.status(404).json({
                error: 'Pub name and GPS Location not provided'
            });
        }
    };

    self.deletePub = function(request, response) {
        // TODO 
        // Authorize
        if (request.params.pubId) {
            Pub.deletePubById(request.params.pubId, function(err) {
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
                error: 'Pub id not provided'
            });
        }
    };

    self.getPubDetails = function(request, response) {
        // TODO 
        // Authorize
        if (request.params.pubId) {
            Pub.findPubById(request.params.pubId, function(err, pub) {
                if (err) {
                    response.status(404).json({
                        error: err
                    });
                } else {
                    response.status(200).json(pub);
                }
            });
        } else {
            response.status(404).json({
                error: 'Pub id not provided'
            });
        }
    };

    self.updatePubDetails = function(request, response) {
        // TODO 
        // Authorize
        if (request.params.pubId && request.pub) {
            Pub.updatePubById(request.params.pubId, request.pub, function(err, pub) {
                if (err) {
                    response.status(404).json({
                        error: err
                    });
                } else {
                    response.status(200).json(pub);
                }
            });
        } else {
            response.status(404).json({
                error: 'Pub id and Pub details not provided'
            });
        }
    };

    self.createDJAccount = function(request, response) {
        if (request.body.username && request.body.password) {
            User.createUser({
                username: request.body.username,
                password: request.body.password,
                email: '' || request.body.email,
                role: Roles.DJ
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

    self.deleteDJAccount = function(request, response) {
        // TODO 
        // authorize
        if (request.params.djId) {
            User.deleteUserByRoleAndId(request.params.djId, Roles.DJ, function(err) {
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

module.exports = new Owner();