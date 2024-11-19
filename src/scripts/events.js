export function setupEventListeners(map, layerControl) {
  // Listener for SWE map loading button
  $("#load_swe_to_map").on("click", function () {
    const selectedDate = $("#datepicker").datepicker("getFormattedDate");
    console.log(`Loading SWE prediction for: ${selectedDate}`);
    addGeoTIFF(map, layerControl, selectedDate);
  });

  // Listener for SWE GeoTIFF download button
  $("#download_swe_geotiff").on("click", function () {
    const selectedDate = $("#datepicker").datepicker("getFormattedDate");
    console.log(`Downloading GeoTIFF for: ${selectedDate}`);
    window.open(`../swe_forecasting/output/swe_predicted_${selectedDate}.tif`, "_blank");
  });
}
