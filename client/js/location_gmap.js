
// var myCenter = new google.maps.LatLng(52.368093, 4.895180);
// var myCenter = new google.maps.LatLng(lat, lng);
// var map;
// var myLocale = "Amsterdam";

function initialize() { 
    var mapProp = {
        center: myCenter,
        zoom: 10,
        scrollwheel: false,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    //-- get geolocation
    var infowindow = new google.maps.InfoWindow;
    var geocoder = new google.maps.Geocoder;
    //var latlng = {lat: lat, lng: lng};
    var latlng = new google.maps.LatLng(lat, lng);
    //,location
    geocoder.geocode({'latLng': latlng}, function(results, status) {
        if (status === google.maps.GeocoderStatus.OK) {
            if (results[1]) {
                var info = getCountry(results);
                myMapInfo = info;
                infowindow.setContent(info.total);
                // infowindow.setContent(results[4].formatted_address);
                //-- results[0] ~ [7] || use [4] to get city
            } else {
                window.alert('No results found');
            }
        } else {
            console.log('Geocoder failed due to: ' + status);
            myMapInfo = {total:'',country:{short_name:'en'},city:{short_name:''},region:''};
            infowindow.setContent('here');
        }


    });

    getCountry = function(results) {
        var indice=0;
        var city = "";
        var country = "";
        var region = "";
        for (var j = 0; j < results.length; j++) {
            if (results[j].types[0]=='locality' ||
                results[j].types[0]=='administrative_area_level_3') {
                indice = j;
                break;
            }
        }
        for (var i = 0; i < results[j].address_components.length; i++) {
            if (results[j].address_components[i].types[0] == "locality" ||
                results[j].address_components[i].types[0] == "administrative_area_level_3") {
                //this is the object you are looking for
                city = results[j].address_components[i];
            }
            if (results[j].address_components[i].types[0] == "administrative_area_level_1") {
                //this is the object you are looking for
                region = results[j].address_components[i];
            }
            if (results[j].address_components[i].types[0] == "country") {
                //this is the object you are looking for
                country = results[j].address_components[i];
            }
        }
        var total = city.long_name +', '+country.long_name;
        return {total:total,country:country,city:city,region:region};
    }


    map = new google.maps.Map(document.getElementById("locationOnMap"), mapProp);

    var marker = new google.maps.Marker({
        position: myCenter
    });

    marker.addListener('click', function() {
        infowindow.open(map, marker);
    });
    infowindow.open(map, marker);

    marker.setMap(map);

    //-- map resize trigger is called in [login_steps.js] when [enterBtn2] is clicked

}

//-- initialize() is called in [login_steps.js] in order to share global variables...
//google.maps.event.addDomListener(window, 'load', initialize);
