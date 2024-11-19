export function refreshCalendar(callback) {
  // Fetch the CSV file
  // api call - to fetch the dynamic data from the machine learning model
  // to fetch output from the GCN model
  // func(selected_date)
  fetch("../swe_forecasting/date_list.csv", {
    method: "GET",
    cache: "no-store", // 'no-store' disables caching
  })
    .then((response) => response.text())
    .then((data) => {
      console.log(data);
      // Parse CSV data and convert the date column into an array
      Papa.parse(data, {
        header: true,
        complete: function (results) {
          // Assuming 'date' is the name of your date column
          var dateArray = results.data.map(function (row) {
            return row.date;
          });
          console.log("dateArray = " + dateArray);

          // Initialize Bootstrap Datepicker with the dateArray
          setup_datepicker(dateArray);

          // found the latest date and show on the map
          var latestdate = findLatestDate(dateArray);
          console.log("Found latest date is " + latestdate);
          $("#datepicker").datepicker("setDate", new Date(latestdate));
          add_swe_predicted_geotiff(latestdate);
        },
      });
    })
    .catch((error) => console.error("Error fetching CSV file:", error));
}

// Function to find the latest date
function findLatestDate(dates) {
  if (dates.length === 0) {
    return null; // Return null for an empty array
  }

  // Use reduce to find the maximum date
  var latestDate = dates.reduce(function (maxDate, currentDate) {
    maxDateObject = new Date(maxDate);
    currentDateObject = new Date(currentDate);
    return currentDateObject > maxDateObject ? currentDate : maxDate;
  });

  return latestDate;
}

function add_listener_to_buttons() {
  // Button click listener
  $("#load_swe_to_map").on("click", function () {
    // Get the selected date from the datepicker
    var selectedDate = $("#datepicker").datepicker("getFormattedDate");
    console.log("loading layer for " + selectedDate);
    // Show overlay with selected date
    add_swe_predicted_geotiff(selectedDate);
  });

  // Close overlay button click listener
  $("#download_swe_geotiff").on("click", function () {
    // Create a temporary anchor element
    var selectedDate = $("#datepicker").datepicker("getFormattedDate");
    console.log("downloading geotiff for " + selectedDate);
    // Open a new window to initiate the download
    window.open(
      "../swe_forecasting/output/swe_predicted_" + selectedDate + ".tif",
      "_blank"
    );
  });
}
