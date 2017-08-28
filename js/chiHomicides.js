//VATIABLES FOR HOMICIDE QUERY
var primary_type;
var markers = [];
var currentQueryMarkers = [];
var legend = [];

//VARIABLES FOR TWEET QUERY
var twitterPosts = [];
var currentQueryPosts = [];

//ADD MARKERS TO THE MAP
function addMarkers() {
  for (var i = 0; i < currentQueryMarkers.length; i++) {
    (function (i) {
      setTimeout(function () { currentQueryMarkers[i].setMap(map); }, 25 * i);
    })(i);
  }
}

function clearMap() {
  for(i=0; i<markers.length; i++){
    markers[i].setMap(null);
  }
  for(i=0; i<currentQueryPosts.length; i++){
    currentQueryPosts[i].setMap(null);
  }

  //$("#fromDate").val("")
  //$("#toDate").val("")

  markers = [];
  currentQueryMarkers = [];
  currentQueryPosts = [];
  twitterPosts = [];

    document.getElementById("homicideContent").innerHTML = '<p>Enter criteria into the query form above. Click "Map Crime" to populate the map with homicide locations.</p><br /><p>Click on a homocide location and detailed information will be displayed here.</p><br /><p>Any co-located Twitter post will appear on the map and their information will be displayed below.</p>';

    document.getElementById("tweetBox").innerHTML = '';
}

//CLEAR ALL MARKERS FROM MAP
$('#clearHomicides').click(function() {
  clearMap();
});

//ADD MARKERS FUNCTION END

//BUILD THE SODA API QUERY AND COLLECT POINTS FROM RETURNED DATA
$('#getHomicides').click(function() {
  var stDate = $('#fromDate').val();
  var enDate = $('#toDate').val();
  var startDate = new Date(stDate);
  var endDate = new Date(enDate);
  var sYear = startDate.getFullYear();
  var eYear = endDate.getFullYear();
  var sMonth = startDate.getMonth() + 1;
  var eMonth = endDate.getMonth() + 1;
  var sDate = startDate.getDate();
  var eDate = endDate.getDate();
  var start = sYear + "-" + sMonth + "-" + sDate;
  var end = eYear + "-" + eMonth + "-" + eDate;
  var type = $('#crimes').val();
  console.log(type);
  var url;
  clearMap();

  if(type === 'ALL') {
    url = 'https://data.cityofchicago.org/resource/6zsd-86xi.json?$limit=3000&$where=date between "'+start+'T00:00:00" and "'+end+'T23:59:59" &$$app_token=09sIcqEhoY0teGY5rhupZGqhW';
  } else {
    url = 'https://data.cityofchicago.org/resource/6zsd-86xi.json?$limit=3000&primary_type='+type+'&$where=date between "'+start+'T00:00:00" and "'+end+'T23:59:59" &$$app_token=09sIcqEhoY0teGY5rhupZGqhW';
  }
  //url = "http://192.155.82.53:8080/gps?dist=1000&lng=-87.69634500000001&lat=41.883275"
  console.log(url);
  $.getJSON(url, function(data, textstatus) {
    //console.log(data);

    $.each(data, function(i, entry) {
      //console.log(entry.location.coordinates[1]);
      if (entry.location) {

      primary_type = entry.primary_type;

      //Define the svg marker symbols using marker.js
      var symbol = {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: 'red',
        fillOpacity: 0.7,
        scale: 8,
        strokeColor: 'black',
        strokeWeight: 2,
        strokeOpacity: .6
      };
      //SELECTED MARKER SYMBOL
      var selectedMarker = {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: 'rgb(61, 238, 63)',
        fillOpacity: 0.7,
        scale: 8,
        strokeColor: 'black',
        strokeWeight: 2,
        strokeOpacity: .6
      }
      //TWEET SYMBOL
      var tweetSymbol = {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: 'blue',
        fillOpacity: 0.7,
        scale: 5,
        strokeColor: 'black',
        strokeWeight: 2,
        strokeOpacity: .6
      };
      //SELECTED TWEET SYMBOL
      var selectedTweet = {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: 'rgb(223, 168, 60)',
        fillOpacity: 0.7,
        scale: 5,
        strokeColor: 'black',
        strokeWeight: 2,
        strokeOpacity: .6
      };
      var chiTime = moment.tz(entry.date, "America/Chicago").format();
      var marker = new google.maps.Marker({
        //animation: google.maps.Animation.DROP,
        position: new google.maps.LatLng(entry.location.coordinates[1],
          entry.location.coordinates[0]),
          timestamp: new Date(chiTime).getTime(),
          title: "#"+entry.case_number+": "+entry.description,
          icon: symbol
        });
        //console.log(chiTime);
        markers.push(marker);
        currentQueryMarkers.push(marker);

        var arrest
        if (entry.arrest) {
          arrest = 'YES';
        } else {
          arrest = 'NO';
        }


        marker.htmlStr = "<table><tr class='thead'><td class='field'>#" + entry.case_number + ":</td><td class='tdata'>" + entry.primary_type + "</td></tr><tr><td class='field'>description:</td><td class='tdata'>" + entry.description + "</td></tr><tr><td class='field'>arrest:</td><td class='tdata'>" + arrest + "</td></tr><tr><td class='field'>date:</td><td class='tdata'>" + entry.date.substring(0,10) + "</td></tr><tr><td class='field'>time (24-hour):</td><td class='tdata'>" + entry.date.substring(11,16) + "</td></tr><tr><td class='field'>ward:</td><td class='tdata'>" + entry.ward + "</td></tr><tr><td class='field'>police district:</td><td class='tdata'>" + entry.district + "</td></tr><tr><td class='field'>beat:</td><td class='tdata'>" + entry.beat + "</td></tr><tr><td class='field'>address (block level):</td><td class='tdata'>" + entry.block + "</td></tr><tr><td class='field'>location description:</td><td class='tdata'>" + entry.location_description + "</td></tr><tr><td class='field'>coordinates:</td><td class='tdata'>" + entry.latitude + ", " + entry.longitude + "</td></tr><tr><td colspan='2' class='field' id='lastUp'>Last updated on " + entry.updated_on.substring(0,10) + " at " + entry.updated_on.substring(11,16) + "</td></tr></table>"


        marker.addListener('click', function() {

          for(i=0; i<currentQueryMarkers.length; i++){
            currentQueryMarkers[i].setIcon(symbol);
          };
          marker.setIcon(selectedMarker);
          //console.log(this.htmlStr);
          //map.setZoom(15);
          //map.setCenter(marker.getPosition());
          document.getElementById("homicideContent").innerHTML = marker.htmlStr;
          //CLEAR ANY PREVIOUS TWEETMARKS
          for(i=0; i<twitterPosts.length; i++){
            twitterPosts[i].setMap(null);
          };
            currentQueryPosts = [];
            twitterPosts = [];

            //MAKE TWEET QUERY TO LINODE SERVER
            //var radius = parseInt($('#distRadius').val())*1609.344
            var radius = $('#distRadius').val();
            var timeRad = $('#timeRadius').val()*60000;
            var lat = marker.getPosition().lat();
            var lng = marker.getPosition().lng();
            var ts = marker.timestamp;
            var miTS = ts - timeRad;
            var maTS = ts + timeRad;
            currentQueryPosts=[];
            //console.log(miTS);
            //console.log(ts);
            //console.log(maTS);
            //console.log(timeRad);
            //console.log(lat + " " + lng);
            var uri = "http://192.155.82.53:8080/tweets?dist="+radius+"&lng="+lng+"&lat="+lat+"&minMS="+miTS+"&maxMS="+maTS;
            console.log(uri);

            $.getJSON(uri, function(data) {
              //console.log(data);
              //PUSH TWEET MARKERS TO currentQueryPosts array
              $('#tweetBox').empty();
              $.each(data, function(i, entry){

                //ADD EACH TWEET TO LIST INSIDE
                var lt = entry.geometry.coordinates[1];
                var lg = entry.geometry.coordinates[0];
                var screenName = entry.properties.screeName;
                var text = entry.properties.text;
                var place = entry.properties.placeName;
                var time = entry.properties.tweetTimeStampMS;
                var tweetTime = moment.tz(time, "America/Chicago").format();
                var userName = entry.properties.userName;
                var image = entry.properties.image;
                var urls = entry.properties.urls;
                var links="";
                for(var i=0; i<urls.length; i++){
                  var link = "<a target='_blank' href='"+urls[i]+"'>"+urls[i]+"</a>";
                  links = links+link;
                };

                var tweet = "<div class='tweet'><div class='userImage'><img src='"+image+"'></img></div><div>"+screenName+"/"+userName+"</div><div>"+tweetTime+"</div><div>"+text+"</div><div>"+links+"</div></div>";

                $(tweet).appendTo('#tweetBox');



                var tweetMark = new google.maps.Marker({
                  //animation: google.maps.Animation.DROP,
                  position: new google.maps.LatLng(lt,lg),
                    title: screenName+"\n"+text,
                    icon: tweetSymbol
                  });
                  twitterPosts.push(tweetMark);
                  currentQueryPosts.push(tweetMark);

                  tweetMark.addListener('click', function(){
                    for(i=0; i<currentQueryPosts.length; i++){
                      currentQueryPosts[i].setIcon(tweetSymbol);
                    };
                    tweetMark.setIcon(selectedTweet);
                  });
              });
              addTweets();
          });
        });
      }
      });

      //drop markers onto the map using the addMarkers.js script
      addMarkers();

      // Create/update legend using the makeLegend.js script
      //makeLegend();
    });

    //Empty the array that holds the markers for the current query
    currentQueryMarkers = [];
  });


//ADD TWEETS TO MAP
function addTweets() {
  for (var i = 0; i < currentQueryPosts.length; i++) {
    (function (i) {
      setTimeout(function () { currentQueryPosts[i].setMap(map); }, 25 * i);
    })(i);
  }
};

//SELECTED MARKER SYMBOL
