/**
 * @ngdoc service
 * @name  core.service:RestApi
 * @requires ng.$http
 * @requires ng.$window
 * @requires core.service:AuthServiceApi
 *
 * @description
 * 	The RestApi Service facilitates all restful communication
 * 	with a Spring implementation of the TAMU Webservice Core. 
 * 	This is service is the http counterpart to the websocket 
 * 	functionality of WsApi.
 * 
 */
core.service("RestApi",function($http, $window, AuthServiceApi) {

	/**
	 * @ngdoc property
	 * @name core.service:RestApi#webservice
	 * @propertyOf core.service:RestApi
	 *
	 * @description
	 * 	A private reference to the application's configuration
	 * 	for webService.
	 * 	
	 */
	var webservice = appConfig.webService;

	/**
	 * @ngdoc property
	 * @name core.service:RestApi#authService
	 * @propertyOf core.service:RestApi
	 *
	 * @description
	 * 	A private reference to the application's configuration
	 * 	for authService.
	 * 	
	 */
	var authservice = appConfig.authService;

	/**
	 * @ngdoc method
	 * @name core.service:RestApi#anonymousGet
	 * @methodOf core.service:RestApi
	 * 
	 * @param {object} req 
	 * 	a request object
	 * @returns {Promise} returns a promise
	 * 
	 * @description
	 *	Initiates a get request on behalf of a user whose role is 'ROLE_ANONYMOUS'.
	 */
	this.anonymousGet = function(req) {

		var url = appConfig.webService + "/" + req.controller + "/" + req.method;

		return $http({
				method: 'GET',
    			url: url,
   				headers: {
   					'data': (typeof req.data != 'undefined') ? JSON.stringify(req.data) : '{}'
   				}
   			}).then(
			//success callback	
			function(response) {
				return response.data;
			},
			//error callback
			function(response) {
				return response.data;
			});
	};

	/**
	 * @ngdoc method
	 * @name core.service:RestApi#get
	 * @methodOf core.service:RestApi
	 * @param {object} req a request object
	 * @param {boolean=} isUrl a boolean
	 * @returns {Promise} returns a promise
	 * 
	 * @description
	 *	Initiates a get request to the configured web service on behalf of an authenticated user.
	 */
	this.get = function(req, isUrl) {

		var url = isUrl ? req : appConfig.webService + "/" + req.controller + "/" + req.method;

		return $http({
				method: 'GET',
    			url: url,
   				headers: {
   					'jwt': sessionStorage.token, 
   					'data': (typeof req.data != 'undefined') ? JSON.stringify(req.data) : '{}'
   				}
   			}).then(
			//success callback	
			function(response) {
				return response.data;
			},
			//error callback
			function(response) {
				if(response.data.message == "EXPIRED_JWT") {
					
					if(sessionStorage.assumedUser) {
					
						return AuthServiceApi.getAssumedUser(JSON.parse(sessionStorage.assumedUser)).then(function() {
							return $http.get(uri, {headers:{'jwt':sessionStorage.token}}).then(function(response) {
								return response.data;	
							});
						});
						
					} else {
						
						return AuthServiceApi.getRefreshToken().then(function() {
							return $http.get(uri, {headers:{'jwt':sessionStorage.token}}).then(function(response) {
								return response.data;	
							});
						});
						
					}

				} else {
					$window.location.replace(authservice + "/token?referer=" + window.location);
				}
			});
	};

	/**
	 * @ngdoc method
	 * @name core.service:RestApi#post
	 * @methodOf core.service:RestApi
	 * @param {object} req a request object
	 * @returns {Promise} returns a promise
	 * 
	 * @description
	 *	Initiates a post request to the configured web service on behalf of an authenticated user.
	 */
	this.post = function(req) {

		var url = appConfig.webService + "/" + req.controller + "/" + req.method;

		return $http({
				method: 'POST',
    			url: url,
   				data: req.file,
   				headers: {
   					'jwt': sessionStorage.token, 
   					'data': (typeof req.data != 'undefined') ? JSON.stringify(req.data) : '{}'
   				}
   			}).then(

			//success callback	
			function(response) {
				return response.data;
			},

			//error callback
			function(response) {
				console.log(response);
				if(response.data.message == "EXPIRED_JWT") {
					
					if(sessionStorage.assumedUser) {
					
						return AuthServiceApi.getAssumedUser(JSON.parse(sessionStorage.assumedUser)).then(function() {
							return $http({
										method: 'POST',
						    			url: url,
						   				data: req.file,
						   				headers: {
						   					'jwt': sessionStorage.token, 
						   					'data': (typeof req.data != 'undefined') ? JSON.stringify(req.data) : '{}'
						   				}
						   			}).then(function(response) {
								return response.data;	
							});
						});
						
					} else {
						
						return AuthServiceApi.getRefreshToken().then(function() {
							return $http({
										method: 'POST',
						    			url: url,
						   				data: req.file,
						   				headers: {
						   					'jwt': sessionStorage.token, 
						   					'data': (typeof req.data != 'undefined') ? JSON.stringify(req.data) : '{}'
						   				}
						   			}).then(function(response) {
								return response.data;	
							});
						});
						
					}

				} else {
					$window.location.replace(authservice + "/token?referer=" + window.location);
				}
			});
	};

});