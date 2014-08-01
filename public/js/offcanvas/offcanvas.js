angular.module('OSA.offCanvas', [])
	.directive('offCanvas', function(){
		return {
			restrict: 'EA',
			replace: true,
			transclude: true,
			templateUrl: 'js/offcanvas/offcanvas.html',
			link: function(scope, element){
				element.bind('click', function(event) {
					element.toggleClass('show');
				});
			}
		}
	})
	.factory('offCanvasService', function(){
		var offCanvas;


		return offCanvas;
	});