'use strict';

app.controller('CompetitionCtrl', function($scope, $state, Competition, Auth) {
  $scope.user = Auth.user;
  $scope.signedIn = Auth.signedIn;

  $scope.newCompetition = {name: '', participantsNumber: 0};

  $scope.competitions = Competition.all;

  $scope.createCompetition = function() {
    $scope.newCompetition.creator = $scope.user.profile.battleTag;
    $scope.newCompetition.creatorUID = $scope.user.uid;
    Competition.create($scope.newCompetition).then(function(ref) {
      $scope.newCompetition = {name: '', participantsNumber: 0};
      $state.go('competition', {competitionId: ref.name()});
    });
  };

  $scope.deleteCompetition = function(competition) {
    Competition.delete(competition);
  };

  $scope.createState = function() {
    return $state.is('/.create');
  };
});
