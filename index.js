const Syslogd = require('syslogd');

let logs = [];
function addToSql(obj){
    let toAdd = {
        delay: (obj.server04.time - obj.server01.time)*1000,
        rtt12: (obj.server02.time - obj.server01.time)*1000,
        rtt23: (obj.server03.time - obj.server02.time)*1000,
        rtt34: (obj.server04.time - obj.server03.time)*1000,
        source: (obj.server01.remote),
        dest: (obj.server04.server)
    };
    console.log(JSON.stringify(toAdd,null,4));
}

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

    let servers = ['server01','server02','server03','server04'];
    if (servers.indexOf(tag)!==-1) {
        const items = msg.split(' ');
        const [time, remote, server] = items;
        let  i =0;

        while(true){
            if(i<logs.length){
                if(logs[i].hasOwnProperty(tag)){
                    i++;
                    continue;
                } else {
                  logs[i][tag] = {
                      time:time,
                      remote:remote,
                      server:server
                  };
                  break;
                }

            }    else {
                let obj = {};
                obj[tag] = {
                    time:time,
                    remote:remote,
                    server:server
                };
                logs.push(obj);
                break;
            }
        }

        if(Object.keys(logs[0]).length === 4){
            let to_add = logs.shift();
            console.log('sending to sql');
            addToSql(to_add);
        }

    	console.log(tag, time, remote, server);
    }

}).listen(514, err => {
    if (err) {
        console.error(err);
        return;
    }

    console.log('start')
})