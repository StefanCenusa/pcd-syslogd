const Syslogd = require('syslogd');

Syslogd(info => {
    /*
    info = {
          facility: 7
        , severity: 22
        , tag: 'tag'
        , time: Mon Dec 15 2014 10:58:44 GMT-0800 (PST)
        , hostname: 'hostname'
        , address: '127.0.0.1'
        , family: 'IPv4'
        , port: null
        , size: 39
        , msg: 'info'
    }
    */

    const {tag, msg} = info;

    if (tag.startsWith('server')) {
        const items = msg.split(' ');
        const [time, remote, server] = items;

    	console.log('sending to sql');
    	console.log(tag, time, remote, server);
    }

}).listen(514, err => {
    if (err) {
        console.error(err);
        return;
    }

    console.log('start')
})