var week = 604800000; // two weeks in milliseconds
var d = new Date()
var total = d.getTime() - week;
var date  = new Date(total);

$( function() {
  $( "#fromDate" ).datepicker({maxDate: new Date(date.getFullYear(), date.getMonth(), date.getDate())});
} );

$( function() {
  $( "#toDate" ).datepicker({maxDate: new Date(date.getFullYear(), date.getMonth(), date.getDate())});
} );
