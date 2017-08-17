'use strict';

var config = require('./config.js');
var SensorTag = require('sensortag');

var clientFromConnectionString = require('azure-iot-device-mqtt').clientFromConnectionString;
//var clientFromConnectionString = require('azure-iot-device-http').clientFromConnectionString;
var Message = require('azure-iot-device').Message;

var sended = -1000;

var IoTDevice = (function() {
  // コンストラクタ
  var IoTDevice = function(hostName, deviceId, accessKey) {
      if (!(this instanceof IoTDevice)) {
          return new IoTDevice(hostName, deviceId, accessKey);
      }
      this.hostName = hostName;
      this.deviceId = deviceId;
      this.accessKey = accessKey;
      var connectionString = 'HostName=' + hostName + ';DeviceId=' + deviceId + ';SharedAccessKey=' + accessKey;
      this.client = clientFromConnectionString(connectionString);
      this.client.open(function (err) {
        if (err) {
          console.log('IoTHubと接続できない: ' + err);
        } else {
          console.log('IoTHubと接続完了');
        }
      });
  }

  var p = IoTDevice.prototype;

  // プロトタイプ内でメソッドを定義
  p.send = function(id, val) {
   //if (Math.abs(sended - val) > 1) {        // ほぼ同じ値は送信しない
      var data = JSON.stringify({ deviceId: this.deviceId, bid: id, pos: val });
      var message = new Message(data);
      console.log("IoTHubへ送信: " + message.getData());
      this.client.sendEvent(message, function (err) {
        if (err) {
          console.log('IoTHubへの送信エラー: ' + err);
          // うまく動くかわからないが、Azureがエラーを返した場合の処理
          device = new IoTDevice(config.HostName, config.DeviceId, config.SharedAccessKey);
        } else {
          console.log('IoTHubへの送信完了');
        }
      });
//      sended = val;
//    }
  }

  return IoTDevice;
})();

var device = new IoTDevice(config.HostName, config.DeviceId, config.SharedAccessKey);

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
              device.send(config.BottleId, val);
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
        ti_accelerometer(sensorTag);
      });
    });
    /* In case of SensorTag PowerOff or out of range when fired `onDisconnect` */
    sensorTag.on("disconnect", function() {
      console.info("CC2650との接続解除 id:", sensorTag.id);
      //process.exit(0);
      // todo 再接続
      setupSensor();
    });
  });
}
setupSensor();

function loop() {        // keep alive
  device.send('dummy', 0);
  setTimeout(loop, 3 * 60000);    // 3分
}
setTimeout(loop, 1000);
