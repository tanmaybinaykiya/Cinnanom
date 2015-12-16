'use strict';
var jwt = require('jsonwebtoken'),
    logger = require('../util/logger'),
    User = require('../models/User'),
    config = require('../conf/config');

function verifyToken(token, cb) {
    jwt.verify(token, config.secret, function(err, decoded) {
        if (!err) {
            cb(null, decoded);
        } else if (err.name === 'JsonWebTokenError') {
            cb(err.message);
        } else if (err.name === 'TokenExpiredError') {
            cb('TOKEN_EXPIRED');
        } else {
            cb('INTERNAL_SERVER_ERROR');
        }
    });
}

function extractTokenFromRequest(req) {
    return req.get("Authorization") || req.headers['x-access-token'];
}

function extractTokenFromWSRequest(req) {
    return req.headers["Authorization"];
}


function verifyUser(username, email, password, callback) {
    User.findByUsername(username, function(err, user) {
        if (err) {
            logger.error("findByUsername", err);
            callback('INTERNAL_SERVER_ERROR');
        } else if (user && user.password !== password) {
            logger.error('Username password do not match');
            callback('Username password do not match');
        } else if (user) {
            callback(null, user);
        } else {
            logger.error('User not found: ' + username);
            callback('User not found');
        }
    });
}

var Security = function() {
    var self = this;

    self.generateToken = function(req, res) {
        var username = req.body.username,
            email = req.body.email,
            password = req.body.password;
        if (username && password) {
            verifyUser(username, email, password, function(err, user) {
                if (!err && user) {
                    var access_token = jwt.sign({
                        role: user.role,
                        user_id: user._id
                    }, config.secret, {
                        expiresIn: config.tokenExpiryInMinutes // expires in 1 hour
                    });
                    res.status(200).json({
                        token: access_token
                    });
                } else if (err) {
                    logger.error("Error generating Token", JSON.stringify(err, null, 4));
                    res.status(401).json({
                        error: err
                    });
                } else {
                    logger.error("User not found");
                    res.status(401).json({
                        error: "User not found"
                    });
                }
            });
        } else {
            res.status(401).end();
        }
    };

    self.authorizeRequests = function(role) {
        return function(req, res, next) {
            var token = extractTokenFromRequest(req);
            if (token) {
                verifyToken(token, function(err, decoded) {
                    if (err) {
                        res.status(401).json({
                            error: err
                        });
                    } else if (decoded && decoded.role === role) {
                        logger.info("Role: ", role);
                        req.decoded = decoded;
                        next();
                    } else {
                        res.status(403).json({
                            error: 'AUTHORIZATION FAILED'
                        });
                    }
                });
            } else {
                res.status(403).json({
                    error: 'NO TOKEN PASSED'
                });
            }
        };
    };

    self.authorizeWS = function(role) {
        return function(req, done) {
            logger.info('authorizing');
            var token = extractTokenFromWSRequest(req);
            if (token) {
                logger.info('verifyToken');
                verifyToken(token, function(err, decoded) {
                    if (err) {
                        logger.error(err);
                        done({
                            statusCode: 500,
                            message: err.message
                        });
                    } else if (decoded && decoded.role === role) {
                        logger.info('Allowing');
                        req.decoded = decoded;
                        done(null, decoded);
                    } else {
                        logger.info('Failed');

                        done({
                            statusCode: 403,
                            message: 'Authorization Failed'
                        });
                    }
                });
            } else {
                logger.info('token illa');
                done({
                    statusCode: 400,
                    message: 'No token passed'
                });
            }
        };
    };

};

module.exports = new Security();