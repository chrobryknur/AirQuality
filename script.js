var curr_lat;
var curr_lon;
var curr_name;
var mymap;
var markerr;

function OnLoad()
{
    curr_lat = 51.505;
    curr_lon = -0.09;
    curr_name = "Londyn, Greater London, Anglia, SW1A 2DX, Wielka Brytania";
    mymap = L.map('mapid').setView([curr_lat, curr_lon], 6);
    markerr = L.marker([curr_lat, curr_lon]).addTo(mymap);

    L.tileLayer('https://api.maptiler.com/maps/hybrid/{z}/{x}/{y}.jpg?key=e83pNrARepBX8MwFA6sV',
        {
            tileSize: 512,
            zoomOffset: -1,
            minZoom: 1,
            attribution: '<a href="https://www.maptiler.com/copyright/" target="_blank">© MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">© OpenStreetMap contributors</a>',
            crossOrigin: true
        }).addTo(mymap);
    
    mymap.on('click', function (e) {
        curr_lat = e.latlng.lat;
        curr_lon = e.latlng.lng;
        GetReverseGeocoding();
    });
    GetAirQuality();
}


function PopupAirQualityInfo(name, aqi, pm10, pm25) {
    var x =  '<h1>' + name + '</h1><h3> Air Quality Index:  '+ aqi + '</h3>';
    if(pm10!=null)x+=('<h3> PM10:  ' + pm10+ '</h3>');
    if(pm25!=null)x+=('<h3> PM25:  ' + pm25 +'</h3>');
    return x;

}

async function GetReverseGeocoding() {
    var settings =
    {
        "async": true,
        "crossDomain": true,
        "url": "https://us1.locationiq.com/v1/reverse.php?key=54c90c5b15e9ff&lat=" + curr_lat + "&lon=" + curr_lon + "&format=json",
        "method": "GET"
    }

    $.ajax(settings).done(function (response) {
        curr_name = response.display_name;
        markerr.setLatLng([curr_lat, curr_lon]);
        mymap.setView([curr_lat, curr_lon])
    }).then(GetAirQuality);

}

async function GetGeocoding() {
    var key = document.getElementById("search").value;
    key.replace(" ", "%20");
    var settings = {
        "async": true,
        "crossDomain": true,
        "url": "https://eu1.locationiq.com/v1/search.php?key=54c90c5b15e9ff&q=" + key + "&format=json",
        "method": "GET"
    }

    var resp;

    $.ajax(settings).done(function (response) {
        resp = response[0];
    }).then(function () {
        curr_name = resp.display_name;
        curr_lat = resp.lat;
        curr_lon = resp.lon;
        markerr.setLatLng([curr_lat, curr_lon]);
        mymap.setView([curr_lat, curr_lon])
    }).then(GetAirQuality);
}

async function GetAirQuality() {


    var air_key = "ba78a8e04dfed2169f1585591e572f0acfd64b61";
    var response = await fetch("https://api.waqi.info/feed/geo:" + curr_lat + ";" + curr_lon + "/?token=" + air_key);
    var res = await response.json();
    var popup;
    if(res.data.iaqi.pm25 != null && res.data.iaqi.pm10 !=null)
    {
        popup = L.popup().setLatLng([curr_lat, curr_lon]).setContent(PopupAirQualityInfo(curr_name, res.data.aqi, res.data.iaqi.pm10.v, res.data.iaqi.pm25.v));
    }
    else popup = L.popup().setLatLng([curr_lat, curr_lon]).setContent(PopupAirQualityInfo(curr_name, res.data.aqi));
    markerr.bindPopup(popup).openPopup();
    var aqiColor = "red";
    if(res.data.aqi<=50)
        aqiColor = "#49BF41";
    else if(res.data.aqi <=100)
        aqiColor = "#dbe82e";
    else if(res.data.aqi<=150)
        aqiColor = "#e8a32e";
    else if(res.data.aqi<=200)
        aqiColor = "#cf4ddd";
    else if(res.data.aqi<=300)
        aqiColor = "#bc35ce";
    else aqiColor ="#75041d";
    $(".leaflet-popup-content-wrapper").css("background-color",aqiColor);
    if(aqiColor == "#75041d"|| aqiColor =="#bc35ce")
    $(".leaflet-popup-content-wrapper").css("color","white");
}
