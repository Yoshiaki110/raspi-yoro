const os = require('os');
const request = require('request');

ipAddressStr = function() {
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
    return JSON.stringify(ipv4);
};

exports.LineMsg = function(msg) {
    var headers = {
        'Content-Type': 'application/json'
    }
    var body = {
        'msg': msg + '\n' + ipAddressStr()
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

