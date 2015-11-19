var jwt = require('jsonwebtoken');

var authenticator = module.exports = function(req, res, next) {
    token = req.get("Authorization") || req.body.token || req.query.token || req.headers['x-access-token'];;
    jwt.verify(token, config.secret, function(err, decoded) {
        if (!err) {
            req.decoded = decoded;
        } else if (err.name === 'JsonWebTokenError') {
            res.status(401).json({
                error: err.message
            });
        } else if (err.name === 'TokenExpiredError') {
            res.status(401).json({
                error: 'TOKEN_EXPIRED'
            });
        } else {
            res.status(500).json({
                error: 'INTERNAL_SERVER_ERROR'
            });
        }
    });
    next();
}