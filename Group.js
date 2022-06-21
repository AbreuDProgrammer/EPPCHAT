class Group
{
    name; // Nome do grupo
    initials; // Sigla do Grupo
    #admin = []; // Users admin do grupo
    members = []; // Membros do grupo

    // Define quem é o admin, o nome do grupo, a sigla e adiciona o admin na lista de membros
    constructor(con, name, ini)
    {
        this.#admin.push(con);
        this.name = name;
        this.initials = ini;
        this.attachMember(con);
    }

    // Mostra a mensagem a todos do chat
    broadcast(args)
    {
        // Recebe a hora e insere na mensagem
        var date = new Date;
        var hours = date.getHours();
        var min = date.getMinutes();

        // Salva a sigla
        var init = this.initials;

        // Cria a mensagem
        var msg;

        // Se for uma notificação
        if(args.type === 'notification')
        {
            msg = args.message;
        }
        // Se for uma mensagem comum
        else if(args.type === 'message')
        {
            msg = hours+":"+min+' '+init+' '+args.sender.name+': '+args.message;
        }

        // Envia a mensagem a todos os membros menos o remetente
        this.members.forEach(function(member){
            if(member === args.sender)
                return;
            member.write(msg);
        });

        return;
    }

    // Funcionalidade para adicionar membros
    attachMember(con)
    {
        this.members.push(con);
    }

    // Funcionalidade para remover membros
    detachMember(con)
    {
        this.members.splice(this.members.indexOf(con), 1);
    }

    // Funcionalidade para verificar se o remetente do pedido é o admin
    verifyAdmin(con)
    {
        for(var member of this.#admin)
        {
            if(con === member)
                return true;
        }
        return false;
    }

    // Funcionalidade para adicionar admin
    attachAdmin(con)
    {
        this.#admin.push(con);
    }

    // Verifica se o user está no grupo
    isMember(user)
    {
        for(var member of this.members)
        {
            if(member === user)
                return true;
        }
        return false;
    }
}
module.exports = Group;