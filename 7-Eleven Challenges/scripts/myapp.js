var map;
var infoWindow;
var request;
var service;
var markers = [];
		
function initialize() {
	// Defaulting to 7-Eleven - Cyprus Waters 
	var center = new google.maps.LatLng(32.925124,-96.9878986);
	
	var mapProp = {
		center: center,
		zoom: 12
	};
	
	// Search paramters - radius for 5 miles  
	request = {
		location : center,
		radius : 8000,
		type : ['convenience_store'],
		keyword: ['7-Eleven']
	};
	
	infoWindow = new google.maps.InfoWindow();
	
	map = new google.maps.Map(document.getElementById("map"), mapProp);
	
	service = new google.maps.places.PlacesService(map);
	service.nearbySearch(request, callback);
	
	// Add event to listen right click on the map
	google.maps.event.addListener(map, 'rightclick', function(event){
		map.setCenter(event.LatLng);
		clearResults(markers);
		request = {
			location : event.latLng,
			radius : 8000,
			type : ['convenience_store'],
			keyword: ['7-Eleven']
		};
		service.nearbySearch(request, callback);
	});

	// Use Places Autocomplete feature to search based on city, state, zip, etc.
	var card = document.getElementById('search-card');
	var input = document.getElementById('search-input');
	
	map.controls[google.maps.ControlPosition.TOP_RIGHT].push(card);
	
	var autocomplete = new google.maps.places.Autocomplete(input);
	
	autocomplete.bindTo('bounds', map);
	
	autocomplete.setFields(['address_components', 'geometry', 'icon', 'name']);
	
	var infowindow = new google.maps.InfoWindow();
	var infowindowContent = document.getElementById('infowindow-content');
	infowindow.setContent(infowindowContent);
	var marker = new google.maps.Marker({
		map: map,
		anchorPoint: new google.maps.Point(0, -29)
	});
	
	// Auto complete listener at location change
	autocomplete.addListener('place_changed', function() {
		infowindow.close();
		marker.setVisible(false);
		
		var place = autocomplete.getPlace();
		if (!place.geometry) {
			window.alert("No details available for input: '" + place.name + "'");
			return;
		}
	
		if (place.geometry.viewport) {
			map.fitBounds(place.geometry.viewport);
		} else {
			map.setCenter(place.geometry.location);
			map.setZoom(13);
		}
		marker.setPosition(place.geometry.location);
		marker.setVisible(true);
	
		infowindowContent.children['place-icon'].src = place.icon;
		infowindowContent.children['place-name'].textContent = place.name;
		infowindow.open(map, marker);
		
		clearResults(markers);
		request = {
			location : place.geometry.location,
			radius : 8000,
			type : ['convenience_store'],
			keyword: ['7-Eleven']
		};
		service.nearbySearch(request, callback);
	});
	
	// Filter 7-Eleven stores
	function callback(results, status) {
		if(status == google.maps.places.PlacesServiceStatus.OK) {
			
			sortByRating(results);
			
			for(var i = 0; i < results.length; i++) {
				results[i].order = i + 1;
				markers.push(createMarker(results[i]));
			}
			
		}
	}
	
	// Sort the places in the retrieved places based on the user sentiments (reviews)
	function sortByRating(results) {

		// JavaScript - array.sort(compareFunction)
		results.sort(function(a, b) {
			// a and b will here be two objects from the array thus a.rating and b.rating will be compared for sort

			// if they are equal, return 0 (no sorting)
			if (a.rating == b.rating) { return 0; }
			if (a.rating < b.rating) {
				// if a comes before b, return 1
				return 1;
			} else {
				// if b comes before a, return -1
				return -1;
			}
		});
	}
	
	// Create Marker content 
	function createMarker(place) {
		//alert('Name : ' + place.name + '\nAddress: ' + place.vicinity + '\nReviews : ' + place.review + '\nRating : ' + place.rating);
		var placeLoc = place.geometry.location;
		var marker = new google.maps.Marker({
			map : map,
			position : placeLoc
		});
		
		google.maps.event.addListener(marker, 'click', function(){
			infoWindow.setContent("<img src=" + place.icon + " width='16' height='16' id='place-icon'> <b>" + place.name + '</b><br>' + place.vicinity + "<br>Rating: " + place.rating + "<br>User Sentiments Order: <b>" + place.order + "<b>");
			infoWindow.open(map, this);
		});
		return marker;
	}
	
	// Clear results and markers
	function clearResults(markers) {
		for(var i = 0; i < markers.length; i++) {
			markers[i].setMap(null);
		}
		markers = [];
	}
}
