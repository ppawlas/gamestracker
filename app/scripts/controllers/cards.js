'use strict';

app.controller('CardsCtrl', function($scope, Cards, Auth) {
  $scope.user = Auth.user;
  $scope.signedIn = Auth.signedIn;

  $scope.cards = Cards.all;
  $scope.deck = {};

  $scope.search = {};
  $scope.predicate = 'cost';
  $scope.deckLimit = 30;

  $scope.clearSearch = function(key) {
    delete $scope.search[key];
  };

  $scope.reversedGlyph = function() {
    return $scope.reverse ? 'glyphicon-triangle-bottom' : 'glyphicon-triangle-top';
  };

  $scope.reset = function() {
    $scope.cards.filter(function(card) {
      return card.id in $scope.deck;
    }).forEach(function(card) {
      delete card.count;
    });

    Object.keys($scope.deck).forEach(function(id) {
      delete $scope.deck[id];
    });
  };

  $scope.deckSize = function() {
    return Object.keys($scope.deck).reduce(function(size, id) {
      return size + $scope.deck[id];
    }, 0);
  };

  $scope.rarityLimit = function(card) {
    return card.rarity === 'Legendary' ? 1 : 2;
  };

  $scope.add = function(card) {
    if (card.count === undefined) {
      card.count = 0;
    }
    if (card.count < $scope.rarityLimit(card) && $scope.deckSize() < $scope.deckLimit) {

      card.count++;
      $scope.deck[card.id] = card.count;
    }
  };

  $scope.remove = function(card) {
    if (card.count > 0) {
      card.count--;
      $scope.deck[card.id] = card.count;
    } else {
      delete $scope.deck[card.id];
    }
  };

  $scope.chosen = function(card) {
    return card.count > 0;
  };

  $scope.rarityClass = function(card) {
    return card.set === 'Basic' ? 'Free' : card.rarity;
  };

  $scope.disabledCard = function(card) {
    return card.count === $scope.rarityLimit(card) ? 'disabled' : null;
  };

});
