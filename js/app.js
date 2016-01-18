var markersArray = []; // Store all the markers
var map;
var infoWindow;
var redPin = 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'; // Red marker
var greenPin = 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'; // Green marker
var foursquareUrl;
var CLIENT_ID = 'SKBOEODGEQYE2XC45C10DPD11GFYH2AZXNXBSJCQMYHAJZBL'; // Client id for connecting Foursquare API
var CLIENT_SECRET = 'LFIXWJ0XVTJHZVER3CWVZWK2MJSICM342AEXV3NANQIEYWLD'; // Client secret for connecting Foursquare API
var foursquareLocation = '40.8,-74';
var foursquareQuery = 'coffee';
var foursquareQueryLimit = '5';
var foursquareUrl = 'https://api.foursquare.com/v2/venues/search?client_id=' + // Base url for connecting Foursquare API
												CLIENT_ID + '&client_secret=' + CLIENT_SECRET +
												'&v=20140806&ll=' + foursquareLocation +'&query=' + foursquareQuery + '&limit=' + foursquareQueryLimit;
var foursquareLocations = [];
var $nytHeaderElem = $('#nytimes-header');
var $nytElem = $('#nytimes-articles');
// https://api.foursquare.com/v2/venues/search?client_id=SKBOEODGEQYE2XC45C10DPD11GFYH2AZXNXBSJCQMYHAJZBL&client_secret=LFIXWJ0XVTJHZVER3CWVZWK2MJSICM342AEXV3NANQIEYWLD&v=20140806&ll=40.7,-74&query=coffee&limit=10

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

	//Create and open InfoWindow.	
	for (var i = 0; i < locationsModel.length; i++) {
		infoWindow = new google.maps.InfoWindow();
		var data = locationsModel[i];
		var myLatlng = new google.maps.LatLng(data.lat, data.lng);
		
		var marker = new google.maps.Marker({
			position: myLatlng,
			map: map,
			// title: data.title,
			animation: google.maps.Animation.DROP,
			icon: redPin
		});
		markersArray.push(marker);

		//Attach click event to the marker.
		(function (marker, data) {
			google.maps.event.addListener(marker, "click", function (e) {
				//Wrap the content inside an HTML DIV in order to set height and width of InfoWindow.
				infoWindow.setContent("<b>" + data.name + "</b><br>" + "<div style = 'width:200px;min-height:60px'>" + "<div id='description'></div>" + "</div>");
				getWikipediaApi(data.name);
				infoWindow.open(map, marker);
				// Animates the marker
				toggleBounce(marker);
			});
		})(marker, data);
	}
}

function getWikipediaApi(place) {
	var $windowContent = $('#description');
	var wikiUrl = 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' + place + '&format=json&callback=wikiCallback';
    var wikiRequestTimeout = setTimeout(function() {
                    $windowContent.text("failed to get wikipedia resources");
                }, 8000);
    $.ajax({
    	url: wikiUrl,
    	dataType: "jsonp",
        jsonp: "callback",
        success: function(response) {
        	var articleDescription = "Description from Wikipedia: " + response[2][0];
        	$windowContent.text('');
        	$windowContent.append(articleDescription);
        	clearTimeout(wikiRequestTimeout);
        }
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

	// self.points = ko.observableArray(locationsModel);

	// for(var k = 0; k < self.points().length; k++) {
	// 	self.points()[k].description = getApi(self.points()[k].name);
	// }

	// Click a place on the list, show marker and open infoWindow on the map
	self.setLoc = function(clickedLocation) {
		var markerReference;
		for(var k = 0; k < locationsModel.length; k++) {
			if(locationsModel[k].name == clickedLocation.name) {
				markerReference = markersArray[k];
				toggleBounce(markerReference);
				infoWindow.setContent("<b>" + locationsModel[k].name + "</b><br>" + "<div style = 'width:200px;min-height:60px'>" + locationsModel[k].description + "</div>");
				infoWindow.open(map, markerReference);
			}
		}
	};


  // function searchAll(inputContent) {
  //   self.locList.removeAll();
  //   for(var i=0; i<iniLocs.length; i++) {
  //     // Close all the infoWindows, just in case some infoWindow is still open
  //     infoWindows[i].close();
  //     markers[i].setVisible(false);
  //     // Show marched results in view list and marker
  //     if(iniLocs[i][self.selectedChoice()].toLowerCase().indexOf(inputContent.toLowerCase()) >= 0) {
  //         self.locList.push(new Loc(iniLocs[i]));
  //         markers[i].setVisible(true);
  //     }
  //   }
  // }

	// Search functionality on location names
	self.query = ko.observable('');

	self.search = ko.computed(function(){
		return ko.utils.arrayFilter(locationsModel, function(point){
			return point.name.toLowerCase().indexOf(self.query().toLowerCase()) >= 0;
    	});
  	});

	// New York Times articles
	self.getArticles = ko.computed(function() {

		$nytElem.text("");
		var nytimesUrl = 'http://api.nytimes.com/svc/search/v2/articlesearch.json?q=' + 'New York City' + '&sort=newest&api-key=7ea908fcd81e9b8656eef08e2c01ffd3:17:60789344';
	
		$.getJSON(nytimesUrl, function(data) {
			articles = data.response.docs;
			for (var i = 0; i < articles.length; i++) {
				var article = articles[i];
				$nytElem.append('<li class="article">'+'<a href="'+ article.web_url +'">'+ article.headline.main +'</a>'+'<p>'+ article.snippet +'</p>'+'</li>');
			}
		}).error(function(e) {
			$nytHeaderElem.text('New York Times Articles Could Not Be Loaded');
		});
	});
};

ko.applyBindings(new ViewModel());