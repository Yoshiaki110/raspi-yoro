const os = require('os');
var config = require('./config.js');
const request = require('request');

exports.IpAddress = function() {
    ipv4 = [];
    var interfaces = os.networkInterfaces();

    for (var dev in interfaces) {
        interfaces[dev].forEach(function(details){
            if (!details.internal) {
                if (details.family === "IPv4") {
                    ipv4.push({name:dev, address:details.address});
                }
            }
        });
    }
    return ipv4;
};

exports.LineMsg = function(msg) {
    var headers = {
        'Content-Type': 'application/json'
    }
    var body = {
        'msg': config.BottleId + ' ' + msg + '\n' + JSON.stringify(exports.IpAddress())
    }
    var url = 'http://yoro.azurewebsites.net/line';
    request({
        url: url,
        method: 'POST',
        headers: headers,
        body: body,
        json: true
    });
}

