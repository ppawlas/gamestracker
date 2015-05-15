'use strict';

app.controller('DashCtrl', function($scope, Competition, Auth) {
  $scope.user = Auth.user;
  $scope.signedIn = Auth.signedIn;

  $scope.competition = {name: '',participantsNumber: 0};

  $scope.createCompetition = function() {
    $scope.competition.creator = $scope.user.profile.battleTag;
    $scope.competition.creatorUID = $scope.user.uid;
    Competition.create($scope.competition).then(function() {
      $scope.competition = {name: '',participantsNumber: 0,cycles: 1};
    });
  };
});
