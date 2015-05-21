'use strict';

app.controller('ItemCtrl', function($scope) {
  $scope.disabled = true;
  $scope.toggle = function() {
    $scope.disabled = !$scope.disabled;
  };
});
