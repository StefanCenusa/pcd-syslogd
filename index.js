const Syslogd = require('syslogd');
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./db/sample.db');

let logs = [];
function addToSql(obj){
    let toAdd = {
        delay: parseInt((obj.server04.time - obj.server01.time)*1000),
        rtt12: parseInt((obj.server02.time - obj.server01.time)*1000),
        rtt23: parseInt((obj.server03.time - obj.server02.time)*1000),
        rtt34: parseInt((obj.server04.time - obj.server03.time)*1000),
        source: (obj.server01.remote),
        dest: (obj.server04.server)
    };
    console.log(JSON.stringify(toAdd,null,4));

    db.run('INSERT INTO hw4 VALUES(?, ?, ?, ?, ?, ?)', [toAdd.delay, toAdd.rtt12, toAdd.rtt23, toAdd.rtt34, toAdd.source, toAdd.dest]);
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
      
    db.run("CREATE TABLE IF NOT EXISTS hw4 (delay INTEGER, rtt12 INTEGER, rtt23 INTEGER, rtt34 INTEGER, source TEXT, dest TEXT)");

    console.log('start')
})