'use strict';

app.controller('DeckbuilderCtrl', function($scope, Auth, Decks, cards) {
  $scope.user = Auth.user;
  $scope.signedIn = Auth.signedIn;

  $scope.cards = angular.copy(cards);

  $scope.deck = {
    cards: {}
  };
  $scope.playerClass = null;

  $scope.search = {};
  $scope.predicate = 'cost';
  $scope.deckLimit = 30;

  $scope.classFilter = function(card) {
    if ($scope.playerClass) {
      return !('playerClass' in card) || (card.playerClass === $scope.playerClass);
    } else {
      return true;
    }
  };

  $scope.clearSearch = function(key) {
    delete $scope.search[key];
  };

  $scope.reversedGlyph = function() {
    return $scope.reverse ? 'glyphicon-triangle-bottom' : 'glyphicon-triangle-top';
  };

  $scope.reset = function() {
    $scope.cards.filter(function(card) {
      return card.id in $scope.deck.cards;
    }).forEach(function(card) {
      delete card.count;
    });

    Object.keys($scope.deck.cards).forEach(function(id) {
      delete $scope.deck.cards[id];
    });
  };

  $scope.deckSize = function() {
    return Object.keys($scope.deck.cards).reduce(function(size, id) {
      return size + $scope.deck.cards[id];
    }, 0);
  };

  $scope.deckCost = function() {
    return $scope.cards.filter(function(card) {
      return card.id in $scope.deck.cards;
    }).reduce(function(cost, card) {
      return cost + $scope.cardCost(card) * card.count;
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
      $scope.deck.cards[card.id] = card.count;
    }
  };

  $scope.remove = function(card) {
    if (card.count > 0) {
      card.count--;
      $scope.deck.cards[card.id] = card.count;
    } else {
      delete $scope.deck.cards[card.id];
    }
  };

  $scope.chosen = function(card) {
    return card.count > 0;
  };

  $scope.cardCost = function(card) {
    switch ($scope.rarityClass(card))  {
      case 'Common':
        return 40;
      case 'Rare':
        return 100;
      case 'Epic':
        return 400;
      case 'Legendary':
        return 1600;
      default:
        return 0;
    }
  };

  $scope.rarityClass = function(card) {
    return card.set === 'Basic' ? 'Free' : card.rarity;
  };

  $scope.disabledCard = function(card) {
    return card.count === $scope.rarityLimit(card) ? 'disabled' : null;
  };

  $scope.createDeck = function() {
    $scope.deck.creator = $scope.user.profile.battleTag;
    $scope.deck.creatorUID = $scope.user.uid;
    Decks.create($scope.deck);
  };

});
