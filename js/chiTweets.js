var twitterPosts = [];
var currentQueryPosts = [];

//ADD TWEETS TO MAP
function addTweets() {
  for (var i = 1; i < currentQueryposts.length; i++) {
    (function (i) {
      setTimeout(function () { currentQueryPosts[i].setMap(map); }, 25 * i);
    })(i);
  }
}
