'use strict';

app.controller('AuthCtrl', function($scope, $location, Auth, user) {

  if (user) {
    $location.path('/');
  }

  $scope.login = function() {
    Auth.login($scope.user).then(function() {
      $location.path('/');
    }, function(error) {
      $scope.error = error.toString();
    });
  };

  $scope.register = function() {
    Auth.register($scope.user).then(function(user) {
      return Auth.login($scope.user).then(function() {
        user.battleTag = $scope.user.battleTag;
        return Auth.createProfile(user);
      }).then(function() {
        $location.path('/');
      });
    }, function(error) {
      $scope.error = error.toString();
    });
  };
});
