//MAP TWEETS

var tweetMarkers = [];
var currentTweetMarkers = [];

//ADD TWEET MARKERS TO THE MAP
function addTweetMarkers() {
  for (var i = 1; i < currentTweetMarkers.length; i++) {
    (function (i) {
      setTimeout(function () { currentTweetMarkers[i].setMap(map); }, 25 * i);
    })(i);
  }
}

//get the tweets
$('#test').click(function() {
  //var url='https://api.myjson.com/bins/qqemn';
  var url='https://api.myjson.com/bins/nvqn3';
  console.log(url);

  $.getJSON(url, function(data, textstatus) {
    console.log(data);
    $.each(data, function(i, entry) {
      console.log(entry.text);
      console.log(entry.lat)

      var symbol = {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: '#31bce0',
        fillOpacity: 0.7,
        scale: 5,
        strokeColor: 'black',
        strokeWeight: 2,
        strokeOpacity: .6
      };

      var marker = new google.maps.Marker({
        //animation: google.maps.Animation.DROP,
        position: new google.maps.LatLng(entry.lat,
          entry.lng),
          title: entry.text,
          icon: symbol
      });
      tweetMarkers.push(marker);
      currentTweetMarkers.push(marker);

    });
    //drop markers onto the map using the addMarkers.js script
    addTweetMarkers();
  });
  currentTweetMarkers = [];
});
