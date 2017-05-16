'use strict';


angular.module('myApp.date.date-directive', [])

/**
 *
 * @name date-directive
 * @methodOf myApp.date
 * @description
 * Main directive for displaying the 2 sub directives
 * @param {string} moment
 * @attributes {string} currentTimeZone -> sets the date based on the time zone
 * entered using moment-timezone
 */

.directive('dateTime', ['moment', function(moment) {
  return {

    link: function(scope, element, attributes) {
      // gets the current timezone from the directive attribute
      scope.currentTimeZone = attributes.sbTimeZone;
    },
    controller: ['$scope', '$timeout', function($scope, $timeout) {
      // formatted date object using moment
      var date = moment()
        .toDate();

      // gets the current time and formats to readable with am/pm
      $scope.todaysTime = moment(date)
        .format('h:mm:ss a');

      // gets the current date and format to readble
      $scope.todaysDate = moment(date)
        .format('MM-DD-YYYY');

      /* $scope.settings is the main value attached to the ng-model for the parent
       * directive.
       * values are shared down to the 2 sub directives dateinput and timeinput.
       * and sent back up to the parent directive using $scope.$emit from the sub.
       * and received using $on from the parent directive.
       */

      $scope.settings = {};

      // settings.disabled for enabling/disabling the time input
      $scope.settings.disabled;

      // settings.time for the time input value
      $scope.settings.time = null;

      // settings.date for the date value object
      $scope.settings.date = null;

      // enables the AM switch in the time picker default enabled
      $scope.AM = true;

      // enables the PM switch in the time picker default disabled
      $scope.PM = false;

      /**
       *
       * @name prepareDays
       * @method prepareDays
       * @description
       * Function for preparing the days into an array displayed in the calendar
       * And checking if the days are accurate
       * @params $scope, $timeout, moment
       */
      var prepareDays = function(date) {
        $scope.results = [];

        // gets first day of the week for processing
        var iteratorDate = moment(date)
          .startOf('month')
          .startOf('week');

        // creates weeks and days
        for (var week = 0; week < 4; week++) {
          var currentWeek = [];
          for (var day = 0; day < 7; day++) {

            var thisDate = moment(iteratorDate)
              .toDate();

            // if the day clicked matches the date sets active status
            if (moment(iteratorDate)
              .format('LL') === moment(date)
              .format('LL')) {
              thisDate.active = true;
            }
            // pushes days into week
            currentWeek.push(thisDate);
            iteratorDate.add(1, 'day');
          }
          // pushes weeks into the results array
          $scope.results.push(currentWeek);
        }
      };
      prepareDays(date);

      /**
       *
       * @name prepareTimes
       * @method prepareTimes
       * @description
       * Function for preparing the times into an array displayed in the calendar
       * @params $scope, $timeout
       */

      var prepareTimes = function() {
        var prefixAM = ' AM';
        var prefixPM = ' PM';
        // hours
        var left = ['12', '01', '02', '03', '04', '05',
          '06', '07', '08', '09', '10', '11'
        ];
        // minutes
        var right = ['00', '15', '30', '45'];
        // for AM times array
        $scope.timesAM = [];
        // for PM times array
        $scope.timesPM = [];
        for (var i = 0; i < left.length; i++) {

          // pushes arrays
          $scope.timesAM.push([]);
          $scope.timesPM.push([]);

          for (var j = 0; j < right.length; j++) {
            // creates time string and pushes
            $scope.timesAM[i].push(left[i].concat(':')
              .concat(right[j])
              .concat(prefixAM)
            );
            // creates time string and pushes
            $scope.timesPM[i].push(left[i].concat(':')
              .concat(right[j])
              .concat(prefixPM)
            );
          }
        }
      };

      prepareTimes();

      /**
       *
       * @name setDate
       * @method setDate
       * @description
       * Sets the date when a date is clicked on the calendar
       * Also uses checkInvalidTime to check if there are any conflicts
       * And removes the time if there is a conflict between day and working hours
       * (before 8AM or after 4PM on Sat/Sun)
       */

      $scope.setDate = function(newDate) {

        // newDate is the date coming in from the template
        // Function for checking if the day and times are during working hours
        var checkInvalidTime = function() {
          var day = moment(newDate)
            .format("ddd");
          var time = $scope.settings.time;

          var timeInfo = time.split(':');
          var h = timeInfo[0];
          var m = timeInfo[1].split(' ')[0];
          var a = timeInfo[1].split(' ')[1];

          // removes the time if the days and time are during working times
          if (day === 'Sat' || day === 'Sun') {
            if (a === 'AM' && Number(h) < 10) {
              $scope.settings.time = null;
            }
            if (a === 'PM' && Number(h) > 4 || Number(h) === 4 && Number(h) > 0) {
              $scope.settings.time = null;
            }
          }
        };

        // if there is a time, check the time first
        if ($scope.settings.time !== null) {
          checkInvalidTime();
        }

        //updates the date and set the time into the date
        if ($scope.settings.time !== null) {
          checkInvalidTime();
          var time = $scope.settings.time;

          var dt = moment(time, ["h:mm A"])
            .format("HH:mm");
          var timeInfo = dt.split(':');
          var h = timeInfo[0];
          var m = timeInfo[1];

          var updateDate = moment(newDate)
            .set({
              hour: parseInt(h, 10),
              minute: parseInt(m, 10)
            })
            .toDate();

          $timeout(function() {

            // gets the current time zone
            var timeZone = moment()
              .tz($scope.currentTimeZone)
              .format('z');

            $scope.settings.date = moment(updateDate)
              .format('MM-DD-YYYY, hh:mm a');
            // adds the time abbreviation to the current date
            $scope.settings.date =
              $scope.settings.date.concat(", " + timeZone);
          });
        } else {
          $scope.settings.date = newDate;
        }

        /**
         *
         * Used to set and remove active status on calendar days when clicked
         * could probably be optimized
         */

        for (var i = 0; i < $scope.results.length; i++) {
          for (var j = 0; j < $scope.results[i].length; j++) {
            if ($scope.results[i][j].active === true) {
              $scope.results[i][j].active = false;
            }
            if (moment($scope.results[i][j])
              .format('LL') === moment(newDate)
              .format('LL')) {
              $scope.results[i][j].active = true;
            }
          }
        }
      };

      /**
       *
       * @name
       * @method
       * @description
       * Sets time when clicking on a time in the time picker
       * Also goes through and updates the current date with the time selected
       */


      $scope.setTime = function(time) {
        $scope.settings.time = time;

        // splits up the time and uses the parts to update the date
        // with time.
        var dt = moment(time, ["h:mm A"])
          .format("HH:mm");
        var timeInfo = dt.split(':');
        var h = timeInfo[0];
        var m = timeInfo[1];

        var updateDate = moment($scope.settings.date)
          .set({
            hour: parseInt(h, 10),
            minute: parseInt(m, 10)
          })
          .toDate();

        $timeout(function() {
          //gets current time zone
          var timeZone = moment()
            .tz($scope.currentTimeZone)
            .format('z');

          //concats date and timezone abbreviation
          $scope.settings.date = moment(updateDate)
            .format('MM-DD-YYYY, hh:mm a');
          $scope.settings.date =
            $scope.settings.date.concat(", " + timeZone);
        });
      };

      /**
       *
       * @name nextMonth, prevMonth
       * @method
       * @description
       * updates the month in the calendar to the next month/ previous month.
       * @params $scope, $timeout
       */

      $scope.nextMonth = function() {
        var newDate = moment(date)
          .add(1, 'month');
        date = newDate;
        prepareDays(date);

        $scope.settings.date = moment(date)
          .format('MM-DD-YYYY');
      };

      $scope.prevMonth = function() {
        var newDate = moment(date)
          .subtract(1, 'month');
        date = newDate;
        prepareDays(date);

        $scope.settings.date = moment(date)
          .format('MM-DD-YYYY');
      };

      /**
       *
       * @name hasDate received
       * @method
       * @description
       * when there is a date in the parameters sets the date as default
       * @params $scope, $timeout
       */


      $scope.$on('hasDate', function(e, data) {
        console.log('in the hasDate', e, data);
        //process date and update

        $scope.setDate(data.requestedDateTime);

        $scope.setTime(moment(data.requestedDateTime)
          .format('hh:mm A'));

      });

      /**
       *
       * @name dateTable received
       * @method
       * @description
       * when the dateTable event is received it updates the parent model with the date.
       * and it also hides the date table if a date is selected.
       * @params $scope, $timeout
       */

      $scope.$on('dateTable', function(e, data) {
        var timer;
        if (data === false) {
          timer = 1000;
        } else {
          timer = 0;
        }

        $timeout(function() {
          $scope.showDateTable = data;
        }, timer);

        if (data === true) {
          $scope.showTimeTable = false;
        }

        if ($scope.settings.date === null) {
          $scope.settings.date = $scope.todaysDate;
        }

        // setting disabled to true causes the time input to be actived
        // after the set date event has been received
        $scope.settings.disabled = true;

        $timeout(function() {
          $scope.$apply();
        });

      });

      /**
       *
       * @name timeTable received
       * @method
       * @description
       * when the timeTable event is received it updates the parent model with the time.
       * and it also hides the time table if a time is selected.
       * @params $scope, $timeout
       */

      $scope.$on('timeTable', function(e, data) {
        var timer;
        if (data === false) {
          timer = 1000;
        } else {
          timer = 0;
        }

        $timeout(function() {
          $scope.showTimeTable = data;
        }, timer);

        if ($scope.settings.time === null) {
          $scope.settings.time = $scope.todaysTime;
        }
        // hides date table if the time is set
        if (data === true) {
          $scope.showDateTable = false;
        }
        $timeout(function() {
          $scope.$apply();
        });
      });
    }],

    templateUrl: '/components/date/date.html'
  };
}])

.directive('dateInput', ['$compile', '$rootScope',
  function($compile, $rootScope, sbBeforeRenderItem) {
    return {
      scope: {
        val: '=',
        sbBeforeRenderItem: '&'
      },
      controller: ['$scope', function($scope) {
        $scope.blurred = function() {
          $scope.showDateTable = false;
          $scope.$emit('dateTable', $scope.showDateTable);
        };
      }],
      link: function(scope, elem, attrs) {
        var data = scope.sbBeforeRenderItem();
        console.log('data', data);
        elem.bind('click', function() {

          // date table is shown
          // the show date table event is emitted setting the date

          scope.showDateTable = true;
          scope.$emit('dateTable', scope.showDateTable);

        });
      },
      templateUrl: '/components/date/dateInput.html'
    };
  }
])

.directive('timeInput', ['moment', function(moment) {
  return {
    scope: {
      val: '=',
      sbBeforeRenderItem: '&'
    },
    controller: ['$scope', function($scope) {
      $scope.blurred = function() {
        $scope.showTimeTable = false;
        $scope.$emit('timeTable', $scope.showTimeTable);
      };
    }],

    link: function(scope, elem, attrs) {
      var data = scope.sbBeforeRenderItem();

      if (!data.disabled) {
        scope.val.disabled = true;
        scope.$emit('timeTable', scope.showTimeTable);
      };

      // if there is a time/date in requested date time
      // update the model with hasDate and the set date
      // if its null just keep date and time as null

      if (data.requestedDateTime !== null) {
        scope.val.disabled = true;
        scope.$emit('hasDate', data);
      };
      // the time table is only shown if
      // the disabled attribute is set on the main model

      elem.bind('click', function() {
        if (scope.val.disabled === true) {
          scope.showTimeTable = true;
          scope.$emit('timeTable', scope.showTimeTable);
        }
      });
    },
    templateUrl: '/components/date/timeInput.html'
  };
}]);
