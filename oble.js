'use strict';

var common = require('./common.js');
var config = require('./config.js');


var fs = require("fs");
function isExistFile(file) {
  try {
    fs.statSync(file);
    console.log('localmode no communication');
    return true;
  } catch(err) {
    console.log('communicate mode');
    return false;
  }
}

var localmode = isExistFile('button_on');

console.log("servo.pyの接続待ち");
var fd = fs.openSync("fifo", "w");
console.log("servo.pyと接続しました");

function setServo(data) {
  try {
    fs.writeSync(fd, data);
//    console.log('@@@@' + data);
  } catch (e) {
    console.log(e);
  }
}
var g_lastpos = -180;      // 以前の位置
var g_lasttime = 0;

function setAngle(data) {
  if (g_lastpos == data) {
    return;
  }
//  console.log(data);
  setServo(data + "\n");
  g_lastpos = data;
}
setServo("301\n");         // LED ON
setServo("202\n");         // LED OFF


var net = require('net');
var HOST = config.HOST;
var PORT = config.SPORT;
var ID = config.ID;
var RID = config.RID;
console.log('myID: ' + ID + ' recvID: ' + RID);

global.sock = null;
global.watchdog = new Date();

function connect() {
    console.log('CONNECT TO: ' + HOST + ':' + PORT);
    global.sock = new net.Socket();
    global.sock.setNoDelay();
    global.sock.connect(PORT, HOST, function() {
        console.log('CONNECTED TO: ' + HOST + ':' + PORT);
    });

    global.sock.on('connect', function() {
        console.log('EVENT connect');
    });

    global.sock.on('data', function(data) {
        setServo("300\n");         // LED 点滅
        global.watchdog = new Date();

        if (data.length >= 3) {    // ３バイト以上のデータのみ使用
            var p = -1;
            for (var i = data.length - 2; i--; ) {
//                console.log(data[i]);
                if (data[i] == 255) {
                    p = i;
                }
            }
            if (p >= 0) {                      // 正しいデータあり
                if (data[p+1] == RID) {        // 自分宛てのデータ
                    console.log('* receive id:' + data[p+1] + ' val:' + data[p+2] + ' len:' + data.length);
                    if (data[p+2] <= 180) {    // 
                        setAngle(data[p+2]);
                    }
                } else {
                    console.log('  receive id:' + data[p+1] + ' val:' + data[p+2] + ' len:' + data.length);
                }
            } else {
                console.log('receive not found separater. data len:' + data.length);
            }
        } else {
            console.log('receive illegal data len:' + data.length);
        }
    });

    global.sock.on('end', function() {
        console.log('EVENT end');
    });

    global.sock.on('timeout', function() {
        console.log('EVENT timeout');
    });

    global.sock.on('drain', function() {
        console.log('EVENT drain');
    });

    global.sock.on('error', function(error) {
        console.log('EVENT error:' + error);
        global.sock.destroy();
        global.sock = null;
    });

    global.sock.on('close', function(had_error) {
        console.log('EVENT close:' + had_error);
        global.sock = null;
    });
}

function keepalive() {
    var dt = new Date() - watchdog;
//    console.log('watchdog:' + dt);
    if (dt > 5000) {
        setServo("302\n");         // LED OFF
        setServo("202\n");         // LED OFF
        setAngle(180);
        process.exit(1)
    }

    if (null == global.sock) {
        connect();
    }
    var d = new Buffer(3);
    d[0] = 255;
    d[1] = ID;
    d[2] = 200;
//    console.log('send keepalive:' + 200);
    global.sock.write(d);
    setTimeout(keepalive, 2000);
}

function send(data) {
    if (null == global.sock) {
        connect();
    }
    //d = String.fromCharCode(rand);      // 1バイトの文字列（コード）にする
    var d = new Buffer(3);
    d[0] = 255;
    d[1] = ID;
    d[2] = data;
    //console.log('send:' + d);
    console.log('send:' + data);
    global.sock.write(d);
}


var noble = require('noble');

const NAME = 'IM';
const ADDRESS = 'e7e6a420bdcf';
const INTERVAL_MILLISEC = 100;

//discovered BLE device
function discovered(peripheral) {
  const device = {
    name: peripheral.advertisement.localName,
    uuid: peripheral.uuid,
    rssi: peripheral.rssi
  };
  if (NAME === device.name && ADDRESS === device.uuid) {
    const v = peripheral.advertisement.manufacturerData.toString('hex').substring(30, 34);
    var s = v.substring(2,4) + v.substring(0,2);
    var d = parseInt(s, 16) * 360 / 65535;
    //  0     90     180
    // 55      0
    //       360     305
//    console.log(d);
    if (d < 55) {
      d = (d * -1 + 55) * 90 / 55;
      console.log('+   ' + parseInt(d));
      send(d);
      setServo("200\n");         // LED 点滅
    } else if (d < 305) {
      ; // nop
    } else if (d <= 360) {
      d = (360 - d) * 90 / 55 + 90;
      console.log('-   ' + parseInt(d));
      send(d);
      setServo("200\n");         // LED 点滅
    }
//    console.log('');
  }
}

//BLE scan start
function scanStart() {
  setInterval(() => { noble.startScanning(); }, INTERVAL_MILLISEC);
  noble.on('discover', discovered);
}

function setupSensor() {
  if (noble.state === 'poweredOn'){
    scanStart();
  } else {
    noble.on('stateChange', scanStart);
  }
}

//setupSensor();

function prepare() {
  if (common.IpAddress().length == 0) {
    setTimeout(prepare, 1000);
  } else {
    if (!localmode) {
      connect();
      keepalive();
    }
    setupSensor();
    common.LineMsg('ble.js開始しました');
  }
}
prepare();

