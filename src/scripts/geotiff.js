export function add_swe_predicted_geotiff(map, layerControl, date) {
  if (!date) {
    console.error("Date is required to load GeoTIFF.");
    return;
  }

  const wmslayer = L.tileLayer.wms(
    `http://geobrain.csiss.gmu.edu/cgi-bin/mapserv?map=/var/www/html/swe_forecasting/map/swe_predicted_${date}.tif.map&`,
    {
      layers: "swemap",
      format: "image/png",
      transparent: true,
    }
  );

  wmslayer.addTo(map);
  layerControl.addOverlay(wmslayer, `Predicted SWE ${date}`);
}
