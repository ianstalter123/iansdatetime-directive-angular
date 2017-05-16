'use strict';

angular.module('myApp.view1', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view1', {
    templateUrl: 'view1/view1.html',
    controller: 'View1Ctrl'
  });
}])

.controller('View1Ctrl', function($scope, moment) {

  var date = moment()
    .toDate();
  var iteratorDate = moment(date)
    .startOf('month')
    .startOf('week');
  iteratorDate.add(5, 'day');
  var thisDate = moment(iteratorDate)
    .toDate();

  $scope.order = {
    requestedDateTime: thisDate,
    timeZone: "America/Los_Angeles",
    disabled: true
  };

  $scope.setData = function(data) {
    return data;
  };

  console.log('in the controller', $scope.order);
});
