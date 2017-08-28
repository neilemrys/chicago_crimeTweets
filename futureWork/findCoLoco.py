#IMPORTS
    #-PYMONGO TO CONNECT TO LOCAL DATABASE
    #-DATETIME TO PARSE TIMESTAMPS
    #-PYTZ TO LOCALIZE CENTRAL TIMEZONE

from pymongo import MongoClient
from datetime import datetime
import pytz
import csv

#VARIABLES TO SIMPLIFY DATABASE INTERACTION
client = MongoClient('localhost', 27017)
db = client['allTweets']
crimes = db.junArson
tweets = db.wCoords

output = 'junArson_coLoco_counts.csv'
output2 = 'junArson_coLoco.csv'
output3 = 'junArson_noCoLoco.csv'

#GLOBAL VARIABLE TO LOCALIZE INCIDENTS TO CENTRAL TIME
ct = pytz.timezone('America/Chicago')

#INITIALIZE DISTANCE BUFFER (METERS)
d = 150

with open(output,'a',newline = '') as file:
    wr = csv.writer(file)
    header = ['DISTANCE_BUFF','INCIDENT_ID','DATETIME','INC_LAT','INC_LNG','10_MIN_COLOCO']
    wr.writerow(header)
    file.close()

with open(output2,'a',newline = '') as file:
    wr = csv.writer(file)
    header = ['DISTANCE_BUFF','INCIDENT_ID','USER','TWEET_LAT','TWEET_LNG','TEXT']
    wr.writerow(header)
    file.close()

with open(output3,'a',newline = '') as file:
    wr = csv.writer(file)
    header = ['DISTANCE_BUFF','INCIDENT_ID','DATETIME','INC_LAT','INC_LNG','10_MIN_COLOCO']
    wr.writerow(header)
    file.close()

while d <= 150:

    for crime in crimes.find({"location":{"$exists": True}}):

        tRadius = 600000
        counts = []
        counts.append(str(d))
        counts.append(crime['case_number'])
        counts.append(crime['date'])
        counts.append(crime['location']['coordinates'][1])
        counts.append(crime['location']['coordinates'][0])

        #GET THE CRIME LOCATION
        coords = crime['location']['coordinates']
        #GET THE CRIME DATE
        tStamp = crime['date']
        #TURN THE DATE INTO A TIMESTAMP IN SECONDS
        unawareT = datetime.strptime(tStamp, '%Y-%m-%dT%H:%M:%S.%f')
        #CONVERT TIME TO CENTRAL TIME IN MILLISECONDS
        t = ct.localize(unawareT).timestamp() * 1000
        #USED TO CREATE TIME BUFFER IN MONGODB QUERY
        maxT = t + tRadius
        minT = t - tRadius
        #MONGODB QUERY VARIABLE
        near = {'$and': [{'geometry': {
            '$near': {'$geometry': {'type': "Point", 'coordinates': coords}, '$minDistance': 0,
                      '$maxDistance': d}}},
            {'properties.tweetTimeStampMS': {'$gt': minT, '$lt': maxT}}]}
        #QUERY THE MONGO DATABASE
        count = (tweets.find(near).count())
        if count > 0:
            counts.append(str(count))
            tRadius = tRadius + 900000

            print(counts)
            with open(output,'a',newline = '', encoding='utf-8') as file:
                wr = csv.writer(file)
                wr.writerow(counts)
                #file.close()
            for tweet in tweets.find(near):
                matches = []
                matches.append(str(d))
                matches.append(crime['case_number'])
                matches.append(tweet['properties']['userName'])
                matches.append(tweet['geometry']['coordinates'][1])
                matches.append(tweet['geometry']['coordinates'][0])
                matches.append(tweet['properties']['text'])
                with open(output2, 'a', newline='', encoding='utf-8') as file:
                    wr = csv.writer(file)
                    wr.writerow(matches)
                    # file.close()
                print(matches)
        else:
            with open(output3,'a',newline = '', encoding='utf-8') as file:
                wr = csv.writer(file)
                wr.writerow(counts)

    d = d + 50