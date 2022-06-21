// Classe responsável pelos grupos
var Group = require('./Group');

// Configurações
var config = require('./anexo/config');

class Users
{
    groups = [] // Lista de grupos
    cons = []; // Lista de usuários
    userCounter = 1; // Contador de usuários para novos

    // Mostra a mensagem a todos do chat
    broadcast(args)
    {
        // Cria a mensagem
        var msg;

        // Se for uma notificação
        if(args.type === 'notification')
            msg = args.message;
        // Se for uma mensagem comum
        else if(args.type === 'message')
            msg = this.setTime(args.sender.name+': '+args.message);

        // Envia a mensagem a todos menos o remetente
        this.cons.forEach(function(con){
            if(con === args.sender)
                return;
            con.write(msg);
        });

        return;
    }

    // Envia a mensagem privada
    private(args)
    {
        // Prepara a mensagem
        var msg;

        // Envia a mensagem para o usuário dependendo se for do sistema ou mensagem privada
        if(args.type === 'notification')
            msg = args.message;
        else if(args.type === 'private')
            msg = this.setTime(args.sender.name+" wrote just for you: "+args.message);

        args.recipient.write(msg);
    }

    // Insere o horário na mensagem
    setTime(message)
    {
        // Recebe a hora e insere na mensagem
        var date = new Date;
        var hours = date.getHours();
        var min = date.getMinutes();

        // Retorna a mensagem com o horário
        return hours+":"+min+' '+message;
    } 

    // Guarda o histórico no servidor
    historic(msg)
    {
        console.log(msg);
    }

    // Verifica se o nome está em uso
    vernameRep(name)
    {
        for(var value of this.cons){
            if(name == value.name)
                return true;
        }
        return false;
    }

    // Verifica se o user existe
    userExists(user)
    {
        for(var con of this.cons){
            if(con === user)
                return true
        }
        return false;
    }

    // Retorna o user procurando pelo name
    selectUserByName(name)
    {
        for(var user of this.cons){
            if(user.name === name)
                return user;
        }
        return null;
    }

    // Adiciona o user a lista
    attachUser(con)
    {
        con.name = "unknown"+this.userCounter++;
        this.cons.push(con);
        
        // Avisa que alguém entrou no chat
        var msg = {
            type: 'notification',
            message: con.name+' joined',
            sender: con
        }
        this.broadcast(msg);
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

    // Funcionalidade para altrar o name
    name(con, args)
    {
        // Define o nome sem sobrenomes
        var name = args[0];

        // Verifica se o nome já está em uso
        var rep = this.vernameRep(name);

        // Caso não esteja em uso
        if(rep === false) 
        {
            // Prepara a mensagem para o chat e troca o name
            var msg = con.name+" changed his name to "+name;

            // Altera o nome
            con.name = name;

            // Prepara o objeto
            var send = {
                type: 'notification',
                sender: con,
                message: msg
            }
            this.broadcast(send);

            // Avisa que a mudaça foi feita
            var message = {
                type: 'notification',
                message: 'You changed your name',
                recipient: con
            }
            this.private(message);

            // E envia a mensagem para o servidor
            return msg;
        }
        // Caso esteja em uso
        else{
            // Prepara e envia a mensagem direta para o usuário que tentou mudar de name
            var SysArray = {
                type: 'notification',
                message: 'This name is in use',
                recipient: con
            }
            this.private(SysArray);
        }

        // Não retorna comentario para o servidor se o name não for trocado
        return;
    }

    // Funcionalidade para altrar a descrição
    desc(con, args)
    {
        // Junta o array em uma string novamente
        var desc = args.join(' ');

        // Troca a descrição e mostra ao chat que trocou
        var msg = con.name+" changed his description";

        // Altera a descrição
        con.desc = desc;

        // Prepara o objeto
        var send = {
            type: 'notification',
            sender: con,
            message: msg
        }
        this.broadcast(send);

        // Avisa que a mudaça foi feita
        var message = {
            type: 'notification',
            message: 'You changed your description',
            recipient: con
        }
        this.private(message);

        // Retorna a mensagem para o servidor
        return msg;
    }

    // Funcionalidade para ver a descrição de um user
    seeDesc(con, args)
    {
        // Seleciona o nome do destinatario
        var name = args[0];

        // Seleciona o destinatario
        var user = this.selectUserByName(name);

        // Verifica se o user não existe
        if(user === null){
            var message = 'This user name is not on use';
            var msg = {
                type: 'notification',
                message: message,
                recipient: con
            }
            this.private(msg);
            return;
        }

        // Verifica se o user tem descrição
        if(user.desc === null){
            var message = 'This user has no description';
            var msg = {
                type: 'notification',
                message: message,
                recipient: con
            }
            this.private(msg);
        }

        // Seleciona a descrição do user
        var desc = user.name+"`s description is: "+user.desc;

        // Prepara o objeto
        var sysAnswer = {
            type: 'notification',
            message: desc,
            recipient: con
        }

        // Mostra a descrição do user
        this.private(sysAnswer);

        // Prepara e envia a mensagem para o servidor
        var msg = con.name+' saw '+user.name+' descriptions';
        return msg;
    }

    // Funcionalidade para enviar uma mensagem privada
    msgTo(con, args)
    {
        // Separa a mensagem do user destinatário
        var message = args.splice(1).join(' ');

        // Define o user destinatário
        var userReci = args[0];

        // Seleciona o user pelo nome
        var recipient = this.selectUserByName(userReci);

        // Verifica se o user existe
        if(recipient === null){
            var msg = {
                type: 'notification',
                message: 'This user name does not exists',
                recipient: con
            }
            this.private(msg);
            return;
        }

        // Prepara o objeto para o envio
        var privateArray = {
            type: 'private',
            message: message,
            sender: con,
            recipient: recipient
        }

        // Envia o objeto com a mensagem o destino e o remetente
        this.private(privateArray);

        // Retorna com a mensagem para o servidor
        var msg = con.name+" sent a private message to "+userReci+" saying: "+message;
        return msg;
    }

    // Funcionalidade para ver a lista de users online no chat
    online(con, args)
    {
        // Prepara a sigla se for para a visualização de grupo
        var groupIniti = args[0];
        
        // Se o grupo for mensionado
        if(groupIniti !== undefined)
        {
            // Verifica se a sigla tem mais que 5 letras
            if(groupIniti > config.INITIAL_LENGTH){
                var SysArray = {
                    type: 'notification',
                    message: 'That initial have more than 5 letters',
                    recipient: con
                }
                this.private(SysArray);
                return;
            }

            // Seleciona o grupo pela sigla
            var group = this.verifyGroupExists(groupIniti);

            // Se o grupo não existir
            if(group === null){

                // Objeto da mensagem
                var msg = {
                    type: 'notification',
                    message: 'Group does not exists',
                    recipient: con
                }
                this.private(msg);

                // Encerra a funcionalidade
                return;
            }

            // Mensagem da lista de membros
            var online = group.listMembers();

            // Prepara o objeto
            var SysArray = {
                type: 'notification',
                message: online,
                recipient: con
            }

            // Envia a mensagem pelo sistema
            this.private(SysArray);

            return con.name+" saw the list of users online in "+group.name+' '+'['+group.initials+']';
        }

        // Mensagem de preparação para a lista
        var online = "Users online: ";

        // Percorre os users contidos na classe e adiciona na string
        this.cons.forEach(element => {
            online += "\n"+element.name;
        });

        // Prepara o objeto
        var SysArray = {
            type: 'notification',
            message: online,
            recipient: con
        }

        // Envia a mensagem pelo sistema
        this.private(SysArray);

        // Retorna para o servidor
        return con.name+" saw the list of users online";
    }

    // Verifica se o grupo existe (null caso não exista)
    verifyGroupExists(initialsGroup)
    {
        for(var value of this.groups)
        {
            if(value.initials === initialsGroup)
            {
                return value;
            }
        }
        return null;
    }

    // Funcionalidade de criação de grupo
    createGroup(con, args)
    {
        // Define o nome do grupo
        var name = args[0];

        // Define a sigla do grupo
        var initials = args[1];

        // Verifica se a sigle tem mais que 0 letras e menos ou igual a 5
        if(initials.length == 0 || initials.length > config.INITIAL_LENGTH){
            var msg = {
                type: 'notification',
                message: 'The initial must be between 1 and 5 letters',
                recipient: con
            }
            this.private(msg);

            // Encerra a funcionalidade
            return;
        }

        // Verifica se a sigla já não está em uso
        var initialUsing = this.verifyGroupExists(initials);

        // Se estiver em uso retorna
        if(initialUsing !== null){
            var msg = {
                type: 'notification',
                message: 'This initial is on use',
                recipient: con
            }
            this.private(msg);

            // Encerra a funcionalidade
            return;
        }

        // Cria um novo grupo
        var group = new Group(con, name, initials);

        // Avisa à você que o grupo foi criado
        var message = {
            type: 'notification',
            message: 'You created the group '+group.name+' '+'['+group.initials+']',
            recipient: con
        }
        this.private(message);

        // Adiciona o grupo na lista de grupos
        this.groups.push(group);

        // Mostra uma mensagem de criação do grupo para todos
        var message = con.name+' created a new Group: '+name+' '+'['+initials+']';
        var msg = {
            type: 'notification',
            sender: con,
            message: message
        }
        this.broadcast(msg);

        // Retorna para o servidor
        return message;
    }

    // Funcionalidade de envio de mensagem para um grupo
    msg(con, args)
    {
        // Seleciona a mensagem
        var message = args.splice(1).join(' ');

        // Seleciona o grupo
        var initials = args[0];

        // A chave do array de grupos
        var group = this.verifyGroupExists(initials);

        // Se o grupo não existir
        if(group === null){

            // Objeto da mensagem
            var msg = {
                type: 'notification',
                message: 'Group does not exists',
                recipient: con
            }
            this.private(msg);

            // Encerra a funcionalidade
            return;
        }

        // Objeto da mensagem
        var msg = {
            type: 'message',
            message: message,
            sender: con
        }

        // Envia a mensagem
        group.broadcast(msg);

        return con.name+' wrote into the group '+group.name+' '+'['+group.initials+']'+': '+message;
    }

    // Funcionalidade para adicionar participantes ao grupo
    addMember(con, args)
    {
        // Sigla do grupo
        var initial = args[0];

        // Verifica se o grupo existe
        var group = this.verifyGroupExists(initial);

        // Se o grupo não existir
        if(group === null){
            var msg = {
                type: 'notification',
                message: 'Group does not exists',
                recipient: con
            }
            this.private(msg);

            // Encerra a funcionalidade
            return;
        }

        // Verifica se o user não é admin
        if(!group.verifyAdmin(con)){
            var msg = {
                type: 'notification',
                message: 'You are not the admin',
                recipient: con
            }
            this.private(msg);

            // Encerra a funcionalidade
            return;
        }

        // Nome do novo membro
        var name = args[1];

        // Seleciona o user
        var user = this.selectUserByName(name);

        // Se o user não existir
        if(!this.userExists(user))
        {
            var msg = {
                type: 'notification',
                message: 'This user does not exists',
                recipient: con
            }
            this.private(msg);

            // Encerra a funcionalidade
            return;
        }

        // Adiciona o user
        group.attachMember(user);

        // Avisa o usuário que foi adicionado
        var msg = {
            type: 'notification',
            message: user.name+' just had been added to '+group.name+' '+'['+group.initials+']'+' by '+con.name,
            recipient: con
        }
        group.broadcast(msg);

        // Retorna a mensagem para o histórico do server
        return 'The user '+name+' had been add in the group '+group.name;
    }

    removeMember(con, args)
    {
        // Sigla do grupo
        var initial = args[0];

        // Verifica se o grupo existe
        var group = this.verifyGroupExists(initial);

        // Se o grupo não existir
        if(group === null){
            var msg = {
                type: 'notification',
                message: 'Group does not exists',
                recipient: con
            }
            this.private(msg);

            // Encerra a funcionalidade
            return;
        }

        // Verifica se o user não é admin
        if(!group.verifyAdmin(con)){
            var msg = {
                type: 'notification',
                message: 'You are not the admin',
                recipient: con
            }
            this.private(msg);

            // Encerra a funcionalidade
            return;
        }

        // Nome do membro a ser retirado
        var name = args[1];

        // Seleciona o user
        var user = this.selectUserByName(name);

        // Se o user não existir
        if(!this.userExists(user))
        {
            var msg = {
                type: 'notification',
                message: 'This user does not exists',
                recipient: con
            }
            this.private(msg);

            // Encerra a funcionalidade
            return;
        }

        // Se o user não estiver no grupo
        if(!group.isMember(user))
        {
            var msg = {
                type: 'notification',
                message: 'This user is not in that group',
                recipient: con
            }
            this.private(msg);

            // Encerra a funcionalidade
            return;
        }

        // Avisa que o usuário foi removido
        var msg = {
            type: 'notification',
            message: user.name+' just had been removed from '+group.name+' '+'['+group.initials+']'+' by '+con.name,
            recipient: con
        }
        group.broadcast(msg);

        // Remove o user do grupo
        group.detachMember(user);

        // Avisa à você que a alteração foi feita
        var message = {
            type: 'notification',
            message: 'You removed '+user.name+' from the group '+group.name+' '+'['+group.initials+']',
            recipient: con
        }
        this.private(message);

        // Retorna a mensagem para o histórico do server
        return 'The user '+name+' had been removed from the group '+group.name;
    }

    groupName(con, args)
    {
        // Sigla do grupo
        var initial = args[0];

        // Verifica se o grupo existe
        var group = this.verifyGroupExists(initial);

        // Se o grupo não existir
        if(group === null){
            var msg = {
                type: 'notification',
                message: 'Group does not exists',
                recipient: con
            }
            this.private(msg);

            // Encerra a funcionalidade
            return;
        }

        // Verifica se o user não é admin
        if(!group.verifyAdmin(con)){
            var msg = {
                type: 'notification',
                message: 'You are not the admin',
                recipient: con
            }
            this.private(msg);

            // Encerra a funcionalidade
            return;
        }

        // Novo nome do grupo
        var name = args[1];

        // Avisa ao grupo a mudança de nome
        var msg = {
            type: 'notification',
            message: 'The group name had been changed from '+group.name+' to '+name+' by '+con.name,
            sender: con
        }
        group.broadcast(msg);

        // Avisa à você que a alteração foi feita
        var message = {
            type: 'notification',
            message: 'You changed the group name from '+group.name+' to '+name,
            recipient: con
        }
        this.private(message);

        // Altera o nome
        group.name = name;

        return 'The group name had been changed from '+group.name+' to '+name+' by '+con.name;
    }

    setAdmin(con, args)
    {
        // Sigla do grupo
        var initial = args[0];

        // Verifica se o grupo existe
        var group = this.verifyGroupExists(initial);

        // Se o grupo não existir
        if(group === null){
            var msg = {
                type: 'notification',
                message: 'Group does not exists',
                recipient: con
            }
            this.private(msg);

            // Encerra a funcionalidade
            return;
        }

        // Verifica se o user não é admin
        if(!group.verifyAdmin(con)){
            var msg = {
                type: 'notification',
                message: 'You are not the admin',
                recipient: con
            }
            this.private(msg);

            // Encerra a funcionalidade
            return;
        }

        // Sigla do grupo
        var name = args[1];

        // Seleciona user pelo nome
        var user = this.selectUserByName(name);

        // Adiciona o user como admin
        group.attachAdmin(user);

        // Avisa ao grupo o novo admin
        var msg = {
            type: 'notification',
            message: user.name+' is now a admin of '+group.name+' added by '+con.name,
            sender: con
        }
        group.broadcast(msg);

        // Avisa que adicionou o admin
        var message = {
            type: 'notification',
            message: 'You made '+user.name+' a new admin of '+group.name,
            recipient: con
        }
        this.private(message);
    }

    // Sair de grupos
    quit(con, args)
    {
        // Sigla do grupo
        var init = args[0];

        // Recebe o grupo (null caso não exista)
        var group = this.verifyGroupExists(init);

        // Verifica se o grupo não existe
        if(group === null){
            var msg = {
                type: 'notification',
                message: 'This group does not exists',
                recipient: con
            }
            this.private(msg);
            return;
        }

        // Se não for membro
        if(!group.isMember(con)){
            var msg = {
                type: 'notification',
                message: 'You are not in this group',
                recipient: con
            }
            this.private(msg);
            return;
        }

        //  Informa que o user saiu do grupo
        var msg = {
            type: 'notification',
            message: con.name+' just left from '+group.name+' ['+group.initials+'] '
        }
        group.broadcast(msg);

        // Remove o user
        group.detachMember(con);

        return;
    }
}
module.exports = Users;