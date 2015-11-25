var passport = require('passport');
var JwtStrategy = require('passport-jwt').Strategy;
var config = require('./config');

var opts = {}
opts.secretOrKey = config.secret;
passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
    console.log('jwt_payload: ', jwt_payload);
    try {
        if (jwt_payload.role === 'admin') {
            username = jwt_payload.username;
            password = jwt_payload.password;
            if (config.admin.user.indexOf(username) !== -1 && config.admin.user.indexOf(username) === config.admin.password.indexOf(password)) {
                done(null, jwt_payload);
            }
        } else if (jwt_payload.role === 'pub') {
            username = jwt_payload.username;
            password = jwt_payload.password;
            if (config.pub.user.indexOf(username) !== -1 && config.pub.user.indexOf(username) === config.pub.password.indexOf(password)) {
                done(null, jwt_payload);
            }
        } else if (jwt_payload.role === 'dj') {
            username = jwt_payload.username;
            password = jwt_payload.password;
            if (config.dj.user.indexOf(username) !== -1 && config.dj.user.indexOf(username) === config.dj.password.indexOf(password)) {
                done(null, jwt_payload);
            }
        } else if (jwt_payload.role === 'app') {
            username = jwt_payload.username;
            password = jwt_payload.password;
            if (config.app.user.indexOf(username) !== -1 && config.app.user.indexOf(username) === config.app.password.indexOf(password)) {
                done(null, jwt_payload);
            }
        } else {
            done('failed');
        }
    } catch (err) {
        console.log('error', err);
        done(err);
    }
}));

module.exports = passport;
