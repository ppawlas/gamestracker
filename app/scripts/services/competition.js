'use strict';

app.factory('Competition', function (FIREBASE_URL, $firebaseObject, $firebaseArray) {
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
      return competitions.$remove(competition).then(function(competitionRef) {
        function removeDependentObject(parentName) {
          var obj = $firebaseObject(ref.child(parentName).child(competitionRef.key()));
          obj.$remove();
        }

        var userCompetition = $firebaseObject(
          ref.child('user_competitions').child(competition.creatorUID).child(competitionRef.key())
        );
        userCompetition.$remove();

        removeDependentObject('participants');
        removeDependentObject('standings');
        removeDependentObject('games');
      });
    },
    dependencies: function(name, competitionId) {
      return $firebaseObject(ref.child(name).child(competitionId));
    },
    standings: function(competitionId) {
      return $firebaseArray(ref.child('standings').child(competitionId));
    },
    updateStandings: function(games, competition) {
      var newStandings = createStandings(competition.participantsNumber);
      games.forEach(function(round) {
        round.forEach(function(game) {
          if (
            (game.player1 && game.player1.points !== undefined) &&
            (game.player2 && game.player2.points !== undefined)
          ) {
            updateGameStandings(newStandings, game);
          }
        });
      });
      var standingsRef = $firebaseObject(ref.child('standings').child(competition.$id));
      standingsRef.$value = newStandings;
      standingsRef.$save();
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
          player1: {participantId: roundRobinTables[0][game]},
          player2: {participantId: roundRobinTables[1][game]},
        };
      }
    }
    return games;
  }

  function getClearStandings() {
    return {
      pl: 0,  // played
      w: 0,   // won
      d: 0,   // draw
      l: 0,   // lost
      pf: 0,  // points for
      pa: 0,  // points against
      diff: 0,// points difference
      pts: 0  // points
    };
  }

  function createStandings(participantsNumber) {
    var standings = {};
    for (var i = 0; i < participantsNumber; i++) {
      standings[i] = getClearStandings();
      standings[i].participantId = i;
    }
    return standings;
  }

  function updateGameStandings(previousStandings, game) {
    function updatePlayerStandings(playerStandings, player, opponent) {
      function getResult(player, opponent) {
        if (player.points > opponent.points) { return 1; }
        if (player.points === opponent.points) { return 0; }
        if (player.points < opponent.points) { return -1; }
      }

      function getPoints(result) {
        if (result === 1) { return 3; }
        if (result === 0) { return 1; }
        if (result === -1) { return 0; }
      }

      var result = getResult(player, opponent);
      playerStandings.pl++;
      playerStandings.w += (result === 1 ? 1 : 0);
      playerStandings.l += (result === -1 ? 1 : 0);
      playerStandings.d += (result === 0 ? 1 : 0);
      playerStandings.pf += player.points;
      playerStandings.pa += opponent.points;
      playerStandings.diff += (player.points - opponent.points);
      playerStandings.pts += getPoints(result);
    }

    updatePlayerStandings(
      previousStandings[game.player1.participantId],
      game.player1, game.player2
    );

    updatePlayerStandings(
      previousStandings[game.player2.participantId],
      game.player2, game.player1
    );
  }

  return Competition;
});
