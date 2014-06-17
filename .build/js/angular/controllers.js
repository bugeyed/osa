'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
  .controller('outletsController', ['$scope', 'socket', function($scope, socket) {
  	$scope.editOutlet = 0;
    socket.on("load:outlets", function(data){
      $scope.outlets = data.outlets;
    });
  	
    socket.on("outlet:update:response" , function(data){
      if (data.success) {
        $('#outlet-model').modal('hide')
      }
    });
    
    socket.on("response:outlet:on", function(data){
      $($('.outlets').find('.btn-group')[data.outlet]).children()
        .addClass('btn-success');
    });

    socket.on("response:outlet:off", function(data){
      $($('.outlets').find('.btn-group')[data.outlet]).children()
        .removeClass('btn-success');
    });
    
  	$scope.openModal = function(index, $event){
  		$scope.editOutlet = index;
      $('#timeOn').val($scope.outlets[index].time.on);
      $('#timeOff').val($scope.outlets[index].time.off);
  		$('#outlet-model').modal();
  	};

    $scope.toggleOutlet = function(index, $event){
      var $this = $($event.target);
      if ($this.hasClass('btn-success')) {
        socket.emit('toggle:outlet:off', {outlet: index});
      } else {
        socket.emit('toggle:outlet:on', {outlet: index});
      }
    };

    $scope.saveOutlet = function(){
      socket.emit('outlet:update', {
        outlet: $scope.editOutlet,
        time : {on: $('#timeOn').val(), off: $('#timeOff').val()}
      });
      $scope.outlets[$scope.editOutlet].time.on = $('#timeOn').val();
      $scope.outlets[$scope.editOutlet].time.off = $('#timeOff').val();
    };
  }]);