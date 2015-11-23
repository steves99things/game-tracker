var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

// set up our schema
var matchSchema = new Schema({
	player: {
		id: ObjectId,
		name: String,
		email: String,
		score: {type: Number, required: true},
		initRank: Number,
		newRank: Number
	},
	opponent: {
		id: ObjectId,
		name: String,
		email: String,
		score: {type: Number, required: true},
		initRank: Number,
		newRank: Number
	},
	isPlayerWinner: Boolean,
	created_at: Date,
	updated_at: Date
});


matchSchema.pre('save', function(next) {

	// moved functionality to controller
	// this.isPlayerWinner = this.player.score > this.opponent.score;

	// set updated at to current date
	this.updated_at = new Date();

	// if it's a new record, add a created date
	if (!this.created_at) {
		this.created_at = new Date();
	}

	next();
});

var Match = mongoose.model('Match', matchSchema);

module.exports = Match;