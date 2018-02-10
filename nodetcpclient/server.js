/*
フォーマット
0xFF, id, val(0-180)
*/
var net = require('net');
var HOST = 'localhost';
var PORT = 12345;

global.socks = new Array();     // 接続しているソケット

function write(sock, data) {
    for (var i = global.socks.length; i--; ) {
        //if (global.socks[i] != sock) {     // 自分以外に送信、エコーバックは受信したクライアントが行う
            global.socks[i].write(data);
        //}
    }
}

function errorsock(sock) {
    console.log
    for (var i = global.socks.length; i--; ) {
        if (global.socks[i] === sock) {  // 該当のソケットを削除
            global.socks.splice(i, 1);
        }
    }
}

server = net.createServer(function(sock) {
    console.log('CONNECTED: ' + sock.remoteAddress +':'+ sock.remotePort);
    global.socks.push(sock)

    sock.on('connect', function() {
        console.log('EVENT connect');
    });

    sock.on('data', function(data) {             // １バイトづつ来るとは限らない
        if (data.length >= 3) {    // ３バイト以上のデータのみ使用
            var p = -1;
            for (var i = data.length - 2; i--; ) {
//                console.log(data[i]);
                if (data[i] == 255) {
                    p = i;
                }
            }
            if (p >= 0) {         // 正しいデータあり
                console.log('id:' + data[p+1] + ' val:' + data[p+2] + ' len:' + data.length);
                d = new Buffer(3);
                d[0] = 255;
                d[1] = data[p+1];
                d[2] = data[p+2];
                if (data[p+2] == 200) {    // キープアライブなら送信側のみに返答
                    sock.write(d);
                } else {                   // そうでない場合みんなに送信
                    write(sock, d);
                }
            } else {
                console.log('not found separater. data len:' + data.length);
            }
        } else {
            console.log('illegal data len:' + data.length);
        }
    });

    sock.on('end', function() {
        console.log('EVENT end');
    });

    sock.on('timeout', function() {
        console.log('EVENT timeout');
    });

    sock.on('drain', function() {
        console.log('EVENT drain');
    });

    sock.on('error', function(error) {
        console.log('EVENT error:' + error);
        errorsock(sock);
    });

    sock.on('close', function(had_error) {
        console.log('EVENT close:' + had_error);
    });
})
server.listen(PORT, HOST);
console.log('Server listening on ' + HOST +':'+ PORT);

