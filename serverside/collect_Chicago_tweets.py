from TwitterAPI.TwitterAPI import TwitterAPI
from geojson import Feature, Point
import json
import time
from pymongo import MongoClient

while True:
    try:

        CONSUMER_KEY = 'XXXX'
        CONSUMER_SECRET = 'XXXX'
        ACCESS_TOKEN_KEY = 'XXXX'
        ACCESS_TOKEN_SECRET = 'XXXX'

        api = TwitterAPI(CONSUMER_KEY,
                         CONSUMER_SECRET,
                         ACCESS_TOKEN_KEY,
                         ACCESS_TOKEN_SECRET)

        r = api.request('statuses/filter', {'locations': "-87.940033, 41.644102, -87.523993, 42.023067 "})

        client = MongoClient("localhost:27017")
        db = client.tweets

        for item in r:

            if item['coordinates'] is not None:

                lng = item['coordinates']['coordinates'][0]
                lat = item['coordinates']['coordinates'][1]
                tweetPoint = Point((lng, lat))
                placeName = item['place']['full_name']

                name = item['user']['name']
                screeName = item['user']['screen_name']
                image = item['user']['profile_image_url']

                tweetDate = str(item['created_at'])
                tweetTimeStampMS = float(item['timestamp_ms'])

                content = item['text']
                hash = list((object['text'] for object in item['entities']['hashtags']))
                urls = list((object['url'] for object in item['entities']['urls']))

                tweet = Feature(geometry=tweetPoint,
                                properties={"userName": name, "screeName": screeName, "image": image, "tweetDate": tweetDate,
                                            "tweetTimeStampMS": tweetTimeStampMS, "text": content, "hashTags": hash,
                                            "urls": urls, "placeName": placeName})

                db.posts.insert_one(
                    {
                        "type": "Feature",
                        "geometry": {"type": "Point", "coordinates": [lng, lat]},
                        "properties": {
                            "userName": name,
                            "screeName": screeName,
                            "image": image,
                            "tweetDate": tweetDate,
                            "tweetTimeStampMS": tweetTimeStampMS,
                            "text": content,
                            "hashTags": hash,
                            "urls": urls,
                            "placeName": placeName
                        }
                    }
                )
                print json.dumps(tweet, indent=2)
                print "sent to posts"
            else:
                placeName = item['place']['full_name']

                name = item['user']['name']
                screeName = item['user']['screen_name']
                image = item['user']['profile_image_url']

                tweetDate = str(item['created_at'])
                tweetTimeStampMS = float(item['timestamp_ms'])

                content = item['text']
                hash = list((object['text'] for object in item['entities']['hashtags']))
                urls = list((object['url'] for object in item['entities']['urls']))

                tweet = Feature(geometry=None,
                                properties={"userName": name, "screeName": screeName, "image": image, "tweetDate": tweetDate,
                                            "tweetTimeStampMS": tweetTimeStampMS, "text": content, "hashTags": hash,
                                            "urls": urls, "placeName": placeName})
                db.noCoords.insert_one(
                    {
                        "type": "Feature",
                        "geometry": None,
                        "properties": {
                            "userName": name,
                            "screeName": screeName,
                            "image": image,
                            "tweetDate": tweetDate,
                            "tweetTimeStampMS": tweetTimeStampMS,
                            "text": content,
                            "hashTags": hash,
                            "urls": urls,
                            "placeName": placeName
                        }
                    }
                )
                print json.dumps(tweet, indent=2)
                print "sent to noCoords"
        pass
    except Exception as e:
        print("Something went wrong: "+repr(e))
        time.sleep(15)
