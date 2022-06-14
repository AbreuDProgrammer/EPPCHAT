class Users
{
    cons = [];
    broadcast(msg, origem)
    {
        this.cons.forEach(function(con){
            if(con === origem)
                return;
            con.write(msg);
        });
    }
    private(msg, orig, dest)
    {
        this.cons.forEach(con => {
            if(con.nome == dest){
                con.write(orig+" wrote just for you: "+msg);
            }
        });
    }
    systemAnswer(array)
    {
        var msg = array[0];
        var dest = array[1];
        this.cons.forEach(con => {
            if(con.nome == dest){
                con.write(msg);
            }
        });
    }
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
    attachUser(con)
    {
        this.cons.push(con);
    }
    detachUser(con)
    {
        this.cons.splice(this.cons.indexOf(con), 1);
    }

    name(con, comando)
    {
        var nome = comando.slice(5).trim();
        var rep = this.verNomeRep(nome);
        var msg = "";
        if(rep === false) {
            msg = con.nome+" changed his name to "+nome;
            con.nome = nome;
            this.broadcast(msg);
        }
        else {
            var sys = ["This name is in use", con.nome];
            this.systemAnswer(sys);
        }
        return msg;
    }
    desc(con, comando)
    {
        var desc = comando.slice(5).trim();
        var msg = con.nome+" changed his description";
        con.desc = desc;
        this.broadcast(msg);
        return msg;
    }
    seeDesc(con, comando)
    {
        var user = comando.slice(8).trim();
        var rem = con.nome;
        var sys;
        this.cons.forEach(function(con){
            if(con.nome == user){
                var desc = user+"`s description is "+con.desc;
                sys = [desc, rem];
            }
        });
        if(sys)
            this.systemAnswer(sys);
        var msg = rem+" saw "+user+" descriptions";
        return msg;
    }
    msgTo(con, comando)
    {
        var comandoArray = comando.split(' ');
        var user = comandoArray[1];
        comandoArray.splice(0, 2);
        var message = comandoArray.join(' ');
        this.private(message, con.nome, user);
        var msg = con.nome+" sent a private message to "+user+" saying: "+message;
        return msg;
    }
}
module.exports= Users;