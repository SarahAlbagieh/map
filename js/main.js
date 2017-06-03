//----------ViewModel-----------------//
//list of locations :
var locationList = [{
        name: 'Riyadh',
        location: {
            lat: 24.713552,
            lng: 46.675296
        }
    },

    {
        name: 'Jeddah',
        location: {
            lat: 21.285407,
            lng: 39.237551
        }
    },
    {
        name: 'Medina',
        location: {
            lat: 24.524654,
            lng: 39.569184
        }
    },
    {
        name: 'Dammam',
        location: {
            lat: 26.392667,
            lng: 49.977714
        }
    },
    {
        name: 'Abha',
        location: {
            lat: 18.246468,
            lng: 42.511724
        }
    },
    {
        name: 'Mecca',
        location: {
            lat: 21.389082,
            lng: 39.857912
        }
    }
];
var markers = [];
var listView = ko.observableArray(locationList);
var markersList = ko.observableArray(markers);
var link;
//view Model:
var ViewModel = function() {

    var self = this;
    this.userInput = ko.observable('');

    //filtering the list and the markers according to user input:
    this.filterList = ko.computed(() => {
        if (!self.userInput()) {
            for (var i = 0; i < markers.length; i++) {
                markers[i].setVisible(true);
            }
            return listView();
        } else {
            return ko.utils.arrayFilter(listView(), (item) => {
                if (item.name.toLowerCase().indexOf(self.userInput().toLowerCase()) !== -1) {
                    item.marker.setVisible(true);
                } else {
                    item.marker.setVisible(false);
                }
                return item.name.toLowerCase().indexOf(self.userInput().toLowerCase()) !== -1;
            });
        }
    }); //.filterList
    //showing the infowindow when user click the items in the list
    this.listViewClicked = function(index) {
        var marker = listView()[index].marker;
        //i used google map library to trigger markers
         google.maps.event.trigger(marker, 'click');

    };

}; //end of View Model

//----------map and markers----------
function handelMapError() {
    alert('google map is not working !!');
}
var map;

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 24.713552,
            lng: 46.675296
        },
        zoom: 6
    });
    var largeInfowindow = new google.maps.InfoWindow();
    for (var i = 0; i < listView().length; i++) {
        var position = listView()[i].location;
        var title = listView()[i].name;
        var marker = new google.maps.Marker({
            map: map,
            position: position,
            title: title,
            animation: google.maps.Animation.DROP,
            id: i
        });
        marker.addListener('click', function() {
            // setting info window:
            populateInfoWindow(this, largeInfowindow);
            //toggle
            toggleBounce(this);
        });
        //adding markers to array :
        listView()[i].marker = marker;
        markers.push(marker);
    }
    for (var n = 0; n < listView().length; n++) {
        (listView()[n].marker).setMap(map);
    }

    function populateInfoWindow(marker, infowindow) {
        //api part
        var city = marker.title;
        var wikiUrl = "https://en.wikipedia.org/w/api.php?action=opensearch&search=" + city + "&format=json&callback=wikiCallback";
        $.ajax({
            url: wikiUrl,
            dataType: "jsonp"
        }).done(function(data) {
            var articleList = data[1];
            console.log(articleList);
            articleStr = articleList[0];
            infowindow.setContent('<a href="https://en.wikipedia.org/wiki/' + articleStr + '">' + marker.title + '</a>');

        }).fail(function(jqXHR, textStatus) {
            alert('Wiki is not working!');
        });


        if (infowindow.marker != marker) {
            infowindow.marker = marker;
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

} // .initMap


ko.applyBindings(new ViewModel());

// for the menu to open and close
function openNav() {
    document.getElementById("mySidenav").style.width = "250px";
    document.getElementById("main").style.marginLeft = "250px";
}

function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
    document.getElementById("main").style.marginLeft = "0";
}