var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var logger = require('../logger');

var UserSchema = new Schema({
    username: String,
    password: String,
    email: String,
    role: String
}/*, {
    strict: true
}*/);


var User = mongoose.model("User", UserSchema);

var UserManager = function() {
    var self = this;
    self.createUser = function(user, cb) {
        User.create(user, function(err, doc) {
            if (err) {
                logger.error(err.stack.split("\n"));
            }
            cb(err, doc);
        });
    };

    self.deleteUserByRoleAndId = function(objectId, role, cb) {
        User.findAndRemove({
            _id: objectId,
            role: role
        }, function(e, user) {
            if (e) {
                logger.error(e.stack.split("\n"));
                cb(e);
            } else {
                cb(null);
            }
        });
    };

    self.findByUsername = function(user_name, cb) {
        User.findOne({
            username: user_name
        }, function(e, user) {
            if (e) {
                logger.error(e.stack.split("\n"));
                cb(e);
            } else if (user) {
                cb(null, user);
            } else {
                logger.info('User does not exist');
                cb('User does not exist');
            }
        });
    };

    self.findByEmail = function(email, cb) {
        User.findOne({
            email: email
        }, function(e, user) {
            if (e) {
                logger.error(e.stack.split("\n"));
                cb('User does not exist');
            } else if (user) {
                cb(null, user);
            } else {
                cb('User does not exist');
            }
        });
    };

};

module.exports = new UserManager();