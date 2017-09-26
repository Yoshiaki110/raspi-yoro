'use strict';

var common = require('./common.js');
var config = require('./config.js');
//common.LineMsg('ble.js開始しました');

var fs = require("fs");
console.log("servo.pyの接続待ち");
var fd = fs.openSync("fifo", "w");
console.log("servo.pyと接続しました");

function setServo(data) {
  try {
    fs.writeSync(fd, data);
  } catch (e) {
    console.log(e);
  }
}
setServo("202\n");         // LED OFF

console.log("javaの接続待ち");
var fdj = fs.openSync("sfifo", "w");
console.log("javaと接続しました");

function send(data) {
  try {
    fs.writeSync(fdj, data + '\n');
  } catch (e) {
    console.log(e);
  }
}

var SensorTag = require('sensortag');

var sended = -1000;
//var device;

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
    setupSensor();
    common.LineMsg('ble.js開始しました');
  }
}

prepare();

