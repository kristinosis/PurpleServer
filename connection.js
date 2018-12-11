module.exports = function(){

    this.initiate = function(ip, port, room){
        this.ip = ip;
        this.port = port;
        this.room = room || null;
    };

    this.setRoom = function(room){
        if (this.room != null){
            var currentClientList;
            if (this.room != "Lobby"){
                currentClientList = maps[this.room].clients;
            }
            else {
                currentClientList = lobbyClients;
            }

            var theClient;
            currentClientList.forEach(client => {
                if(client.ip == this.ip){
                    theClient = client;
                }
            });
            if(theClient){
                var index = currentClientList.indexOf(theClient);
                currentClientList.splice(index, 1);
                maps[room].clients.push(theClient);
            }
        }
        this.room = room;
    };

    this.toLobby = function(){
        if (this.room == null || this.room == "Lobby") return;

        console.log("Attempting to quit to lobby...");
        let theClient;
        maps[this.room].clients.forEach(client => {
            if (client.ip == this.ip){
                theClient = client;
            }
        });
        let index = maps[this.room].clients.indexOf(theClient);
        maps[this.room].clients.splice(index, 1);
        lobbyClients.push(theClient);
    };

    this.getClient = function(callback){
        if (this.room == null) {
            callback(false, "No client found.");
            return;
        }

        //If set to lobby
        if (this.room == "Lobby"){
            let theClient;
            lobbyClients.forEach(client => {
                if (client.ip == this.ip){
                    theClient = client;
                }
            });
            if (theClient != null) {
                    callback(true, theClient);
                    return;
            }
            else {
                callback(false, "Client was supposed to be in lobby, but is missing.");
                return;
            }
        }

        //If the map specified for this connection has connected clients
        if (this.room in maps){ //Make sure the map exists first...
            let theClient;
            maps[this.room].clients.forEach(client => {
                if (client.ip == this.ip)
                    theClient = client;
            });
            if (theClient != null) {return theClient;}
            else {
                callback(false, "No client with this connection's IP in it's specified room.");
                return;
            }
        }
        else {
            callback(false, "Connection is assigned a room that doesn't exist!.");
            return;
        }

    }
}
