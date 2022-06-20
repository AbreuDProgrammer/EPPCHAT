// Require de todas as bibliotecas utilizadas
var net = require('net');
const CONFIG = require('./anexo/config');
var Users = require('./User');

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
                // Executa a funcionalidade
                var msgServer = Clients[func](con, args);
            else
                // Caso a funcionalidade não exista
                Clients.systemAnswer("Command does not exists ", con.nome);

            // Verifica se a funcionalidade responde com alguma mensagem para o servidor
            if(typeof msgServer === 'string')
                Clients.historic(msgServer);

        }
        // Se não for uma funcionalidade é uma mensagem comum
        else if(comando.type === 'message')
        {
            Clients.historic(con.nome+" wrote "+comando.args.message);
            var send = {
                sender: con,
                message: con.nome+': '+comando.args.message
            }
            Clients.broadcast(send);
        }
    });

    // Mensagem para quando o user terminar a sessão
    con.on('end', function(){
        var send = {
            sender: con,
            message: con.nome+" just left"
        }
        Clients.broadcast(send);
        Clients.historic(con.nome+" just left");

        // Retirar user do objeto
        Clients.detachUser(con);
    });

    // Mensagens de erros
    con.on('error', e => Clients.historic(e.toString()));

});

// Configs do servidor
server.listen({
    port: CONFIG.PORT,
    readableAll: true,
    writableAll: true
});