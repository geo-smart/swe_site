import { refreshCalendar} from "./utils.js";
import { MapHandler } from "./map.js";
import { setupDatepicker } from "./datepicker.js";
import { add_swe_predicted_geotiff } from "./geotiff.js";
import { addLegend } from "./legend.js";
import { setupEventListeners } from "./events.js";

document.addEventListener("DOMContentLoaded", function () {
  // Initialize the map
  const mapHandler = new MapHandler();
  mapHandler.initializeMap();

  // Load available dates into the datepicker
  refreshCalendar((dateArray) => {
    setupDatepicker(dateArray, (selectedDate) => {
      console.log(`Date selected: ${selectedDate}`);
      // Load SWE GeoTIFF prediction for the selected date
      add_swe_predicted_geotiff(mapHandler.map, mapHandler.layerControl, selectedDate);
    });
  });

  // Set up event listeners for map and buttons
  setupEventListeners(mapHandler.map, mapHandler.layerControl);

  // Add a legend to the map
  addLegend(mapHandler.map);
});
