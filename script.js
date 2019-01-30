'use strict';
//locations for the markers
var locations = [{
	title: 'Target',
	location: {
		lat: 38.4261,
		lng:  -121.41515
	}
}, {
	title: 'Peets ',
	location: {
		lat: 38.40937,
		lng: -121.35236
	}
}, {
	title: 'Mcdonalds',
	location: {
		lat: 38.42215,
		lng: -121.40075
	}
}, {
	title: 'Its a grind',
	location: {
		lat: 38.40937,
		lng: -121.352364
	}
}, {
	title: 'Subway',
	location: {
		lat: 38.40939,
		lng: -121.38372
	}
}, ];

// possible googleError
var googleError = function() {
	  alert("Google map unavilable")
};

var map;
var marker;
var wikicontent;
var wikiData;
var url;

var menu = document.querySelector('#menu');
var drawer = document.querySelector('.nav');

menu.addEventListener('click', function(e) {
		drawer.classList.toggle('open');
		e.stopPropagation();
});

// initialize map
function initMap() {
		map = new google.maps.Map(document.getElementById('map'), {
				center: {
						// lat: 40.7413549,
						// lng: -73.9980244
						lat: 38.41,
						lng:  -121.37
				},
				zoom: 12,
//            stylized dark color theme for the map 
            styles: [
            {elementType: 'geometry', stylers: [{color: '#242f3e'}]},
            {elementType: 'labels.text.stroke', stylers: [{color: '#242f3e'}]},
            {elementType: 'labels.text.fill', stylers: [{color: '#746855'}]},
            {
              featureType: 'administrative.locality',
              elementType: 'labels.text.fill',
              stylers: [{color: '#d59563'}]
            },
            {
              featureType: 'poi',
              elementType: 'labels.text.fill',
              stylers: [{color: '#d59563'}]
            },
            {
              featureType: 'poi.park',
              elementType: 'geometry',
              stylers: [{color: '#263c3f'}]
            },
            {
              featureType: 'poi.park',
              elementType: 'labels.text.fill',
              stylers: [{color: '#6b9a76'}]
            },
                {
              featureType: 'road',
              elementType: 'geometry.stroke',
              stylers: [{color: '#212a37'}]
            },
            {
              featureType: 'road',
              elementType: 'labels.text.fill',
              stylers: [{color: '#9ca5b3'}]
            },
            {
              featureType: 'road.highway',
              elementType: 'geometry',
              stylers: [{color: '#746855'}]
            },
            {
              featureType: 'road.highway',
              elementType: 'geometry.stroke',
              stylers: [{color: '#1f2835'}]
            },
            {
              featureType: 'road.highway',
              elementType: 'labels.text.fill',
              stylers: [{color: '#f3d19c'}]
            },
                {
              featureType: 'transit',
              elementType: 'geometry',
              stylers: [{color: '#2f3948'}]
            },
            {
              featureType: 'transit.station',
              elementType: 'labels.text.fill',
              stylers: [{color: '#d59563'}]
            },
            {
              featureType: 'water',
              elementType: 'geometry',
              stylers: [{color: '#17263c'}]
            },
            {
              featureType: 'water',
              elementType: 'labels.text.fill',
              stylers: [{color: '#515c6d'}]
            },
            {
              featureType: 'water',
              elementType: 'labels.text.stroke',
              stylers: [{color: '#17263c'}]
            }
                
            ]
		});
		ko.applyBindings(new ViewModel());
}

// create place link to ViewModel
var Place = function(data) {
		this.title = data.title;
		this.location = data.location;
};

// ViewModel
var ViewModel = function() {
		var self = this;
		//this.locationlist = ko.observableArray([]);
		this.list = ko.observableArray([]);
		//this.markers = ko.observableArray([]);

		this.filter = ko.observable('');

		locations.forEach(function(location) {
				//self.locationlist.push(new Place(location));
				self.list.push(new Place(location));
		});
		//console.log(self.locationlist());

	// display locationlist dynamically
		self.locationlist = ko.computed(function() {
				return ko.utils.arrayFilter(self.list(), function(locationlist) {
						if (locationlist.title.toLowerCase().indexOf(self.filter().toLowerCase()) >= 0) {
								if (locationlist.marker) {
										locationlist.marker.setVisible(true);
										map.setCenter(locationlist.marker.position);
								}
								return true;
						} else {
								locationlist.marker.setVisible(false);
								largeInfowindow.close();
								return false;
						}
				});
		}, self);

	// information window
		var largeInfowindow = new google.maps.InfoWindow();

	// create marker for each location
		self.locationlist().forEach(function(location) {
				marker = new google.maps.Marker({
						map: map,
						position: location.location,
						animation: google.maps.Animation.DROP,
						title: location.title,
						visible: true,
				});
				//self.markers().push(marker);
				location.marker = marker;
				console.log('location:     '+location);
				console.log('location.marker:        '+location.marker);

		// click the marker while open the information window
				//console.log('location         :'+location);
				marker.addListener('click', function() {
					//console.log('marker           :'+marker);
						Wiki(location,function(wikicontent) {
							//console.log('wikicontent        :'+wikicontent);
								populateInfoWindow(location.marker, largeInfowindow);
						});
				});
		});


	// cool wiki api
		function Wiki(location, callback) {
				var street = location.title;
				var wikiUrl = 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' + street + '&format=json&callback=wikiCallback';
				var wikiRequestTimeout = setTimeout(function() {
						alert("Unfortunately, Wikipedia is unavailable. Please try again later.");
				}, 5000);

				// console.log('street:        '+street);
				// console.log('wikiUrl:         '+wikiUrl);
		//response data via jsonp
				$.ajax({
						url: wikiUrl,
						dataType: "jsonp",
						jsonp: "callback",
						success: function(response) {

								var wikiList = response[1];
				        // console.log('response:        '+response);
								// console.log('wikiList:        '+wikiList);

								var wikiData = wikiList[wikiList.length - 1];
								var url = 'http://en.wikipedia.org/wiki/' + wikiData;
								//console.log(url);

								wikicontent = '<h6>Wikipedia</h6>' + '<h6><a href="' + url + '">' + wikiData + '</a></h6>';
								//console.log('wikicontent:      ' + wikicontent);
								clearTimeout(wikiRequestTimeout);
								callback(wikicontent);
						}
				});
		};


	// when click marker, run this function to open information window and marker bounce
		function populateInfoWindow(marker, infowindow) {
			// Check to make sure the infowindow is not already opened on this marker.
				if (infowindow.marker != marker) {
						infowindow.marker = marker;
						// Wiki(marker.location);
						marker.setAnimation(google.maps.Animation.BOUNCE);
						setTimeout(function() {
								marker.setAnimation(null);
						}, 1000);
						// Wiki(marker.location);
						// console.log(marker.location);
						infowindow.setContent(wikicontent + '<hr>' + '<div>' + marker.title + '</div>');
						console.log('information window :  '+ wikicontent);
						infowindow.open(map, marker);
						// Make sure the marker property is cleared if the infowindow is closed.
						infowindow.addListener('closeclick', function() {
								infowindow.marker = null;
						});
				}
		}


	// when click the marker inside the list open the information window
		self.setmarker = function(data) {

				data.marker.setVisible(true);

				data.marker.setAnimation(google.maps.Animation.BOUNCE);
				Wiki(data,function(wikicontent) {
					//console.log('wikicontent        :'+wikicontent);
						populateInfoWindow(data.marker, largeInfowindow);
				});

				//populateInfoWindow(data.marker, largeInfowindow);

				setTimeout(function() {
						data.marker.setAnimation(null);
				}, 1000);

				map.setCenter(data.marker.position);
		}
};

