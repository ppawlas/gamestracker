'use strict';

app.factory('Competition', function (FIREBASE_URL, $firebaseObject, $firebaseArray, $q) {
  var ref = new Firebase(FIREBASE_URL);
  var competitions = $firebaseArray(ref.child('competitions'));

  var Competition = {
    all: competitions,
    create: function (competition) {

      return competitions.$add(competition).then(function(competitionRef) {
        function saveDependentObject(parentName, constructorFunction) {
          var obj = $firebaseObject(
            ref.child(parentName)
            .child(competitionRef.key())
          );
          obj.$value = constructorFunction(competition.participantsNumber);
          obj.$save();
        }

        var userCompetition = $firebaseObject(
          ref.child('user_competitions')
          .child(competition.creatorUID)
          .child(competitionRef.key())
        );
        userCompetition.$value = true;
        userCompetition.$save();

        saveDependentObject('participants', createParticipants);
        saveDependentObject('standings', createStandings);
        saveDependentObject('games', createGames);

        return competitionRef;
      });
    },
    get: function (competitionId) {
      return $firebaseObject(ref.child('competitions').child(competitionId));
    },
    delete: function (competition) {
      function removeDependentObject(parentName) {
        return $firebaseObject(ref.child(parentName).child(competition.$id)).$remove();
      }

      $q.all([
        removeDependentObject('participants'),
        removeDependentObject('standings'),
        removeDependentObject('games'),

        $firebaseObject(ref
          .child('user_competitions')
          .child(competition.creatorUID)
          .child(competition.$id)
        ).$remove()
      ]).then(function() {
        return competitions.$remove(competition);
      });
    },
    dependencies: function(name, competitionId) {
      return $firebaseObject(ref.child(name).child(competitionId));
    },
    standings: function(competitionId) {
      return $firebaseArray(ref.child('standings').child(competitionId));
    },
    updateStandings: function(game, competitionId) {
      function addPlayerStandings(participantId, playerStandings) {
        var playerStandingsRef = $firebaseObject(ref
          .child('standings')
          .child(competitionId)
          .child(participantId)
          .child('games')
          .child(game.gameId)
        );
        playerStandingsRef.$value = playerStandings;
        return playerStandingsRef.$save();
      }

      function updatePlayerStandings(participantId) {
        var playerStandingsRef = $firebaseObject(ref
          .child('standings')
          .child(competitionId)
          .child(participantId)
        );
        playerStandingsRef.$loaded()
          .then(function(playerStandings) {
            var total = sumPlayerStandings(playerStandings);
            var totalRef = $firebaseObject(ref
              .child('standings')
              .child(competitionId)
              .child(participantId)
              .child('total')
            );
            totalRef.$value = total;
            return totalRef.$save();
          });
      }

      if (
        (game.player1 && game.player1.points !== undefined) &&
        (game.player2 && game.player2.points !== undefined)
      ) {
        var gameStandings = getGameStandings(game.id, game.player1, game.player2);

        $q.all([
          addPlayerStandings(game.player1.participantId, gameStandings.player1),
          addPlayerStandings(game.player2.participantId, gameStandings.player2)
        ]).then(function() {
          updatePlayerStandings(game.player1.participantId);
          updatePlayerStandings(game.player2.participantId);
        });
      }
    }
  };

  /*
  Private functions
  */

  function createParticipants(participantsNumber) {
    var participants = {};
    for (var i = 0; i < participantsNumber; i++) {
      participants[i] = {
        name: 'Player ' + (i + 1)
      };
    }
    return participants;
  }

  function createGames(participantsNumber) {
    function getRoundRobinTables(n, round) {
    	round = (round === undefined) ? 0 : round;

    	var tables = [[],[]];
    	var participant = round, offset = 0, d = n, i;
    	if (n % 2 === 1) {
    		tables[0].push(null);
    	} else {
        tables[0].push(0);
        offset++;
        d--;
      }

    	for (i = 1; i < Math.ceil(n/2); i++) {
    		tables[0].push(offset + participant++ % d);
    	}
    	for (i = 0; i < Math.ceil(n/2); i++) {
    		tables[1].push(offset + participant++ % d);
    	}
    	tables[1] = tables[1].reverse();

    	return tables;
    }

    var games = [];
    for (var round = 0; round < participantsNumber - (participantsNumber % 2 === 0 ? 1 : 0); round++) {
      games.push({}); // new round
      var roundRobinTables = getRoundRobinTables(participantsNumber, round);
      for (var game = 0; game < (Math.ceil(participantsNumber) / 2); game++) {
        games[round][game] = {
          gameId: 'r' + round + 'g' + game,
          player1: {participantId: roundRobinTables[0][game]},
          player2: {participantId: roundRobinTables[1][game]},
        };
      }
    }
    return games;
  }

  function createStandings(participantsNumber) {
    var standings = {};
    for (var i = 0; i < participantsNumber; i++) {
      standings[i] = {
        participantId: i,
          total: {
          pl: 0,
          w: 0,
          l: 0,
          d: 0,
          pf: 0,
          pa: 0,
          diff: 0,
          pts: 0
        },
        games: {}
      };
    }
    return standings;
  }

  function sumPlayerStandings(playerStandings) {
    var total = {};
    Object.keys(playerStandings.total).forEach(function(key) {
      total[key] = Object.keys(playerStandings.games).reduce(function(previous, game) {
        return previous + playerStandings.games[game][key];
      }, 0);
    });
    return total;
  }

  function getGameStandings(gameId, player1, player2) {
    function getResult(player1, player2) {
      if (player1.points > player2.points) { return 1; }
      if (player1.points === player2.points) { return 0; }
      if (player1.points < player2.points) { return -1; }
    }

    function getPoints(result) {
      if (result === 1) { return 3; }
      if (result === 0) { return 1; }
      if (result === -1) { return 0; }
    }

    var gameStandings = {
      gameId: gameId,
      player1: {},
      player2: {}
    };
    var result = getResult(player1, player2);

    gameStandings.player1.pl = 1;
    gameStandings.player2.pl = 1;

    gameStandings.player1.w = (result === 1 ? 1 : 0);
    gameStandings.player2.w = (result === 1 ? 0 : 1);

    gameStandings.player1.l = (result === -1 ? 1 : 0);
    gameStandings.player2.l = (result === -1 ? 0 : 1);

    gameStandings.player1.d = (result === 0 ? 1 : 0);
    gameStandings.player2.d = (result === 0 ? 1 : 0);

    gameStandings.player1.pf = player1.points;
    gameStandings.player2.pf = player2.points;

    gameStandings.player1.pa = player2.points;
    gameStandings.player2.pa = player1.points;

    gameStandings.player1.diff = player1.points - player2.points;
    gameStandings.player2.diff = player2.points - player1.points;

    gameStandings.player1.pts = getPoints(result);
    gameStandings.player2.pts = getPoints(-1 * result);

    return gameStandings;
  }

  return Competition;
});
