var OSA = angular.module('OSA',[
	'ngRoute',
	'ui.bootstrap.transition',
	'ui.bootstrap.modal',
	'ui.bootstrap.timepicker',
	'ui.bootstrap.buttons',
	'OSA.home',
	'OSA.outlet',
	'OSA.offCanvas',
	'OSA.headerController'
]);

OSA.config(['$routeProvider',
  function($routeProvider) {
  	$routeProvider.when('/outlets', {
  		templateUrl: 'js/outlet/outlets.html',
  		controller: 'HomeController'
  	})
  	.otherwise({
  		templateUrl: 'template/home.html'
  	});
	}
]);

OSA.factory('socket', function ($rootScope) {
  var socket = io.connect();
  return {
    on: function (eventName, callback) {
      socket.on(eventName, function () {  
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    },
    emit: function (eventName, data, callback) {
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      })
    }
  };
});

angular.module('OSA.headerController', [])
.controller('headerController', ['$scope', '$element', function($scope, $element){
	$scope.toggleMenu = function(){
		angular.element(document.getElementById('off-canvas')).toggleClass('show');
	};
}]);

angular.module('OSA.home', [])
	.controller('HomeController', ['$scope', 'outletService', function($scope, outletService){
		var outlets = outletService.getOutlets();
		
	}]);

