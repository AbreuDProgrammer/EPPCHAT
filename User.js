class Users
{
    cons = []; // Lista de usuários
    userCounter = 1; // Contador de usuários para novos

    // Mostra a mensagem a todos do chat
    broadcast(args)
    {
        // Recebe a hora e insere na mensagem
        var date = new Date;
        var hours = date.getHours();
        var min = date.getMinutes();

        // Envia a mensagem a todos menos o remetente
        this.cons.forEach(function(con){
            if(con === args.sender)
                return;
            con.write(hours+":"+min+' '+args.message);
        });
    }

    // Envia a mensagem privada
    private(args)
    {
        this.cons.forEach(con => {
            if(con.nome == args.recipient){
                con.write(args.sender+" wrote just for you: "+args.message);
                return;
            }
        });
    }

    // Resposta do servidor para um usuário
    systemAnswer(args)
    {
        this.cons.forEach(con => {
            if(con.nome == args.recipient){
                con.write(args.message);
            }
        });
    }

    // Guarda o histórico no servidor
    historic(msg)
    {
        console.log(msg);
    }

    // Verifica se o nome está em uso
    verNomeRep(nome)
    {
        var repete = false;
        this.cons.forEach(function(con){
            if(nome == con.nome){
                repete = true;
            }
        });
        return repete;
    }

    // Adiciona o user a lista
    attachUser(con)
    {
        con.nome = "unknown"+this.userCounter++;
        this.cons.push(con);
    }

    // Retira o user da lista
    detachUser(con)
    {
        this.cons.splice(this.cons.indexOf(con), 1);
    }

    // Prepara o comando separando em partes para o array
    prepararComando(comando)
    {
        // Verifica se é um comando
        if(comando[0] === '/'){

            // Separa o comando em partes de um array
            var cmd = comando.split(' ');

            // Retira a ação e define os argumentos do comando
            var args = cmd.splice(1);

            // Define a ação do comando sem a /
            var act = cmd[0].slice(1);

            // Define um obj com um array com a ação e os argumentos
            var answer = {
                type: 'function',
                args: {
                    act: act,
                    args: args
                }
            }
        }
        // Caso não for um comando
        else{
            // Define um obj com um array com a ação e os argumentos para caso não for um comando
            var answer = {
                type: 'message',
                args: {
                    message: comando
                }
            }
        }

        // Retorna a resposta da mensagem ou da funcionalidade
        return answer;
    }

    // Funcionalidade para altrar o nome
    name(con, args)
    {
        // Define o nome sem sobrenomes
        var nome = args[0];

        // Verifica se o nome já está em uso
        var rep = this.verNomeRep(nome);

        // Caso não esteja em uso
        if(rep === false) {

            // prepara a mensagem para o chat e troca o nome
            var msg = con.nome+" changed his name to "+nome;
            con.nome = nome;
            var send = {
                sender: con,
                message: msg
            }
            this.broadcast(send);

            // E envia a mensagem para o servidor
            return msg;
        }
        // Caso esteja em uso
        else{
            // Prepara e envia a mensagem direta para o usuário que tentou mudar de nome
            var SysArray = {
                message: 'This name is in use',
                recipient: con.nome
            }
            this.systemAnswer(SysArray);
        }

        // Não retorna comentario para o servidor se o nome não for trocado
        return;
    }

    // Funcionalidade para altrar a descrição
    desc(con, args)
    {
        // Junta o array em uma string novamente
        var desc = args.join(' ');

        // Troca a descrição e mostra ao chat que trocou
        var msg = con.nome+" changed his description";
        con.desc = desc;
        var send = {
            sender: con,
            message: msg
        }
        this.broadcast(send);

        // Retorna a mensagem para o servidor
        return msg;
    }

    // Funcionalidade para ver a descrição de um user
    seeDesc(con, args)
    {
        // Define o destinatario
        var user = args[0];
        var reci = con.nome;

        // Objeto para envio da descrição
        var sysArray = null;

        // Procura entre os usuários pela descrição
        this.cons.forEach(function(con){
            if(con.nome == user){

                // Salva a descrição do user
                var desc = user+"`s description is: "+con.desc;
                sysArray = {
                    message: desc,
                    recipient: reci
                }

                // Retorna se achar
                return;
            }
        });

        // Descrição não encontrada
        if(sysArray === null){

            // Prepara o objeto do systemAnswer
            sysArray = {
                message: 'User not found',
                recipient: reci
            }

            // Mostra a mensagem de user não encontrado
            this.systemAnswer(sysArray);

            // Termina a ação sem mostrar ao histórico
            return;
        }
        // Descrição encontrada
        else{

            // Mostra a descrição do user
            this.systemAnswer(sysArray);

            // Prepara e envia a mensagem para o servidor
            var msg = reci+' saw '+user+' descriptions';
            return msg;
        }
    }

    // Funcionalidade para enviar uma mensagem privada
    msgTo(con, args)
    {
        // Separa a mensagem do user destinatário
        var message = args.splice(1).join(' ');

        // Define o user destinatário
        var userReci = args[0];

        // Prepara o objeto para o envio
        var privateArray = {
            message: message,
            sender: con.nome,
            recipient: userReci
        }

        // Envia o objeto com a mensagem o destino e o remetente
        this.private(privateArray);

        // Retorna com a mensagem para o servidor
        var msg = con.nome+" sent a private message to "+userReci+" saying: "+message;
        return msg;
    }

    // Funcionalidade para ver a lista de users online no chat
    online(con)
    {
        // Mensagem de preparação para a lista
        var online = "Users online: \n";

        // Percorre os users contidos na classe e adiciona na string
        this.cons.forEach(element => {
            online += element.nome+"\n";
        });

        // Prepara o objeto
        var SysArray = {
            message: online,
            recipient: con.nome
        }

        // Envia a mensagem pelo sistema
        this.systemAnswer(SysArray);

        // Retorna para o servidor
        return con.nome+" saw the list of users online.";
    }
}
module.exports = Users;