export function setupDatepicker(dateArray, onSelectDate) {
    $("#datepicker").datepicker({
      format: "yyyy-mm-dd",
      todayHighlight: true,
      autoclose: true,
      beforeShowDay: (date) => {
        const formattedDate = `${date.getFullYear()}-${(
          "0" +
          (date.getMonth() + 1)
        ).slice(-2)}-${("0" + date.getDate()).slice(-2)}`;
        return dateArray.includes(formattedDate);
      },
    });
  
    // Trigger the callback when a date is selected
    $("#datepicker").on("changeDate", function (e) {
      onSelectDate(e.format("yyyy-mm-dd"));
    });
  }
  