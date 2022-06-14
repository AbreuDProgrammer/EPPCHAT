var net = require('net');
var myCon = require('./anexo/console');
var config = require('./anexo/config.json');
var Users = require('./functions');
var Clients = new Users();

var server = net.createServer(function(con){
    Clients.attachUser(con);
    con.on('data', function(msg){
        var comando = msg.toString().trim();
        if(comando[0] === "/")
        {
            var cmdArray = comando.split(" ");
            var func = cmdArray[0].slice(1);
            if(typeof Clients[func] === 'function')
                var msgServer = Clients[func](con, comando);
            if(typeof msgServer === 'string')
                myCon.log(msgServer);
        }
        else
        {
            myCon.log(con.nome+" wrote "+comando);
            Clients.broadcast(con.nome+': '+msg,con);
        }
    });
    con.on('end', function(){
        Clients.broadcast(con.nome+' saiu ', con);
        Clients.detachUser(con);
    });
    con.on('error', e => myCon.log("eror: "+e.toString()));
});
server.listen({
    port: config.port,
    readableAll: true,
    writableAll: true
});