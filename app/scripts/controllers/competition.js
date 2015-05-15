'use strict';

app.controller('CompetitionCtrl', function($scope, Competition, Auth) {
  $scope.user = Auth.user;
  $scope.signedIn = Auth.signedIn;

  $scope.newCompetition = {name: '', participantsNumber: 0};

  $scope.competitions = Competition.all;

  $scope.createCompetition = function() {
    $scope.newCompetition.creator = $scope.user.profile.battleTag;
    $scope.newCompetition.creatorUID = $scope.user.uid;
    Competition.create($scope.newCompetition).then(function() {
      $scope.newCompetition = {name: '', participantsNumber: 0};
    });
  };

  $scope.deleteCompetition = function(competition) {
    Competition.delete(competition);
  };
});
