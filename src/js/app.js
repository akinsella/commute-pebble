/////////////////////////////////////////////////////////////////////////////////////////////////
// Imports
/////////////////////////////////////////////////////////////////////////////////////////////////

var UI = require('ui');
var ajax = require('ajax');


/////////////////////////////////////////////////////////////////////////////////////////////////
// Variables
/////////////////////////////////////////////////////////////////////////////////////////////////

var stopRoutes = [];
var stopRoutesOffset = -1;


/////////////////////////////////////////////////////////////////////////////////////////////////
// Cards
/////////////////////////////////////////////////////////////////////////////////////////////////

var loadingCard = new UI.Card({
	title: 'Commute',
	body: 'Waiting for data ...',
	scrollable: false
});

loadingCard.show();

var stopRouteCard = new UI.Card({
	title: '',
	body: '',
	scrollable: false
});

stopRouteCard.on('click', 'select', function(event) {
	console.log('Select clicked!');
});

stopRouteCard.on('click', 'up', function() {
	console.log('Up clicked!');

	if (stopRoutesOffset > 0) {
		stopRoutesOffset--;
		updateStopRouteCard();
	}
});

stopRouteCard.on('click', 'down', function() {
	console.log('Down clicked!');

	if (stopRoutesOffset + 1 < stopRoutes.length) {
		stopRoutesOffset++;
		updateStopRouteCard();
	}
});


/////////////////////////////////////////////////////////////////////////////////////////////////
// Functions
/////////////////////////////////////////////////////////////////////////////////////////////////

function updateStopRouteCard() {
	var stopRoute = stopRoutes[stopRoutesOffset];

	console.log("Updating stop route with : " + JSON.stringify(stopRoute));

	stopRouteCard.title(stopRoute.title);
	stopRouteCard.body(stopRoute.body);

	stopRouteCard.show();
}

var buildStopRoutes = function(stops) {

	var stopRoutes = [];

	for ( var i = 0 ; i < stops.length ; i++ ) {
		var stop = stops[i];
		stopRoutes = stopRoutes.concat(buildDataForStop(stop));
	}

	console.log("1 - stopRoute: " + JSON.stringify(stopRoutes));

	return stopRoutes;
};

var buildDataForStop = function(stop) {

	var stopRoutes = [];

	for ( var i = 0 ; i < stop.routes.length ; i++ ) {
		var route = stop.routes[i];
		stopRoutes.push(buildStopRoute(stop, route));
	}

	console.log("2- stopRoutes: " + JSON.stringify(stopRoutes));

	return stopRoutes;
};

var buildStopRoute = function(stop, route) {

	var stopRoute = {
		title: buildStopTitle(stop, route),
		body: buildStopTimesRepresentation(route, 3)
	};

	console.log("stopRoute: " + JSON.stringify(stopRoute));

	return stopRoute;
};

var buildStopTitle = function(stop, route) {
	var value = ('L. ' + route.name + ' - ' + stop.name);
	return value.length > 24 ? value.substring(0, 24) + '...' : value;
};

var buildStopTimesRepresentation = function(route, limit) {
	var stopTimesStr = '';

	for (var i = 0 ; i < route.stop_times.length && i < limit ; i++) {
		stopTimesStr += '  ' + route.stop_times[i] + '\n';
	}

	return stopTimesStr;
};


/////////////////////////////////////////////////////////////////////////////////////////////////
// Callbacks
/////////////////////////////////////////////////////////////////////////////////////////////////

function locationSuccess(pos) {

	console.log('lat= ' + pos.coords.latitude + ' lon= ' + pos.coords.longitude);

	var distance = 250;

	var url = 'http://commute.sh/api/agencies/RATP/stops/2015-06-20/nearest?lat=' + pos.coords.latitude + '&lon=' + pos.coords.longitude + '&distance=' + distance + '';

	console.log('Url: ' + url);

	ajax({url: url, type: 'json'}, function (stops) {

		console.log('Data: ' + JSON.stringify(stops));

		stopRoutes = buildStopRoutes(stops);
		stopRoutesOffset = 0;

		updateStopRouteCard();

		stopRouteCard.show();
	});
}


function locationError(err) {

	console.log('location error (' + err.code + '): ' + err.message);

	card.body('Could not get location');
	card.title('Error');

	card.show();

}


/////////////////////////////////////////////////////////////////////////////////////////////////
// Events
/////////////////////////////////////////////////////////////////////////////////////////////////


var locationOptions = {
	enableHighAccuracy: true,
	maximumAge: 10000,
	timeout: 10000
};

Pebble.addEventListener('ready',  function (e) {

	console.log("Enabling geoLocation to app");

	// Request current position
	navigator.geolocation.getCurrentPosition(locationSuccess, locationError, locationOptions);

});