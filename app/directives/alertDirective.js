core.directive('alerts', function (AlertService, $timeout) {
	return {
		template: '<ul class="alertList list-unstyled"><li ng-repeat="alert in alerts" class="alertEntry"><span ng-include src="view"></span></li></ul>',
		restrict: 'E',
		replace: false,
		scope: {},
		link: function ($scope, element, attr) {
		
			var fixed = Object.keys(attr).indexOf('fixed') > -1;
			
			var duration = attr.seconds ? parseInt(attr.seconds) * 1000: coreConfig.duration;
			
			if(attr.types) {
				var types = attr.types.split(',');
				for(var i in types) {
					types[i] = types[i].trim();
				}
			}
			
			if(attr.channels) {
				var channels = attr.channels.split(',');
				for(var i in channels) {
					channels[i] = channels[i].trim();
				}
			}
			
			var facets = ["ERROR"];
			
			facets = facets.concat(types ? types : []);
			facets = facets.concat(channels ? channels : []);
			
			var timer = {};
			
			$scope.view = attr.view ? attr.view : "bower_components/core/app/views/alerts/defaultalert.html";
			
			
			$scope.alerts = { };
			

			var handle = function(alert) {
			
				$scope.alerts[alert.id] = alert;
				
				if(!fixed) {
					if(alert.type != "ERROR") {
						if(!timer[alert.id]) {
							timer[alert.id] = $timeout(function() {
								$scope.remove(alert);
							}, duration);
						}
					}
				}
			};
			

			for(var i in facets) {
				var alerts = AlertService.get(facets[i]);
				
				for(var i in alerts.list) {
					handle(alerts.list[i]);
				}

				alerts.defer.promise.then(function(alert){ 
						// resolved
					}, function(alert) { 
						// rejected
					}, function(alert) { 
						// notified
						handle(alert);
				});
			}
			
			$scope.remove = function(alert) {
				alert.fade = true;				
				$timeout(function() {
					delete $scope.alerts[alert.id];
					AlertService.remove(alert);
				}, 500);
				
			};
			
	    }
	};
});