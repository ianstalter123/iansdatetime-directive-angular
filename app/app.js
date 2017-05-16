// Declare app level module which depends on views, and components
angular.module('myApp', [
    'ngRoute',
    'angularMoment',
    'myApp.view1',
    'myApp.view2',
    'myApp.version',
    'myApp.date',
  ])
  .
config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
  $locationProvider.hashPrefix('!');

  $routeProvider.otherwise({
    redirectTo: '/view1'
  });
}]);
