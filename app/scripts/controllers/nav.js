'use strict';

app.controller('NavCtrl', function($scope, Auth) {
  $scope.user = Auth.user;
  $scope.signedIn = Auth.signedIn;
  $scope.logout = Auth.logout;
});
