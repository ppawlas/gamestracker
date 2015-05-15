'use strict';

app.controller('CompetitionViewCtrl', function($scope, $stateParams, Competition, Auth) {
  $scope.user = Auth.user;
  $scope.signedIn = Auth.signedIn;

  $scope.competition = Competition.get($stateParams.competitionId);
  $scope.participants = Competition.participants($stateParams.competitionId);
  $scope.games = Competition.games($stateParams.competitionId);

  $scope.updateCompetition = function(competition) {
    Competition.update(competition);
  };
});
