export class MapHandler {
  constructor() {
      this.map = null; // Map instance
      this.layerControl = null; // Layer control for managing layers
  }

  initializeMap() {
      // Initialize the Leaflet map
      this.map = L.map('map', {
          zoomControl: false, // Disable default zoom control to prevent duplicates
      }).setView([37.7749, -95.7129], 4); // Centered on the USA

      // Define basemaps
      const basemaps = {
          Topography: L.tileLayer.wms("http://ows.mundialis.de/services/service?", {
              layers: "TOPO-WMS",
          }),
          Places: L.tileLayer.wms("http://ows.mundialis.de/services/service?", {
              layers: "OSM-WMS",
          }),
          SatelliteImagery: L.tileLayer(
              "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
              {
                  attribution: "Esri",
                  maxZoom: 19,
              }
          ),
      };

      // Add default basemap to the map
      basemaps.SatelliteImagery.addTo(this.map);

      // Add layer control to toggle basemaps
      this.layerControl = L.control.layers(basemaps).addTo(this.map);

      // Add zoom control to the top-right corner
      L.control.zoom({ position: "topright" }).addTo(this.map);

      // Fit the map to the USA bounds
      const usaBounds = [
          [25, -125], // Southwest corner
          [49, -100], // Northeast corner
      ];
      this.map.fitBounds(usaBounds);

      // Fetch GeoJSON data for state boundaries
      fetch("/data/us-states.json")
          .then((response) => {
              if (!response.ok) {
                  throw new Error("Failed to load GeoJSON file");
              }
              return response.json();
          })
          .then((data) => {
              // Add GeoJSON layer to the map
              const stateLayer = L.geoJSON(data, {
                  style: function (feature) {
                      return {
                          color: "#000000",
                          weight: 1,
                      };
                  },
                  onEachFeature: (feature, layer) => {
                      if (feature.properties && feature.properties.name) {
                          const stateName = feature.properties.name;
                          const center = layer.getBounds().getCenter();
                          L.marker(center, {
                              icon: L.divIcon({
                                  className: "state-label",
                                  html: `<strong>${stateName}</strong>`,
                                  iconSize: [100, 40],
                              }),
                          }).addTo(this.map);
                      }
                  },
              }).addTo(this.map);

              // Ensure the state boundaries are above other layers
              stateLayer.bringToFront();

              // Add state boundaries to the layer control
              this.layerControl.addOverlay(stateLayer, "State Boundaries");
          })
          .catch((error) => {
              console.error("Error loading GeoJSON data:", error);
          });

      // Add event listener for map clicks
      this.map.on("click", (e) => {
          const lat = e.latlng.lat.toFixed(6);
          const lon = e.latlng.lng.toFixed(6);
          const content = `
              <strong>Coordinates:</strong><br>
              Latitude: ${lat}<br>
              Longitude: ${lon}<br>
              <button onclick="copyCoordinates('${lat}', '${lon}')">Copy Coordinates</button>
          `;

          // Display a popup with the clicked coordinates
          L.popup()
              .setLatLng(e.latlng)
              .setContent(content)
              .openOn(this.map);
      });
  }
}

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
