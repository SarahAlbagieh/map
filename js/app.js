//----------ViewModel-----------------//
//flag to update the markers
var updateMarkers = false;
//list of locations :
var locationList = [{
        name: 'Riyadh',
        location: {
            lat: 24.713552,
            lng: 46.675296
        },
        link:''
    },
    {
        name: '',
        location: {
            lat: 21.389082,
            lng: 39.857912
        },
        link:''
    },
    {
        name: 'Jeddah',
        location: {
            lat: 21.285407,
            lng: 39.237551
        },
        link:''
    },
    {
        name: 'Medina',
        location: {
            lat: 24.524654,
            lng: 39.569184
        },
        link:''
    },
    {
        name: 'Dammam',
        location: {
            lat: 26.392667,
            lng: 49.977714
        },
        link:''
    },
    {
        name: 'Abha',
        location: {
            lat: 18.246468,
            lng: 42.511724
        },
        link:''
    },
    {
        name: 'Mecca',
        location: {
            lat: 21.389082,
            lng: 39.857912
        },
        link:''
    }
];
//to creat a Location
var Location = function(data) {
    this.name = data.name;
    this.location = data.location;
}
//view Model:
var ViewModel = function() {

    var self = this;
    //the initial list:
    this.listView = ko.observableArray([]);
    //the list that appears when we are search for a location:
    this.listViewUpdated = ko.observableArray([]);
    //user searched item
    this.userInput = ko.observable('');

    // creating Locations and adding it to inital list
    locationList.forEach(function(aLocation) {

        self.listView.push(new Location(aLocation));
    });
    this.currentLocation = ko.observable(this.listView()[0]);
    //updating the list according to the user input
    this.updateLocations = function() {
        //to make sure
        console.log("in updateLocations function");
        //adding to the list if its match the user input:
        for (var i = 0; i < locationList.length; i++) {
            if ((self.userInput()).toLowerCase() === (locationList[i].name).toLowerCase()) {
                //removing the old results
                this.listViewUpdated.pop();
                locationListUpdated.pop();
                // adding it to the new list
                this.listViewUpdated.push(new Location(locationList[i]));
                //adding it to locations to update the markers
                locationListUpdated.push(locationList[i]);
                //showing the updated list:
                document.getElementById('updatedList').style.display = '';
                //hiding the inital list:
                document.getElementById('list').style.display = 'none';
                //signal to update the markers
                updateMarkers = true;
            } // end of if
            // if the user didn't search for anything in the list:
            else if (self.userInput() === '') {
                document.getElementById('list').style.display = '';
                document.getElementById('updatedList').style.display = 'none';
                //don't update markers
                updateMarkers = false;
            } //end of else

        } //end of for

    }; // then end of updatedLocations function

    //method to get the neme of the clicked item in the list
    this.markerInfo = function() {
        // item = document.getElementById('item').val();
        console.log('you clicked me!');
        console.log(document.getElementById('item').textContent);
    }; //end of markerInfo

} //end of View Model
ko.applyBindings(new ViewModel());

//-------- THE MAP AND THE MARKERS --------
//list for inital markers
var markers = [];
// list for search markers
var searchedMarkers = [];
//list for searched locations
var locationListUpdated = [];

var map;

var link;

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 24.713552,
            lng: 46.675296
        },
        zoom: 6
    });
    var largeInfowindow = new google.maps.InfoWindow();
    // setting the inital markers:
    for (var i = 0; i < locationList.length; i++) {
        var position = locationList[i].location;
        var title = locationList[i].name;
        //var link = locationList[i].link;
        var marker = new google.maps.Marker({
            map: map,
            position: position,
            title: title,
            animation: google.maps.Animation.DROP,
            id: i,
            //link:link

        });
        markers.push(marker);
        //when marker clicked
        marker.addListener('click', function() {
            //to for the wiki api:
            var link = markerClicked(this);
            // setting info window:
            populateInfoWindow(this, largeInfowindow , link);
            //toggle
            toggleBounce(this);
        });

        for (var i = 0; i < markers.length; i++) {
            markers[i].setMap(map);
        }

    };
    //end of for
    // to update the markers on the map after clicking 'filter' button
    function hideMarkers() {
        // to make sure that the user entered a value on the list
        if (updateMarkers) {
            //hiding the inital markers:
            for (var i = 0; i < markers.length; i++) {
                markers[i].setMap(null);
            }
            //hiding the previous searched markers from the map
            for (var i = 0; i < searchedMarkers.length; i++) {
                searchedMarkers[i].setMap(null);
            }
            //deleting the previous searched item for the searched markers array if any
            searchedMarkers.pop();
            // showing the searched markers on the map:
            for (var i = 0; i < locationListUpdated.length; i++) {
                var position = locationListUpdated[i].location;
                var title = locationListUpdated[i].name;
                var marker = new google.maps.Marker({
                    map: map,
                    position: position,
                    title: title,
                    animation: google.maps.Animation.DROP,
                    id: i
                });
                searchedMarkers.push(marker);
                marker.addListener('click', function() {
                    //to for the wiki api:
                    //var link = markerClicked(this);
                    // setting info window:
                    populateInfoWindow(this, largeInfowindow);
                });
                for (var i = 0; i < searchedMarkers.length; i++) {
                    searchedMarkers[i].setMap(map);
                }
            }; //end of for
        } //end of if condition
        else if (!updateMarkers) {
            for (var i = 0; i < markers.length; i++) {
                markers[i].setMap(map);
            }
        } //end of else
    } //end of hide markers function
    //------ Wiki Api --------

    function markerClicked(marker) {
        document.getElementById('url').innerHTML = '';
        console.log('inside markerClicked');
        var city = marker.title;

        var wikiUrl = "https://en.wikipedia.org/w/api.php?action=opensearch&search=" + city + "&format=json&callback=wikiCallback"
        // to handel error
        var wikiRequestTimeout = setTimeout(function() {

            $('#url').append("failed to get wikipedia resources")

        }, 8000);

        $.ajax({

            url: wikiUrl,
            dataType: "jsonp",
            success: function(response) {
                var articleList = response[1];
                console.log(articleList);
                articleStr = articleList[0];
                var url = "https://en.wikipedia.org/wiki/" + articleStr;
                $('#url').append(url);
                link = document.getElementById('url').textContent;
                clearTimeout(wikiRequestTimeout);
            }

        });
        console.log(link);
        return link;

    } //end of marker clicked function
    // populate Info window function :
    function populateInfoWindow(marker, infowindow, link) {
        if (infowindow.marker != marker) {
            infowindow.marker = marker;
            //the link the we got from the api function:
            infowindow.setContent('<div>' + '<a href="'+link+'">'+ marker.title+'</a>' + '</div>');
            infowindow.open(map, marker);
            infowindow.addListener('closeClick', function() {
                infowindow.setMarker(null);
            });
        }
    } //end of populateInfoWindow
    function toggleBounce(marker) {
        if (marker.setAnimation() != null) {
            marker.setAnimation(null);
  } else {
    marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function() {
      marker.setAnimation(null);
    }, 3000);
  }
}
    function clickMarker() {
        //click marker

    } //end of clickMarker
    document.getElementById('hide-markers').addEventListener('click', hideMarkers);

}; //end of initmap

// for the menu to open and close
function openNav() {
    document.getElementById("mySidenav").style.width = "250px";
    document.getElementById("main").style.marginLeft = "250px"
}

function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
    document.getElementById("main").style.marginLeft = "0";
}