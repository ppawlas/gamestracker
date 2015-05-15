'use strict';

app.factory('Auth', function (FIREBASE_URL, $firebaseObject, $firebaseAuth) {
  var ref = new Firebase(FIREBASE_URL);
  var auth = $firebaseAuth(ref);

  var Auth = {
    register: function (user) {
      return auth.$createUser({
        email: user.email,
        password: user.password
      });
    },
    createProfile: function(user) {
      var profile = {
        battleTag: user.battleTag
      };

      var profileRef = $firebaseObject(ref.child('profile'));
      profileRef[user.uid] = profile;
      return profileRef.$save();
    },
    login: function (user) {
      return auth.$authWithPassword({
        email: user.email,
        password: user.password
      });
    },
    logout: function() {
      auth.$unauth();
    },
    resolveUser: function() {
      return auth.$waitForAuth();
    },
    signedIn: function() {
      return !!Auth.user.provider;
    },
    user: {}
  };

  auth.$onAuth(function(authData) {
    if (authData) {
      angular.copy(authData, Auth.user);
      Auth.user.profile = $firebaseObject(ref.child('profile').child(Auth.user.uid));

      console.log(Auth.user);
    } else {
      console.log('logged out');

      if(Auth.user && Auth.user.profile) {
        Auth.user.profile.$destroy();
      }
      angular.copy({}, Auth.user);
    }
  });

  return Auth;
});
