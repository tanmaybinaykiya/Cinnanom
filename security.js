var jwt = require('jsonwebtoken'),
    logger = require('./logger'),
    User = require('./models/User'),
    config = require('./config');

function decode(req, cb) {
    token = req.get("Authorization") || req.query.access_token || req.body.access_token || req.headers['x-access-token'];
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

function verifyUser(username, email, password, callback) {
    User.findByUsername(username, function(err, user) {
        if (err) {
            User.findByEmail(email, function(e, user) {
                if (e) {
                    logger.error("findByEmail", e);
                    callback('INTERNAL_SERVER_ERROR');
                } else if (user && user.password !== password) {
                    logger.error('Email password do not match');
                    callback('Email password do not match');
                } else if (user) {
                    callback(null, user);
                } else {
                    logger.error('User not found: ' +
                        '{ ' +
                        'username:' + username + ', ' +
                        'email:' + email + ', ' +
                        'password:' + password +
                        '}');
                    callback('User not found');
                }
            });
        } else if (user && user.password !== password) {
            logger.error('Username password do not match');
            callback('Username password do not match');
        } else if (user) {
            callback(null, user);
        } else {
            logger.error('User not found: ' +
                '{ ' +
                'username:' + username + ', ' +
                'email:' + email + ', ' +
                'password:' + password +
                '}');
            callback('User not found');
        }
    });
}

var security = module.exports = new function() {
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
                        expiresInMinutes: config.tokenExpiryInMinutes // expires in 1 hour
                    });
                    res.json({
                        token: access_token
                    });
                } else {
                    logger.error("Error generating Token", err.stack.split("\n"));
                    res.status(401).json({
                        error: err
                    });
                }
            });
        } else {
            res.status(401).end();
        }
    }
    self.authorize = function(role) {
        return function(req, res, next) {
            decode(req, function(err, decoded) {
                if (err) {
                    res.status(401).json({
                        error: err
                    });
                } else if (!err && decoded && decoded.role === role) {
                    logger.info("Role: ", role);
                    req.decoded = decoded;
                    next();
                } else {
                    res.status(403).json({
                        error: 'AUTHORIZATION FAILED'
                    });
                }
            });

        }
    }
}