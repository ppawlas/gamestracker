'use strict';

app.factory('Decks', function (FIREBASE_URL, $firebaseObject, $firebaseArray) {
  var ref = new Firebase(FIREBASE_URL);
  var decks = $firebaseArray(ref.child('decks'));

  var Decks = {
    all: decks,
    create: function (deck) {

      return decks.$add(deck).then(function(deckRef) {

        var userDeck = $firebaseObject(
          ref.child('user_decks')
          .child(deck.creatorUID)
          .child(deckRef.key())
        );
        userDeck.$value = true;
        userDeck.$save();

        return deckRef;
      });

    },
    get: function (deckId) {
      return $firebaseObject(ref.child('decks').child(deckId));
    }
  };

  return Decks;
});
