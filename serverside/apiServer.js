var Hapi = require('hapi');
var mongoose = require('mongoose/');

mongoose.connect('mongodb://localhost/twitterAPI');
var db = mongoose.connection;

var pointSchema = mongoose.Schema({
    geometry: Object,
    type: String,
    properties: Object
},
{
    collection:'wCoords'
});

var Point = mongoose.model('Point', pointSchema)

var server = new Hapi.Server({
    connections: {
        routes: {
            cors: true
        }
    }
});
server.connection({ port: 8080 });

server.route([
  // Get tweets
  {
    method: 'GET',
    path: '/gps',
    handler: function(request, reply) {
        var lng = request.query.lng;
        var lat = request.query.lat;
        var dist = request.query.dist;
        var result = Point.find(
            {
                geometry:
                    { $near:
                        {
                            $geometry:{type:"Point", coordinates:[parseFloat(lng),parseFloat(lat)]},
                            $minDistance:0,
                            $maxDistance:parseInt(dist)                          
                        }
                    }
            }
        );
        result.exec(function(err, points) {
                reply(points);
        })
    }
  },
  {
    method: 'GET',
    path: '/tweets',
    handler: function(request, reply) {
        var lng = request.query.lng;
        var lat = request.query.lat;
        var dist = request.query.dist;
        var minTime = request.query.minMS
        var maxTime = request.query.maxMS
        var result = Point.find(
            {
                $and: [
                    { geometry:
                        { $near:
                            {
                                $geometry:{type:"Point", coordinates:[parseFloat(lng),parseFloat(lat)]},
                                $minDistance:0,
                                $maxDistance:parseInt(dist)                          
                            }
                        }
                    },
                    { tweetTimeStampMS : {$gt: parseFloat(minMS), $lt: parseFloat(maxMS)}
                    
                    }]
            }
        );
        result.exec(function(err, points) {
                reply(points);
        })
    }
  }

]);

server.start(function(err) {
  console.log('Walter is listening to http://localhost:8080');
});
