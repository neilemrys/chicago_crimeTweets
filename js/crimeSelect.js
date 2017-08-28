var getTypes = "https://data.cityofchicago.org/resource/6zsd-86xi.json?$select=primary_type&$group=primary_type&$order=primary_type%20&$$app_token=09sIcqEhoY0teGY5rhupZGqhW";

function list() {
  $.getJSON(getTypes,function(data){
    $.each(data, function(i, entry){
      //console.log(entry.primary_type);
      var html = $('#crimes').html();
      //console.log(html);
      var option = '<option>'+entry.primary_type+'</option>';
      $(option).appendTo("#crimes");
    })
  })
};
