'use strict';

var common = require('./common.js');
var config = require('./config.js');
//common.LineMsg(config.BottleId + ' ble.js開始しました');

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


/*
フォーマット
0xFF, id, val(0-180)
*/
var net = require('net');
global.sock = null;

function connect() {
    global.sock = new net.Socket();
    global.sock.setNoDelay();
    global.sock.connect(config.PORT, config.HOST, function() {
        console.log('CONNECTED TO: ' + config.HOST + ':' + config.PORT);
    });

    global.sock.on('connect', function() {
        console.log('EVENT connect');
    });

    global.sock.on('data', function(data) {
        if (data.length >= 3) {    // ３バイト以上のデータのみ使用
            var p = -1;
            for (var i = data.length - 2; i--; ) {
//                console.log(data[i]);
                if (data[i] == 255) {
                    p = i;
                }
            }
            if (p >= 0) {                      // 正しいデータあり
                if (data[p+1] == config.myID) {         // 自分宛てのデータ
                    console.log('* receive id:' + data[p+1] + ' val:' + data[p+2] + ' len:' + data.length);
                    d = new Buffer(3);         // エコーバック送信
                    d[0] = 255;
                    d[1] = data[p+1];
                    d[2] = data[p+2];
                    global.sock.write(d);
                } else if (data[p+1] == config.distID) { // エコーバック受信
                    console.log('e receive id:' + data[p+1] + ' val:' + data[p+2] + ' len:' + data.length);
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
connect();


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
          common.LineMsg('ble.js IoTHubと接続できない');
          setServo("202\n");         // LED OFF
          setTimeout(process.exit, 10000, 1);
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
          common.LineMsg('ble.js IoTHubへの送信エラー');
          setServo("202\n");         // LED OFF
          setTimeout(process.exit, 10000, 1);
        } else {
          console.log('IoTHubへの送信完了');
        }
      });
//      sended = val;
//    }
  }

  return IoTDevice;
})();

//var device = new IoTDevice(config.HostName, config.DeviceId, config.SharedAccessKey);
var device;

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
              setServo("200\n");         // LED 点滅
              var d = new Buffer(3);
              d[0] = 255;
              d[1] = config.distID;
              d[2] = val;
              if (null == global.sock) {
                connect();
              }
              global.sock.write(d);
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
//setupSensor();

function loop() {        // keep alive
  device.send('dummy', 0);
  setTimeout(loop, 10000);    // hontouha3分ni sitaikedo kidouji-no error wo sugu kenti shitaitame
}
//setTimeout(loop, 1000);

function prepare() {
  if (common.IpAddress().length == 0) {
    setTimeout(prepare, 1000);
  } else {
    device = new IoTDevice(config.HostName, config.DeviceId, config.SharedAccessKey);
    setupSensor();
    loop();
    common.LineMsg(config.BottleId + ' ble.js開始しました');
  }
}

prepare();

