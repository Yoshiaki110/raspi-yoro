'use strict';

var common = require('./common.js');
var config = require('./config.js');

console.log('bid : ' + config.BottleId);
var EventHubClient = require('azure-event-hubs').Client;
var fs = require("fs");
console.log("servo.pyの接続待ち");
var fd = fs.openSync("fifo", "w");
console.log("servo.pyと接続しました");

var g_lastpos = -180;      // 以前の位置
var g_lasttime = 0;

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
  g_lasttime = (new Date()).getTime();
  console.log(g_lasttime + ' ' + bid + ' - ' + config.BottleId + ' ' + str);
  if (bid == config.ReceiveBottleId) {
    setAngle(parseInt(str));
  }
};

function connect() {
  common.LineMsg(config.BottleId +' servo.js開始しました');
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
  common.LineMsg('servo.js Azure Error');
  setTimeout(process.exit, 10000, 1);
};

function loop() {
  var time = (new Date()).getTime();
  var diff = time - g_lasttime;
  console.log(time + ' - ' + g_lasttime + ' = ' + diff);
  if (diff > 20000) {
    console.log('not comming heart beat');
    common.LineMsg('servo.js not comming heart beat');
    setTimeout(process.exit, 10000, 1);
  }
  setTimeout(loop, 10000);
}

function prepare() {
  if (common.IpAddress().length == 0) {
    setTimeout(prepare, 1000);
  } else {
    connect()
    g_lasttime = (new Date()).getTime();
    loop();
  }
}

prepare();

