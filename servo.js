'use strict';

var config = require('./config.js');

var g_angle = 0;
var g_dir = 1;

function write(data) {
  console.log(data);
}

function setAngle() {
  console.log();
  g_angle = g_angle + g_dir;
  if ( g_angle <= 0) {
    g_dir = 1;
  } else if (g_angle >= 180) {
    g_dir = -1;
  }
  write(g_angle);
}





var EventHubClient = require('azure-event-hubs').Client;

var printError = function (err) {
  console.log(err.message);
};

var printMessage = function (message) {
  console.log('Message received: ');
//  console.log(JSON.stringify(message.body));
  var str = JSON.stringify(message.body.lux);
  write(parseInt(str));
  //console.log(str);
  //console.log('');
};

var client = EventHubClient.fromConnectionString(config.ConnectString);
client.open()
    .then(client.getPartitionIds.bind(client))
    .then(function (partitionIds) {
        return partitionIds.map(function (partitionId) {
            return client.createReceiver('$Default', partitionId, { 'startAfterTime' : Date.now()}).then(function(receiver) {
                console.log('Created partition receiver: ' + partitionId)
                receiver.on('errorReceived', printError);
                receiver.on('message', printMessage);
            });
        });
    })
    .catch(printError);
