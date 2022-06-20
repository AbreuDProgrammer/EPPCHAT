class Group{
    name;
    #admin;
    members = [];
    MAX_MEMBERS = 10;

    constructor(con, name){
        this.members.length = this.MAX_MEMBERS;
        this.#admin = con;
        this.name = name;
        this.attachMember(con);
    }

    broadcast(args){
        this.nembers.forEach(function(con){
            if(con === args.sender)
                return;
            con.write(args.message);
        });
    }

    attachMember(con){
        if(this.validateUsers()){
            this.members.push(con);
            console.log("New member-> "+con.name);
        }
    }

    detachMember(con){
        this.members.splice(this.members.indexOf(con),1);
    }

    quit(con){
        this.detachMember(con)
    }

    validateUsers(){
        if(this.members.length > 0 && this.members.length <= this.MAX_MEMBERS)
            return true;
        return false;
    }

    verivyAdmin(con){
        if(con != this.#admin)
            return false;
        return true;
    }

    gName(name){
        this.name = name;
    }

}
