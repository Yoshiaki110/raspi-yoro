/*
フォーマット
１バイト目　0xFF（デリミタ）
２バイト目　id（送信者ID）
３バイト目　値(0-180)
　　　　　　キープアライブ(200)
*/
var net = require('net');
var HOST = 'localhost';
var PORT = 12345;
var ID = process.argv[2] || 1;
var RID = process.argv[3] || 2;
console.log('myID: ' + ID + ' recvID: ' + RID);
var MODE = process.argv[4] || 's';

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
    d = new Date() - watchdog;
    console.log('watchdog:' + d);
    if (d > 5000) {
        process.exit(1)
    }

    if (null == global.sock) {
        connect();
    }
    d = new Buffer(3);
    d[0] = 255;
    d[1] = ID;
    d[2] = 200;
    console.log('send keepalive:' + 200);
    global.sock.write(d);
    setTimeout(keepalive, 2000);
}

function senddata() {
    if (null == global.sock) {
        connect();
    }
    //var rand = Math.floor( Math.random() * 180 )
    var rand = Math.floor( Math.random() * 256 );
    //d = String.fromCharCode(rand);      // 1バイトの文字列（コード）にする
    d = new Buffer(3);
    d[0] = 255;
    d[1] = ID;
    d[2] = rand;
    //console.log('send:' + d);
    console.log('send:' + rand);
    global.sock.write(d);
    setTimeout(senddata, 1000);
}

connect();

if (MODE != 'r') {    // 受信テストでないなら送信する
    global.watchdog = new Date();
    setTimeout(keepalive, 2000);
    setTimeout(senddata, 1000);
}
