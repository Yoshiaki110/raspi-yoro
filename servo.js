'use strict';

var config = require('./config.js');
console.log('bid : ' + config.BottleId);
var EventHubClient = require('azure-event-hubs').Client;
var fs = require("fs");
console.log("servo.pyの接続待ち");
var fd = fs.openSync("fifo", "w");
console.log("servo.pyと接続しました");

var g_lastpos = -180;      // 以前の位置

function setAngle(data) {
  if (config.Reverse != undefined) {
    if (config.Reverse) {
      data = Math.abs(data - 180);
    }
  }
  if (g_lastpos == data) {
    return;
  }
  console.log(data);
  try {
    fs.writeSync(fd, data + "\n");
  } catch (e) {
    console.log(e);
  }
  g_lastpos = data;
}

var client = EventHubClient.fromConnectionString(config.ConnectString);

var printMessage = function (message) {
//  console.log('Message received: ');
//  console.log(JSON.stringify(message.body));
  var str = message.body.pos;
  var bid = message.body.bid;
  console.log(bid + ' - ' + config.BottleId + ' ' + str);
  if (bid == config.BottleId) {
    setAngle(parseInt(str));
  }
};

function connect() {
  console.log('connect');
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
}

var printError = function (err) {
  console.log('Azure Error');
  console.log(err.message);

//  client.close();
  var client = EventHubClient.fromConnectionString(config.ConnectString);
  setTimeout(connect, 1000);
};


connect();
/*
function loop() {
  setAngle();
  setTimeout(loop, 20);
}
setTimeout(loop, 10);
*/
/*
function test() {
//  client.close();
  console.log('aaaa');
  var client = EventHubClient.fromConnectionString(config.ConnectString);
  connect();
}
setTimeout(test, 10000);
*/
