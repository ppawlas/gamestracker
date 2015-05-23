'use strict';

app.factory('Cards', function (FIREBASE_URL, $firebaseArray) {
  var ref = new Firebase(FIREBASE_URL);
  var cards = $firebaseArray(ref.child('cards'));

  var Cards = {
    all: cards
  };


  return Cards;
});
