export function setup_datepicker(dateArray){
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
  