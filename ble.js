'use strict';

var common = require('./common.js');
var config = require('./config.js');

var fs = require("fs");
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



var SensorTag = require('sensortag');

var sended = -1000;

/*
* $ npm install sandeepmistry/node-sensortag ## (require `libbluetooth-dev`)
* $ TI_UUID=your_ti_sensor_tag_UUID node this_file.js
*/

function ti_accelerometer(conned_obj) {
  var period = 300; // ms
  conned_obj.enableAccelerometer(function() {
    conned_obj.setAccelerometerPeriod(period, function() {
      conned_obj.notifyAccelerometer(function() {
        console.info("加速度センサの取得間隔: " + period + "ms");
        conned_obj.on('accelerometerChange', function(x, y, z) {
            //console.log('\taccel_x = %d G', x.toFixed(1));
            //console.log('\taccel_y = %d G', y.toFixed(1));
            //console.log('\taccel_z = %d G', z.toFixed(1));
//            var pos = parseInt((z + 1) * 90);
            var pos = parseInt((z - 1) * (-90));
            if (pos > 180) { pos = 180; }
            if (pos < 0) { pos = 0; }
            var val = parseInt(pos);
            if (Math.abs(sended - val) > 1) {        // ほぼ同じ値は送信しない
              send(val);
              setServo("200\n");         // LED 点滅
              sended = val;
            }
        });
      });
    });
  });
}

function setupSensor() {
  console.info("CC2650を探しています");
  SensorTag.discover(function(sensorTag) {
    console.info("CC2650を発見 id:", sensorTag.id);
    sensorTag.connectAndSetup(function() {
      sensorTag.readDeviceName(function(error, deviceName) {
        console.info("CC2650と接続しました: " + deviceName);
        setServo("201\n");         // LED ON
        ti_accelerometer(sensorTag);
      });
    });
    /* In case of SensorTag PowerOff or out of range when fired `onDisconnect` */
    sensorTag.on("disconnect", function() {
      console.info("CC2650との接続解除 id:", sensorTag.id);
      setServo("202\n");         // LED OFF
      //process.exit(1);
      setupSensor();
    });
  });
}

function prepare() {
  if (common.IpAddress().length == 0) {
    setTimeout(prepare, 1000);
  } else {
    connect();
    keepalive();
    setupSensor();
    common.LineMsg('ble.js開始しました');
  }
}

prepare();

