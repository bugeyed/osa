'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
  .controller('outletsController', ['$scope', 'socket', function($scope, socket) {
  	$scope.editOutlet = 0;
    socket.on("load:outlets", function(data){
      $scope.outlets = data.outlets;
      $scope.editOutlet = 0;
    });
  	
    socket.on("outlet:update:response" , function(data){
      console.log(data)
      if (data.success) {
        $('#outlet-model').modal('hide')
      }
    });

  	$scope.openModal = function(index, $event){
  		$scope.editOutlet = index;
  		$('#outlet-model').modal();
  	};

    $scope.toggleOutlet = function(index, $event){
      var $this = $($event.target);
      if ($this.hasClass('btn-success')) {
        socket.emit('toggle:outlet:off', {outlet: index});
      } else {
        socket.emit('toggle:outlet:on', {outlet: index});
      }
      $this.toggleClass('btn-success');
      $this.next().toggleClass('btn-success');
    };

    $scope.saveOutlet = function(){
      socket.emit('outlet:update', {
        outlet: $scope.editOutlet,
        time : {on: $('#timeOn').val(), off: $('#timeOff').val()}
      });
    };
  }]);