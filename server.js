var net = require('net');
var myCon = require('./console');
var config = require('./config.json');
var comandos = require('./comandos.json');
var Users = require('./functions').Users;

var listaComandos = comandos.comands;
var Clients = new Users();
var server = net.createServer(function(con){
    Clients.attachUser(con);
    con.on('data', function(msg){
        var comando = msg.toString().trim();
        if(comando[0] === "/")
        {
            var cmdArray = comando.split(" ");
            var func = cmdArray[0].slice(1);
            listaComandos.forEach(function(e){
                var comand = e.comand.slice(1).split(' ');
                var nome = comand[0];
                if(func == nome)
                {
                    var msg = Clients[func](con, comando);
                    if(msg)
                        Clients.broadcast(msg);
                }
            });
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
    con.on('error', e => myCon.log(e.toString()));
});
server.listen({
    port: config.port,
    readableAll: true,
    writableAll: true
});