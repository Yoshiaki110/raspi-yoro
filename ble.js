'use strict';

var config = require('./config.js');

var clientFromConnectionString = require('azure-iot-device-mqtt').clientFromConnectionString;
//var clientFromConnectionString = require('azure-iot-device-http').clientFromConnectionString;
var Message = require('azure-iot-device').Message;

var IoTDevice = (function() {
  // コンストラクタ
  var IoTDevice = function(hostName, deviceId, accessKey) {
      if(!(this instanceof IoTDevice)) {
          return new IoTDevice(hostName, deviceId, accessKey);
      }
      this.hostName = hostName;
      this.deviceId = deviceId;
      this.accessKey = accessKey;
      var connectionString = 'HostName=' + hostName + ';DeviceId=' + deviceId + ';SharedAccessKey=' + accessKey;
      this.client = clientFromConnectionString(connectionString);
      this.client.open(function (err) {
        if (err) {
          console.log('Could not connect: ' + err);
        } else {
          console.log('Client connected');
        }
      });
  }

  var p = IoTDevice.prototype;

  // プロトタイプ内でメソッドを定義
  p.send = function(val) {
    var data = JSON.stringify({ deviceId: this.deviceId, lux: val });
    var message = new Message(data);
    console.log("Sending message: " + message.getData());
    this.client.sendEvent(message, function (err) {
      if (err) {
          console.log('send error: ' + err);
      } else {
        console.log('send success');
      }
    });
  }

  return IoTDevice;
})();

var device = new IoTDevice(config.HostName, config.DeviceId, config.SharedAccessKey);

/*
* $ npm install sandeepmistry/node-sensortag ## (require `libbluetooth-dev`)
* $ TI_UUID=your_ti_sensor_tag_UUID node this_file.js
*/
var myAddress = process.env["TI_ADDRESS"] || "24:71:89:E8:B4:86";

function ti_accelerometer(conned_obj) {
  var period = 1000; // ms
  conned_obj.enableAccelerometer(function() {
    conned_obj.setAccelerometerPeriod(period, function() {
      conned_obj.notifyAccelerometer(function() {
        console.info("ready: notifyAccelerometer");
        console.info("notify period = " + period + "ms");
        conned_obj.on('accelerometerChange', function(x, y, z) {
            console.log('\taccel_x = %d G', x.toFixed(1));
            console.log('\taccel_y = %d G', y.toFixed(1));
            console.log('\taccel_z = %d G', z.toFixed(1));
            var pos = parseInt((z + 1) * 90);
            if (pos > 180) { pos = 180; }
            if (pos < 0) { pos = 0; }
            device.send(parseInt(pos));
        });
      });
    });
  });
}
 
var SensorTag = require('sensortag');
console.info(">> STOP: Ctrl+C or SensorTag power off");
console.info("start");
function setupSensor() {
  console.info("waiting for connect");
  SensorTag.discover(function(sensorTag) {
    console.log("<><><> id:", sensorTag.id);
    console.info("found: connect and setup ... (waiting 5~10 seconds)");
    sensorTag.connectAndSetup(function() {
      sensorTag.readDeviceName(function(error, deviceName) {
        console.info("connect: " + deviceName);
        ti_accelerometer(sensorTag);
      });
    });
    /* In case of SensorTag PowerOff or out of range when fired `onDisconnect` */
    sensorTag.on("disconnect", function() {
      console.log("<><><> id:", sensorTag.id);
      console.info("disconnect and exit");
      process.exit(0);
    });
  });
}
setupSensor();

