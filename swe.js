function parse_date_string(str) {
    var y = str.substr(0,4),
        m = str.substr(4,2) - 1,
        d = str.substr(6,2);
    var D = new Date(y,m,d);
    return (D.getFullYear() == y && D.getMonth() == m && D.getDate() == d) ? D : 'invalid date';
}

var map, layercontrol;

function loadMap() {
    // Get selected dates from datepicker
    var selectedDates = document.getElementById('datepicker').value.split(',');
    // Get the Leaflet map container
    map = L.map('map').setView([0, 0], 2);

    var basemaps = {
        
        Topography: L.tileLayer.wms('http://ows.mundialis.de/services/service?', {
            layers: 'TOPO-WMS'
        }),

        Places: L.tileLayer.wms('http://ows.mundialis.de/services/service?', {
            layers: 'OSM-WMS'
        }),

        'SatelliteImagery': L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/'+
            '/tile/{z}/{y}/{x}', {
            attribution: 'Esri',
            maxZoom: 19
        }),
    };

    basemaps.SatelliteImagery.addTo(map);

    // Add layer control to the map
    layercontrol = L.control.layers(basemaps).addTo(map);
    // Add zoom control to the top right corner
    L.control.zoom({ position: 'topright' }).addTo(map);
    
    var usaBounds = [
       // -125, 25, -100, 49
       [25, -125.000000], // Southwest
       [49, -100]   // Northeast
    ];

    // Fit the map to the bounding box
    map.fitBounds(usaBounds);
    
    // Load GeoJSON data and add state boundaries with labels
    fetch('us-states.json')
        .then(response => response.json())
        .then(data => {
            var stateLayer = L.geoJSON(data, {
                style: function (feature) {
                    return {
                        color: '#000000',
                        weight: 1
                    };
                },
                onEachFeature: function (feature, layer) {
                    if (feature.properties && feature.properties.name) {
                        var stateName = feature.properties.name;
                        var center = layer.getBounds().getCenter();
                        L.marker(center, {
                            icon: L.divIcon({
                                className: 'state-label',
                                html: `<strong>${stateName}</strong>`,
                                iconSize: [100, 40]
                            })
                        }).addTo(map);
                    }
                }
            }).addTo(map);

            stateLayer.bringToFront();
            layercontrol.addOverlay(stateLayer, "State Boundaries");
        })
        .catch(error => {
            console.error('Error loading GeoJSON data:', error);
        });
 map.on('click', function (e) {
        var lat = e.latlng.lat.toFixed(6);
        var lon = e.latlng.lng.toFixed(6);
        var content = `<strong>Coordinates:</strong><br>Latitude: ${lat}<br>Longitude: ${lon}<br><button onclick="copyCoordinates('${lat}', '${lon}')">Copy Coordinates</button>`;
        L.popup()
            .setLatLng(e.latlng)
            .setContent(content)
            .openOn(map);
    });
}

// Function to copy coordinates to clipboard
function copyCoordinates(lat, lon) {
    const textToCopy = `${lat}, ${lon}`;
    if (navigator.clipboard) {
        navigator.clipboard.writeText(textToCopy)
            .then(() => {
                alert('Coordinates copied to clipboard!');
            })
            .catch(err => {
                console.error('Failed to copy: ', err);
            });
    } else {
        // Fallback for older browsers
        var tempInput = document.createElement('input');
        tempInput.value = textToCopy;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
        alert('Coordinates copied to clipboard!');
    }
}

function add_swe_predicted_geotiff(date){

    // URL to your GeoTIFF file
    var wmslayer = L.tileLayer.wms('http://geobrain.csiss.gmu.edu/cgi-bin/mapserv?'+
            'map=/var/www/html/swe_forecasting/map/swe_predicted_'+date+'.tif.map&', {
            layers: 'swemap',
            format: 'image/png',
            transparent: true
    });
    wmslayer.addTo(map);
    layercontrol.addOverlay(wmslayer, "Predicted SWE "+date);

}

function setup_datepicker(dateArray){
    $('#datepicker').datepicker({
        format: 'yyyy-mm-dd',
        todayHighlight: true,
        timeZone: 'America/Los_Angeles',
        autoclose: true,
        beforeShowDay: function(date) {
            // Convert date to yyyy-mm-dd format
            var formattedDate = date.getFullYear() + '-' + 
                ('0' + (date.getMonth() + 1)).slice(-2) + '-' + 
                ('0' + date.getDate()).slice(-2);

            // Check if the date is in the dateArray
            return dateArray.includes(formattedDate);
        }
    });
}

// Function to find the latest date
function findLatestDate(dates) {
    if (dates.length === 0) {
        return null; // Return null for an empty array
    }

    // Use reduce to find the maximum date
    var latestDate = dates.reduce(function (maxDate, currentDate) {
        maxDateObject = new Date(maxDate)
        currentDateObject = new Date(currentDate)
        return currentDateObject > maxDateObject ? currentDate : maxDate;
    });

    return latestDate;
}

function refresh_calendar(){
    // Fetch the CSV file
    fetch('../swe_forecasting/date_list.csv', {
      method: 'GET',
      cache: 'no-store', // 'no-store' disables caching
    })
      .then(response => response.text())
      .then(data => {
          console.log(data)
          // Parse CSV data and convert the date column into an array
          Papa.parse(data, {
              header: true,
              complete: function(results) {
                  // Assuming 'date' is the name of your date column
                  var dateArray = results.data.map(function(row) {
                      return row.date;
                  });
                  console.log("dateArray = " + dateArray)
  
                  // Initialize Bootstrap Datepicker with the dateArray
                  setup_datepicker(dateArray)
  
                  // found the latest date and show on the map
                  var latestdate = findLatestDate(dateArray)
                  console.log("Found latest date is " + latestdate)
                  $('#datepicker').datepicker('setDate', new Date(latestdate));
                  add_swe_predicted_geotiff(latestdate)
              }
          });
  
      })
      .catch(error => console.error('Error fetching CSV file:', error));
  }
function add_listener_to_buttons(){

    // Button click listener
    $('#load_swe_to_map').on('click', function() {
        // Get the selected date from the datepicker
        var selectedDate = $('#datepicker').datepicker('getFormattedDate');
        console.log("loading layer for "+ selectedDate)
        // Show overlay with selected date
        add_swe_predicted_geotiff(selectedDate);
    });

    // Close overlay button click listener
    $('#download_swe_geotiff').on('click', function() {
        // Create a temporary anchor element
        var selectedDate = $('#datepicker').datepicker('getFormattedDate');
        console.log("downloading geotiff for "+ selectedDate)
        // Open a new window to initiate the download
        window.open("../swe_forecasting/output/swe_predicted_"+selectedDate+".tif", '_blank');
    });

}
function getColor(d) {
    // Specify the number of classes (baskets)
    // var numClasses = 10;
  
    // // Generate grades dynamically based on the number of classes
    // var grades = Array.from({ length: numClasses + 1 }, function (_, index) {
    //   return (30 / numClasses) * index;
    // });
  
    // // Define color scale from gray to blue to purple
    // var colorScale = chroma.scale(['#f0f0f0', '#4d4dff', '#9900cc']).mode('lab').colors(numClasses);

    // // 
  
    // // Find the appropriate color class based on the input value
    // for (var i = 0; i < grades.length - 1; i++) {
    //   if (d >= grades[i] && d < grades[i + 1]) {
    //     return colorScale[i];
    //   }
    // }

    // console.log(colorScale)

    // Define color classes
    // var colors = ['#f0f0f0', '#d6caf5', '#b9a6f9', '#9782fc', '#6c5efe', 
    //     '#5b48f9', '#713eee', '#8131e2', '#8e21d7', '#9900cc']
    
    var colors = ['#003366', '#336699', '#6699CC', '#99CCFF', '#99FFFF', 
        '#CCFFFF', '#FFFFCC', '#FFFF99', '#FFFF66', '#FFFF33']

    // Specify the number of classes (baskets)
    var numClasses = 10;

    // Generate grades dynamically based on the number of classes
    var grades = Array.from({ length: numClasses + 1 }, function (_, index) {
        return (30 / numClasses) * index;
    });

    // Find the appropriate color class based on the input value
    for (var i = 0; i < grades.length - 1; i++) {
        if (d >= grades[i] && d < grades[i + 1]) {
            return colors[i];
        }
    }
    // Handle the case where the input value is greater than the last grade
    return colors[grades.length - 1];
  }

function add_legend(){
    // Your MapServer configuration with 15 classes
    var legend = L.control({position: 'bottomright'});

    legend.onAdd = function (map) {

        var div = L.DomUtil.create('div', 'info legend'),
            labels = [];

        div.style.backgroundColor = 'white';
        div.style.padding = '10px';
        // Specify the number of classes (baskets)
        var numClasses = 10;
        
        // Generate grades dynamically based on the number of classes
        var grades = Array.from({ length: numClasses + 1 }, function(_, index) {
            return (30 / numClasses) * index;
        });

        // loop through our density intervals and generate a label with a colored square for each interval
        for (var i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }

        return div;
    };

    legend.addTo(map);
}
// Automatically load the map when the document is ready
document.addEventListener('DOMContentLoaded', function() {
    loadMap();
    refresh_calendar()
    add_listener_to_buttons()
    add_legend()
});
