/* global app:true */
/* exported app */

'use strict';

/**
 * @ngdoc overview
 * @name gamestrackerApp
 * @description
 * # gamestrackerApp
 *
 * Main module of the application.
 */
var app = angular
  .module('gamestrackerApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngTouch',
    'ui.router',
    'ui.bootstrap',
    'firebase',
    'angularUtils.directives.dirPagination',
    'ui.utils'
  ])
  .constant('FIREBASE_URL', 'https://gamestracker-dev.firebaseio.com/')
  .config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/');

    $stateProvider

      .state('register', {
        url: '/register',
        templateUrl: 'views/register.html',
        controller: 'AuthCtrl',
        resolve: {
          user: function(Auth) {
            return Auth.resolveUser();
          }
        }
      })

      .state('login', {
        url: '/login',
        templateUrl: 'views/login.html',
        controller: 'AuthCtrl',
        resolve: {
          user: function(Auth) {
            return Auth.resolveUser();
          }
        }
      })

      .state('competition', {
        url: '/competitions/:competitionId',
        templateUrl: 'views/competitionview.html',
        controller: 'CompetitionViewCtrl'
      })

      .state('/', {
        url: '/',
        templateUrl: 'views/competitions.html',
        controller: 'CompetitionCtrl'
      })

      .state('/.create', {
          url: 'create',
          templateUrl: 'views/newcompetition.html'
      })

      .state('cards', {
        url: '/cards',
        templateUrl: 'views/cards.html',
        controller: 'CardsCtrl'
      })

      ;

  });
