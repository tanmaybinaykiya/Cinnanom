function EntityAlreadyExists(message) {
  this.name = 'EntityAlreadyExists';
  this.message = message || 'EntityAlreadyExists';
  this.stack = (new Error()).stack;
}

EntityAlreadyExists.prototype = Object.create(Error.prototype);
EntityAlreadyExists.prototype.constructor = EntityAlreadyExists;

module.exports.EntityAlreadyExists=EntityAlreadyExists;

function EntityNotFound(message) {
  this.name = 'EntityNotFound';
  this.message = message || 'EntityNotFound';
  this.stack = (new Error()).stack;
}

EntityNotFound.prototype = Object.create(Error.prototype);
EntityNotFound.prototype.constructor = EntityNotFound;

module.exports.EntityNotFound=EntityNotFound;

