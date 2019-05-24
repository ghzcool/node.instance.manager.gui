const rest = new function () {
	var _rest = this;

	var getOnErrorHandler = function (callback) {
		return function (response) {
			if(!!response.responseJSON && response.responseJSON.status === 401) {
				api.showLogin();
			}
			!!callback && callback(response.responseJSON);
		};
	};

	var getHeaders = function(config) {
		return $.extend({
			"Authorization": "Token " + sessionStorage.getItem("token")
		}, config || {});
	};

	var backendUrl = window.backendHost + ':' + window.backendPort;

	_rest.getSelf = function (success, failure) {
		$.ajax({
			type: 'GET',
			url: backendUrl + '/me',
			data: null,
			dataType: 'json',
			success: success,
			error: getOnErrorHandler(failure),
			headers: getHeaders()
		});
	};

	_rest.login = function (login, password, success, failure) {
		$.ajax({
			type: 'POST',
			url: backendUrl + '/login',
			data: {
				login: login,
				password: password
			},
			dataType: 'json',
			success: success,
			error: getOnErrorHandler(failure),
			headers: getHeaders()
		});
	};

	_rest.renew = function (success, failure) {
		$.ajax({
			type: 'GET',
			url: backendUrl + '/token/renew',
			data: null,
			dataType: 'json',
			success: success,
			error: getOnErrorHandler(failure),
			headers: getHeaders()
		});
	};

	_rest.logout = function (success, failure) {
		$.ajax({
			type: 'GET',
			url: backendUrl + '/logout',
			data: null,
			dataType: 'json',
			success: success,
			error: getOnErrorHandler(failure),
			headers: getHeaders()
		});
	};

	_rest.getNodes = function (success, failure) {
		$.ajax({
			type: 'GET',
			url: backendUrl + '/nodes',
			data: null,
			dataType: 'json',
			success: success,
			error: getOnErrorHandler(failure),
			headers: getHeaders()
		});
	};

	_rest.getNode = function (id, success, failure) {
		$.ajax({
			type: 'GET',
			url: backendUrl + '/node',
			data: {id: id},
			dataType: 'json',
			success: success,
			error: getOnErrorHandler(failure),
			headers: getHeaders()
		});
	};

	_rest.getNodeTypes = function (success, failure) {
		$.ajax({
			type: 'GET',
			url: backendUrl + '/node/types',
			data: null,
			dataType: 'json',
			success: success,
			error: getOnErrorHandler(failure),
			headers: getHeaders()
		});
	};

	_rest.getSystemInfo = function (success, failure) {
		$.ajax({
			type: 'GET',
			url: backendUrl + '/system',
			data: null,
			dataType: 'json',
			success: success,
			error: getOnErrorHandler(failure),
			headers: getHeaders()
		});
	};

	_rest.createNode = function (data, success, failure) {
		$.ajax({
			type: 'POST',
			url: backendUrl + '/node',
			data: JSON.stringify(data),
			contentType: "application/json; charset=utf-8",
			dataType: 'json',
			success: success,
			error: getOnErrorHandler(failure),
			headers: getHeaders()
		});
	};

	_rest.updateNode = function (data, success, failure) {
		$.ajax({
			type: 'PUT',
			url: backendUrl + '/node',
			data: JSON.stringify(data),
			contentType: "application/json; charset=utf-8",
			dataType: 'json',
			success: success,
			error: getOnErrorHandler(failure),
			headers: getHeaders()
		});
	};

	_rest.deleteNode = function (id, success, failure) {
		$.ajax({
			type: 'DELETE',
			url: backendUrl + '/node',
			data: {id: id},
			dataType: 'json',
			success: success,
			error: getOnErrorHandler(failure),
			headers: getHeaders()
		});
	};

	_rest.startNode = function (id, success, failure) {
		$.ajax({
			type: 'PUT',
			url: backendUrl + '/node/start',
			data: {id: id},
			dataType: 'json',
			success: success,
			error: getOnErrorHandler(failure),
			headers: getHeaders()
		});
	};

	_rest.stopNode = function (id, success, failure) {
		$.ajax({
			type: 'PUT',
			url: backendUrl + '/node/stop',
			data: {id: id},
			dataType: 'json',
			success: success,
			error: getOnErrorHandler(failure),
			headers: getHeaders()
		});
	};
}();