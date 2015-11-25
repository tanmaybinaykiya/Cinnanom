var Pub = require('../models/Pub'),
    User = require('../models/User'),
    Roles = require('../enums/Role');
var Owner = function() {
    var self = this;
    var acceptedRoles = ['ADMIN', 'PUB'];

    self.registerPub = function(request, response) {
        if (request.body.name && request.body.loc) {
            console.log("self.registerPub")
            Pub.registerPub({
                name: request.body.name,
                address: '' || request.body.address,
                loc: request.body.loc,
                genre: '' || request.body.genre,
                playlists: request.body.playlists
            }, function(err, pub) {
                console.log("self.registerPub cb")
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
        if (request.params.pubId && request.body.username && request.body.password) {
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
                error: 'pubId, Username or password not passed'
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