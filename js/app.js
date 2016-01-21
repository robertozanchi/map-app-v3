var infoWindow;
var infoWindows = [];
var windowContent;
var map;
var marker;
var markers = [];
var redPin = 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';
var greenPin = 'http://maps.google.com/mapfiles/ms/icons/green-dot.png';
var $nytHeaderElem = $('#nytimes-header');
// var $nytElem = $('#nytimes-articles');

// Model: hard coded location data
var locationsModel = [
	{
	"name": 'Central Park',
	"lat": '40.769297',
	"lng": '-73.977650',
	"description": 'Seasonal outdoor venue presenting a range of free & ticketed performances in multiple music genres.'
	},
	{
	"name": 'Lincoln Center for the Performing Arts',
	"lat": '40.772874',
	"lng": '-73.983479',
	"description": 'Multi-venue complex home to many prominent groups like Metropolitan Opera & New York City Ballet.'
	},
	{
	"name": 'Grand Central Terminal',
	"lat": '40.7528',
	"lng": '-73.9765',
	"description": 'Railroad terminal at 42nd Street and Park Avenue in Midtown Manhattan.'
	},
	{
	"name": "Hell's Kitchen",
	"lat": '40.763795',
	"lng": '-73.992264',
	"description": "Hell's Kitchen is a neighborhood of Manhattan in New York City, between 34th Street in the south, 59th Street in the north, Eighth Avenue in the east, and the Hudson River to the west."
	},
		{
	"name": 'Times Square',
	"lat": '40.759106',
	"lng": '-73.985163',
	"description": 'Bustling destination in the heart of the Theater District known for bright lights, shopping & shows.'
	}
];

function loadMap() {
	var mapOptions = {
		center: new google.maps.LatLng(40.767513, -73.985109),
		zoom: 14,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};

	map = new google.maps.Map(document.getElementById("map"), mapOptions);

	// Creates a new marker for each location
	for (var i = 0; i < locationsModel.length; i++) {
		addMarker(i, locationsModel[i]);
	}

	ko.applyBindings(new ViewModel());
}

function addMarker(i, location) {
	marker = new google.maps.Marker({
		position: new google.maps.LatLng(location.lat, location.lng),
        map: map,
        icon: redPin,
        animation: google.maps.Animation.DROP
    });

	// Binds marker to location
	location.marker = marker;

    markers.push(marker);

    infoWindow = new google.maps.InfoWindow();

    infoWindows.push(infoWindow);

	(function (marker, location) {
		google.maps.event.addListener(marker, "click", function (e) {
		//Wrap the content inside an HTML DIV in order to set height and width of InfoWindow.
		infoWindow.setContent("<b>" + location.name + "</b><br>" + "<div style = 'width:200px;min-height:60px'>" + "<div id='description'></div>" + "</div>");
		getWikipediaApi(locationsModel[i].name);
		infoWindow.open(map, marker);
		// Animates the marker
		toggleBounce(marker);
		});
	})(marker, locationsModel[i]);
}

function getWikipediaApi(location) {
	var $windowContent = $('#description');
	var wikiUrl = 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' + location + '&format=json&callback=wikiCallback';
    var wikiRequestTimeout = setTimeout(function() {
                    $windowContent.text("failed to get wikipedia resources");
                }, 8000);
	$.ajax({
	  url: wikiUrl,
	  dataType: "jsonp",
	  jsonp: "callback"
	}).done(function(response) {
		var articleDescription =  response[2][0] + "<i>Source: Wikipedia</i>" ;
		$windowContent.text('');
		$windowContent.append(articleDescription);
		clearTimeout(wikiRequestTimeout);
	});
}

// Animates a marker once it is clicked
function toggleBounce(marker) {
	if (marker.getAnimation() !== null) {
		marker.setAnimation(null);
	} else {
		marker.setAnimation(google.maps.Animation.BOUNCE);
		marker.setIcon(greenPin);
		setTimeout(stopBounce, 1400);
		function stopBounce(){
		marker.setAnimation(null);
		marker.setIcon(redPin);
		}
	}
}

// ViewModel
var ViewModel = function() {
	var self = this;

	// Click a place on the list, show marker and open infoWindow on the map
	self.setLoc = function(clickedLocation) {
		var markerReference;
		for(var k = 0; k < locationsModel.length; k++) {
			if(locationsModel[k].name == clickedLocation.name) {
				markerReference = markers[k];
				toggleBounce(markerReference);
				infoWindow.setContent("<b>" + locationsModel[k].name + "</b><br>" + "<div style = 'width:200px;min-height:60px'>" + "<div id='description'></div>" + "</div>");
				getWikipediaApi(locationsModel[k].name);
				infoWindow.open(map, markerReference);
			}
		}
	};

	// Search functionality on location names
	self.query = ko.observable('');

	//
	self.search = ko.computed(function(){

	return ko.utils.arrayFilter(locationsModel, function(point){
		if (point.name.toLowerCase().indexOf(self.query().toLowerCase()) >= 0){
		point.marker.setVisible(true);  // Shows markers if name matches query
		return true;
	}
	point.marker.setVisible(false);
    return false;
	});
});

	// New York Times articles
	self.NYTarticles = ko.observableArray();

	self.getArticles = ko.computed(function() {
		var nytimesUrl = 'http://api.nytimes.com/svc/search/v2/articlesearch.json?q=' + 'New York City' + '&sort=newest&api-key=7ea908fcd81e9b8656eef08e2c01ffd3:17:60789344';

		$.getJSON(nytimesUrl)
		.done(function(data) {
			articles = data.response.docs;
			for (var i = 0; i < articles.length; i++) {
				var article = articles[i];
				self.NYTarticles.push({url: article.web_url, headline: article.headline.main, snippet: article.snippet});
			}
		})
		.fail(function(e) {
			$nytHeaderElem.text('New York Times Articles Could Not Be Loaded');
		});
	});
};