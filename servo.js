'use strict';

var config = require('./config.js');
console.log('bid : ' + config.BottleId);
var EventHubClient = require('azure-event-hubs').Client;
var fs = require("fs");
//var fd = fs.openSync("fifo", "w");

var g_curpos = 180;      // 現在の位置
var g_distpos = 180;     // 目標の位置
var g_emergency = 0;     // 緊急モード


function write(data) {
  console.log(data);
//  fs.writeSync(fd, data + "\n");
}

function setAngle() {
  if (g_curpos == g_distpos) {
    return;
  } else if (g_curpos > g_distpos) {
    g_curpos -= 1;
  } else if (g_curpos < g_distpos) {
    g_curpos += 1;
  }
  write(g_curpos);
}


var printError = function (err) {
  console.log(err.message);
};

var printMessage = function (message) {
  console.log('Message received: ');
//  console.log(JSON.stringify(message.body));
  var str = message.body.pos;
  var bid = message.body.bid;
  console.log(bid + ' - ' + config.BottleId);
  if (bid == config.BottleId) {
    write(parseInt(str));
  }
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


/*
var fs = require("fs");
var fd = fs.openSync("fifo", "w");

function loop(){
  setAngle();
  setTimeout(loop, 50);
}
setTimeout(loop,10);
*/
