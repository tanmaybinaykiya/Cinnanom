var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var logger = require('../logger');

var UserSchema = new Schema({
	username: String,
	password: String,
	email: String,
	role: String
});

// animalSchema.methods.findSimilarTypes = function (cb) {
//   return this.model('Animal').find({ type: this.type }, cb);
// }

var User = mongoose.model("User", UserSchema);

var UserManager = function() {
	var self = this;
	self.createUser = function(user, cb) {
		User.create(user, function(err, doc) {
			if (err) {
				cb(err);
			} else {
				cb(null, doc);
			}
		});
	};

	self.deleteUserByRoleAndId = function(objectId, role, cb) {
		User.findAndRemove({_id:objectId, role:role}, function(e, user) {
			if (e) {
				cb(e);
			} else {
				cb(null);
			}
		});
	};

	self.findByUsername = function(user_name, role, cb) {
		User.findOne({
			username: user_name
		}, function(e, user) {
			if (e) {
				cb(e);
			} else if (user) {
				cb(null, user);
			} else {
				cb('User does not exist');
			}
		});
	};

	self.findByEmail = function(email, role, cb) {
		User.findOne({
			email: email
		}, function(e, user) {
			if (e) {
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

/*
p.save(function (err) {
  if (err) return handleError(err);
  Page.findById(p, function (err, doc) {
    if (err) return handleError(err);
    logger.info(doc); // { name: 'mongodb.org', _id: '50341373e894ad16347efe12' }
  })
})

*/