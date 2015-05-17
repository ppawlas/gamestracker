'use strict';

app.controller('CompetitionViewCtrl', function($scope, $stateParams, Competition, Auth) {
  $scope.user = Auth.user;
  $scope.signedIn = Auth.signedIn;

  $scope.competition = Competition.get($stateParams.competitionId);
  $scope.participants = Competition.dependencies('participants', $stateParams.competitionId);
  $scope.games = Competition.dependencies('games', $stateParams.competitionId);
  $scope.standings = Competition.standings($stateParams.competitionId);
  $scope.updateStandings = Competition.updateStandings;

  $scope.noAuth = function() {
    return $scope.user.uid !== $scope.competition.creatorUID;
  };

  $scope.pauseGame = function(game) {
    return game.player1 === undefined || game.player2 === undefined;
  };

  $scope.getName = function(standing) {
    return $scope.participants[standing.participantId].name;
  };

  $scope.updateCompetition = function(competition) {
    Competition.update(competition);
  };
});
