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
            layers: 'OSM-Overlay-WMS'
        }),

        'Topography, then places': L.tileLayer.wms('http://ows.mundialis.de/services/service?', {
            layers: 'TOPO-WMS,OSM-Overlay-WMS'
        }),

        'Places, then topography': L.tileLayer.wms('http://ows.mundialis.de/services/service?', {
            layers: 'OSM-Overlay-WMS,TOPO-WMS'
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
        autoclose: true,
        beforeShowDay: function(date) {
            // Convert date to yyyy-mm-dd format
            var formattedDate = date.getFullYear() + '-' + 
                ('0' + (date.getMonth() + 1)).slice(-2) + '-' + 
                ('0' + date.getDate()).slice(-2);
            console.log("formattedDate = " + formattedDate)

            // Check if the date is in the dateArray
            return dateArray.includes(formattedDate);
        }
    });
}

function refresh_calendar(){
  // Fetch the CSV file
//   fetch('../swe_forecasting/date_list.csv')
  fetch('./test_date.csv')
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
        console.log("loading layer for "+ selectedDate)
        // Open a new window to initiate the download
        window.open("../swe_forecasting/output/swe_predicted_"+selectedDate+".tif", '_blank');
    });

}


// Automatically load the map when the document is ready
document.addEventListener('DOMContentLoaded', function() {
    loadMap();
    add_swe_predicted_geotiff()
    refresh_calendar()
    setup_datepicker([])
    add_listener_to_buttons()
});