angular.module('OSA.pump', [])
	.controller('PumpController', ['$scope', '$modal', 'pumpService', function($scope, $modal, pumpService){
		var pumpServiceTest = pumpService;
		$scope.pumps = pumpService.getPumps();
		
		/*$scope.$on('pumpService:pumps:loaded', function(){
			$scope.pumps = pumpService.getPumps();
		});*/
		
		$scope.open = function(index, pump){
			var modalInstance = $modal.open({
				keyboard: false,
				backdrop: 'static',
				scope: $scope,
				controller: 'PumpEditController',
				resolve: {
					index: index,
					pump: pump
				},
				templateUrl: 'js/pump/pump-edit.html'
			})
		};

		$scope.toggleState = function(index, $event){
			if(angular.element($event.target).parent().hasClass('btn-danger')
				|| angular.element($event.target).hasClass('btn-danger')) {
				pumpServiceTest.turnOnPump(index);
			} else {
				pumpServiceTest.turnOffPump(index);
			}
		};
	}])
	.directive('pump', function(){
		return {
			restrict: 'EA',
			controller: 'PumpController',
			scope: {
				pump: '=info',
				index: '='
			},
			templateUrl: 'js/pump/pump.html'
		};
	})
	.controller('PumpEditController', ['$scope', '$filter', '$modalInstance', 'pumpService', function($scope, $filter, $modalInstance, pumpService){
		$scope.save = function (index) {
			var pump = $scope.pump;
			pump.time.on.time = $filter('date')(pump.time.on.string,'HH:mm');
			$modalInstance.close();
			pumpService.savePump(index);
		};
		$scope.$watch('pump.time.on.string', function(time){
			//console.log($filter('date')(time,'HH:mm'))
		});
		$scope.$watch('pump.time.off.string', function(time){
			//console.log($filter('date')(time,'HH:mm'))
		});
	}])
	.directive('pumpEdit', function(){
		return {
			restrict: 'EA',
			controller: 'PumpEditController',
			templateUrl: 'js/pump/pump-edit.html',
			
			link: function(scope, element){
				
			}
		}
	})
	.service('pumpService', function(socket, $rootScope){
		var pumpList = [];
		socket.on("load:pumps", function(data){
      pumpList = data.pumps;
      $rootScope.$broadcast('pumpService:pumps:loaded');
    });

		socket.on("response:pump:on", function(data){
			if(!pumpList[data.pump].on){
				pumpList[data.pump].on = true;
			}
    });

    socket.on("response:pump:off", function(data){
			if(pumpList[data.pump].on){
				pumpList[data.pump].on = false;
			}
    });

		var getPumps = function(){
			return pumpList;
		};

		var turnOnPump = function(index){
			socket.emit('toggle:pump:on', {pump: index});
		};

		var turnOffPump = function(index){
			socket.emit('toggle:pump:off', {pump: index});
		};

		var savePump = function(index){
			var pump = pumpList[index];
			var data = {
				pump: pump.number,
				index: index,
				label: pump.label,
				time: {
					on: {
						string: pump.time.on.string,
						time: pump.time.on.time
					}
				},
				amount: pump.amount
			}
			socket.emit('pump:update', data);
		};

		return {
			getPumps: getPumps,
			turnOffPump: turnOffPump,
			turnOnPump: turnOnPump,
			savePump: savePump
		}
	});

	//name: 'pump 1', on: false, time: {on: {string: '', time: ''}}, off: {string: '', time: ''}
		