angular.module('OSA.outlet', [])
	.controller('OutletController', ['$scope', '$modal', 'outletService', function($scope, $modal, outletService){
		var outletServiceTest = outletService;
		$scope.outlets = outletService.getOutlets();
		
		$scope.$on('outletService:outlets:loaded', function(){
			$scope.outlets = outletService.getOutlets();
		});
		
		$scope.open = function(index, outlet){
			var modalInstance = $modal.open({
				keyboard: false,
				backdrop: 'static',
				scope: $scope,
				controller: 'OutletEditController',
				resolve: {
					index: index,
					outlet: outlet
				},
				templateUrl: 'js/outlet/outlet-edit.html'
			})
		};

		$scope.toggleState = function(index, $event){
			if(angular.element($event.target).parent().hasClass('btn-danger')
				|| angular.element($event.target).hasClass('btn-danger')) {
				console.log('danger')
				outletServiceTest.turnOnOutlet(index);
			} else {
				console.log('danger 1')
				outletServiceTest.turnOffOutlet(index);
			}
		};
	}])
	.directive('outlet', function(){
		return {
			restrict: 'EA',
			controller: 'OutletController',
			scope: {
				outlet: '=info',
				index: '='
			},
			templateUrl: 'js/outlet/outlet.html'
		};
	})
	.controller('OutletEditController', ['$scope', '$filter', '$modalInstance', function($scope, $filter, $modalInstance){
		$scope.save = function () {
			var outlet = $scope.outlet;
			outlet.time.on.time = $filter('date')(outlet.time.on.string,'HH:mm');
			outlet.time.off.time = $filter('date')(outlet.time.off.string,'HH:mm');
			$modalInstance.close();
		};
		$scope.$watch('outlet.time.on.string', function(time){
			//console.log($filter('date')(time,'HH:mm'))
		});
		$scope.$watch('outlet.time.off.string', function(time){
			//console.log($filter('date')(time,'HH:mm'))
		});
	}])
	.directive('outletEdit', function(){
		return {
			restrict: 'EA',
			controller: 'OutletEditController',
			templateUrl: 'js/outlet/outlet-edit.html',
			
			link: function(scope, element){
				
			}
		}
	})
	.service('outletService', function(socket, $rootScope){
		var outletList = [];
		socket.on("load:outlets", function(data){
      outletList = data.outlets;
      $rootScope.$broadcast('outletService:outlets:loaded');
    });

		socket.on("response:outlet:on", function(data){
			if(!outletList[data.outlet].on){
				outletList[data.outlet].on = true;
			}
    });

    socket.on("response:outlet:off", function(data){
			if(outletList[data.outlet].on){
				outletList[data.outlet].on = false;
			}
    });

		var getOutlets = function(){
			return outletList;
		};

		var turnOnOutlet = function(index){
			console.log('hello on', index)
			socket.emit('toggle:outlet:on', {outlet: index});
		};

		var turnOffOutlet = function(index){
			socket.emit('toggle:outlet:off', {outlet: index});
		};

		return {
			getOutlets: getOutlets,
			turnOffOutlet: turnOffOutlet,
			turnOnOutlet: turnOnOutlet
		}
	});

	//name: 'outlet 1', on: false, time: {on: {string: '', time: ''}}, off: {string: '', time: ''}
		