'use strict';

app.factory('Competition', function (FIREBASE_URL, $firebaseObject, $firebaseArray) {
  var ref = new Firebase(FIREBASE_URL);
  var competitions = $firebaseArray(ref.child('competitions'));

  var Competition = {
    all: competitions,
    create: function (competition) {

      return competitions.$add(competition).then(function(competitionRef) {

        console.log('competitionRef', competitionRef);
        var userCompetition = $firebaseObject(
          ref.child('user_competitions')
          .child(competition.creatorUID)
          .child(competitionRef.key())
        );
        console.log(userCompetition);
        userCompetition.$value = true;
        userCompetition.$save();

        var participants = $firebaseObject(
          ref.child('participants')
          .child(competitionRef.key())
        );
        participants.$value = createParticipants(competition.participantsNumber);
        participants.$save();

        var games = $firebaseObject(
          ref.child('games')
          .child(competitionRef.key())
        );
        games.$value = createGames(competition.participantsNumber);
        games.$save();

        return competitionRef;
      });
    },
    get: function (competitionId) {
      console.log(competitionId);
      return $firebaseObject(ref.child('competitions').child(competitionId));
    },
    delete: function (competition) {
      return competitions.$remove(competition).then(function(competitionRef) {
        console.log(competition.creatorUID);
        console.log(competitionRef.key());
        var userCompetition = $firebaseObject(
          ref.child('user_competitions').child(competition.creatorUID).child(competitionRef.key())
        );
        userCompetition.$remove();

        var participants = $firebaseObject(ref.child('participants').child(competitionRef.key()));
        participants.$remove();

        var games = $firebaseObject(ref.child('games').child(competitionRef.key()));
        games.$remove();
      });
    },
    games: function (competitionId) {
      return $firebaseArray(ref.child('games').child(competitionId));
    },
    participants: function (competitionId) {
      return $firebaseArray(ref.child('participants').child(competitionId));
    }
  };

  function createParticipants(participantsNumber) {
    console.log('createParticipants(' + participantsNumber + ')');
    var participants = {};
    for (var i = 0; i < participantsNumber; i++) {
      participants[i] = {
        name: 'Player ' + (i + 1)
      };
    }
    console.log('participants', participants);
    return participants;
  }

  function createGames(participantsNumber) {
    console.log('createGames(' + participantsNumber + ')');
    function getRoundRobinTables(n, round) {
    	round = (round === undefined) ? 0 : round;

    	var tables = [[],[]];
    	var start = 0, participant = round, i;
    	if (n % 2 === 1) {
    		tables[0].push(null);
    		start++;
    	}

    	for (i = start; i < Math.ceil(n/2); i++) {
    		tables[0].push(participant++ % n);
    	}
    	for (i = 0; i < Math.ceil(n/2); i++) {
    		tables[1].push(participant++ % n);
    	}
    	tables[1] = tables[1].reverse();

    	return tables;
    }

    var games = [];
    for (var round = 0; round < (Math.ceil(participantsNumber / 2) * 2); round++) {
      games.push([]); // new round
      var roundRobinTables = getRoundRobinTables(participantsNumber, round);
      for (var participant = 0; participant < (Math.ceil(participantsNumber) / 2); participant++) {
        games[round].push({
          player1: {participantId: roundRobinTables[0][participant]},
          player2: {participantId: roundRobinTables[1][participant]},
        });
      }
    }
    console.log('games', games);
    return games;
  }

  return Competition;
});
