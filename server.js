// Require de todas as bibliotecas utilizadas
var net = require('net');
const CONFIG = require('./anexo/config');
var Users = require('./User');

// Cria o objeto com as funcionalidades do usuário
var Clients = new Users();

// Notificação que o servidor está ativo
Clients.historic('Server online!');

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
            // Caso a funcionalidade não exista
            else
            {
                var msg = {
                    type: 'notification',
                    message: "Command does not exists ",
                    recipient: con
                }
                Clients.private(msg);
            }

            // Verifica se a funcionalidade responde com alguma mensagem para o servidor
            if(typeof msgServer === 'string')
                Clients.historic(msgServer);

        }
        // Se não for uma funcionalidade é uma mensagem comum
        else if(comando.type === 'message')
        {
            Clients.historic(con.name+" wrote "+comando.args.message);
            var send = {
                type: 'message',
                sender: con,
                message: comando.args.message
            }
            Clients.broadcast(send);
        }
    });

    // Mensagem para quando o user terminar a sessão
    con.on('end', function(){
        var send = {
            type: 'notification',
            sender: con,
            message: con.name+" just left"
        }
        Clients.broadcast(send);
        Clients.historic(con.name+" just left");

        // Retirar user do objeto
        Clients.detachUser(con);
    });

    // Mensagens de erros
    con.on('error', e => {
        Clients.historic(e.toString())
    });

});

// Configs do servidor
server.listen({
    port: CONFIG.PORT,
    readableAll: true,
    writableAll: true
});