var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.ObjectId;

var Player = require('../models/players');
var Match = require('../models/matches');

/* GET home page. (log a match)*/
router.get('/', function(req, res, next) {
	// sort players by name alphabetically for drop downs
	Player.find().sort({_lowerCaseName: 'asc'}).exec(function(err, players) {
		if (err) throw err;
			res.render('index', { 
		  		title: 'Log a Match',
		  		players: players
		  	});
	});
});

// get Leaderboard page
router.get('/leaderboard', function(req, res, next) {
	Player.find().sort({rank: 'desc'}).exec(function(err, players) {
		if (err) throw err;
		res.render('leaderboard', {
			title: 'Leaderboard',
			players: players
		});
	});
});

function createPlayer(options, cb) {
	var _scope = this;
	this.opt = options;

	this.player = new Player();
	this.player.name = this.opt.name;
	this.player.email = this.opt.email;

	this.player.save(function(err) {
		if (err) {
			// duplicate entry 
			if (err.code == 11000) {
				console.log(err);
				// return res.json({success: false, message: 'that user already exists.'});

				// find the player with that email
				Player.findOne({email: player.email}, function(err, newPlayer) {
					if (err) throw err;
					console.log('this is the duplicate: ' + newPlayer);

					return cb(newPlayer);
				});
			} else {
				return res.send(err);
			}
		} else {
			return cb(_scope.player);
		}
	});
}

// POST match information
router.post('/match', function(req, res) {
	// create the player
	createPlayer({
		name: req.body.playerName,
		email: req.body.playerEmail
	}, function(player) {
		// create the opponent
		createPlayer({
			name: req.body.opponentName,
			email: req.body.opponentEmail
		}, function(opponent) {
			console.log('this is the player: ' + player['name']);
			console.log('this is the opponent: ' + opponent['name']);

			player.score = req.body.playerScore;
			opponent.score = req.body.opponentScore;

			// create match details for player and opponent
			var playerMatch = getMatchDetails(player, opponent);
			var opponentMatch = getMatchDetails(opponent, player);


			// save the player's new rank
			player.rank = playerMatch.player.newRank;
			player.save(function(err) {
				if (err) throw err;
			});

			// save the opponent's new rank
			opponent.rank = opponentMatch.player.newRank;
			opponent.save(function(err) {
				if (err) throw err;
			});

			// save match for player
			playerMatch.save(function(err) {
				if (err) throw err;

				// save match for opponent
				opponentMatch.save(function(err) {
					if (err) throw err;
					res.redirect('/');
				});
			});
		});
	});
});

function getNewRankingsFromMatch(match) {
	this.match = match;
	var isPlayerHigherRank = this.match.player.initRank > this.match.opponent.initRank;

	// set the newrank to the initrank so we can calculate easier...
	this.match.player.newRank = this.match.player.initRank;
	
	if (this.match.isPlayerWinner) {
		if (isPlayerHigherRank) {
			this.match.player.newRank += 5;
			this.match.opponent.newRank -= 5;
		} else {
			this.match.player.newRank += 10;
			this.match.opponent.newRank -= 10;
		}
	} else {
		if (isPlayerHigherRank) {
			this.match.player.newRank -= 10;
			this.match.opponent.newRank += 10;
		} else {
			this.match.player.newRank -= 5;
			this.match.opponent.newRank +=5;
		}
	}

	return {
		playerRank: this.match.player.newRank,
		opponentRank: this.match.opponent.newRank
	}
}

function getMatchDetails(player, opponent) {
	var match = new Match();

	// set player information
	match.player.id = player._id;
	match.player.name = player.name;
	match.player.email = player.email;
	match.player.score = player.score;
	match.player.initRank = player.rank;

	// set opponent information
	match.opponent.id = opponent._id;
	match.opponent.name = opponent.name;
	match.opponent.email = opponent.email;
	match.opponent.score = opponent.score;
	match.opponent.initRank = opponent.rank;

	match.isPlayerWinner = match.player.score > match.opponent.score;

	var rankings = getNewRankingsFromMatch(match);
	match.player.newRank = rankings.playerRank;
	match.opponent.newRank = rankings.opponentRank;

	return match;
}

function getWinningMatchesByPlayerId(playerId, cb) {

	var _scope = this;
	this.playerId= playerId;

	Match.find({'isPlayerWinner': true, 'player.id': playerId }, function(err, matches) {
		if (err) throw err;

		return cb(matches);
	});
}

function getLosingMatchesByPlayerId(playerId, cb) {
	var _scope = this;
	this.playerId = playerId;

	Match.find({'isPlayerWinner': false, 'player.id': playerId }, function(err, matches) {
		if (err) throw err;
		
		return cb(matches);
	});
}

// get player page
router.get('/player/:id', function(req, res, next) {
	Player.findOne({_id: req.params.id}, function(err, player) {
		if (err) throw err;

		// get wins for player
		getWinningMatchesByPlayerId(player._id, function(wins) {
			if (err) throw err;
			// get losses for player
			getLosingMatchesByPlayerId(player._id, function(losses) {
				if (err) throw err;
				console.log('losses ' + losses);

				res.render('player', {
					title: player.name,
					player: player,
					wins: wins,
					losses: losses
				});
			});
		});
	});
});

module.exports = router;