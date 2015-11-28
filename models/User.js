var mongoose = require('mongoose'),
    logger= require('../logger');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
        username: String,
        password: String,
        email: String,
        role: String
    }
    , {
        strict: true
    }
);


var User = mongoose.model("User", UserSchema);

var UserManager = function() {
    var self = this;
    self.createUser = function(user, cb) {
        User.create(user).then(function(obj) {
            cb(null, obj);
        }, function(err) {
            cb(err);
        });
    };

    self.deleteUserByRoleAndId = function(objectId, role, cb) {
        User.findAndRemove({
            _id: objectId,
            role: role
        }, function(e, user) {
            if (e) {
                logger.error("error deleteUserByRoleAndId", e.stack.split("\n"));
                cb(e);
            } else {
                cb(null);
            }
        });
    };

    self.findByUsername = function(user_name, cb) {
        User.findOne({
            username: user_name
        }, function(err, user) {
            if (err) {
                logger.error("error findByUsername", err.stack.split("\n"));
                cb(err);
            } else if (user) {
                cb(null, user);
            } else {
                logger.error('User does not exist');
                cb('User does not exist');
            }
        });
    };

    self.findByEmail = function(email, cb) {
        User.findOne({
            email: email
        }, function(e, user) {
            if (err) {
                logger.error("error findByEmail", err.stack.split("\n"));
                cb(err);
            } else if (user) {
                cb(null, user);
            } else {
                cb('User does not exist');
            }
        });
    };

};

module.exports = new UserManager();