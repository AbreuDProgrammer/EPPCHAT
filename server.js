// Require de todas as bibliotecas utilizadas
var net = require('net');
var myCon = require('./anexo/console');
var config = require('./anexo/config');
var Users = require('./functions');

// Cria o objeto com as funcionalidades do usuário
var Clients = new Users();

// Cria a ligação com o servidor
var server = net.createServer(function(con){

    // adiciona o usuário ao objeto
    Clients.attachUser(con);

    con.on('data', function(msg){
        
        // Prepara a mensagem
        var message = msg.toString().trim();

        // Formata a mensagem
        var comando = Clients.prepararComando(message);

        // Verifica se a mensagem é uma funcionalidade
        if(comando.type === 'function')
        {
            // Separa a funcionalidade e os argumentos
            var func = comando.args['act'];
            var args = comando.args['args'];

            // Verifica se a funcionalidade existe
            if(typeof Clients[func] === 'function')
                var msgServer = Clients[func](con, args);
            else
                Clients.systemAnswer("Command does not exists ", con.nome);

            // Verifica se a funcionalidade responde com alguma mensagem para o servidor
            if(typeof msgServer === 'string')
                myCon.log(msgServer);

        }
        // Se não for uma funcionalidade é uma mensagem comum
        else if(comando.type === 'message')
        {
            myCon.log(con.nome+" wrote "+comando.message);
            Clients.broadcast(con.nome+': '+comando.message, con);
        }
    });

    // Mensagem para quando o user terminar a sessão
    con.on('end', function(){
        Clients.broadcast(con.nome+' just left', con);
        myCon.log(con.nome+' just left');

        // Retirar user do objeto
        Clients.detachUser(con);
    });

    // Mensagens de erros
    con.on('error', e => myCon.log(e.toString()));

});

// Configs do servidor
server.listen({
    port: config.PORT,
    readableAll: true,
    writableAll: true
});