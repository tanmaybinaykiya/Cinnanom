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

function SongPopulationFailed(message) {
  this.name = 'SongPopulationFailed';
  this.message = message || 'SongPopulationFailed';
  this.stack = (new Error()).stack;
}

SongPopulationFailed.prototype = Object.create(Error.prototype);
SongPopulationFailed.prototype.constructor = SongPopulationFailed;

module.exports.SongPopulationFailed=SongPopulationFailed;

function PlaylistPopulationFailed(message) {
  this.name = 'PlaylistPopulationFailed';
  this.message = message || 'PlaylistPopulationFailed';
  this.stack = (new Error()).stack;
}

PlaylistPopulationFailed.prototype = Object.create(Error.prototype);
PlaylistPopulationFailed.prototype.constructor = PlaylistPopulationFailed;

module.exports.PlaylistPopulationFailed=PlaylistPopulationFailed;

