var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up our schema
var playerSchema = new Schema({
	name: {type: String, required: true},
	_lowerCaseName: String,
	email: {type: String, required: true, unique: true},
	rank: {type: Number, default: 1200},
	created_at: Date,
	updated_at: Date
});


playerSchema.pre('save', function(next) {

	// if a player has no rank, set it to 1200
	if (!this.rank) {
		this.rank = 1200;
	}

	// set the player's email to lowercase
	this.email = this.email.toLowerCase();
	this._lowerCaseName = this.name.toLowerCase();

	// set updated at to current date
	this.updated_at = new Date();

	// if it's a new record, add a created date
	if (!this.created_at) {
		this.created_at = new Date();
	}

	next();
});

var Player = mongoose.model('Player', playerSchema);

module.exports = Player;