const keypress = require("keypress");
keypress(process.stdin);
var cmdBuffer = "";

process.stdin.on("keypress", (chunk, key) => {
    //console.log("Key pressed: " + key.name);
    //console.log(chunk);
    if (key && key.name && key.name == "enter"){
        var args = cmdBuffer.split(" ");
        var cmd = args[0];
        args.splice(0,1);
        try {
            commands[cmd](args);
        }
        catch(err) {

        }
        cmdBuffer = "";
    }
    else {
        cmdBuffer += chunk;
    }
});


var commands = {

    test: function(){
        this.conn();
        this.showclients("lobby");
        this.showclients("rm_default");
    },

    conn: function(){
        console.log("Connections: " + Object.keys(connections));
    },

    showclients: function(roomName){
        var clientIPs = [];
        if(roomName == "lobby") {
            lobbyClients.forEach(client => {
                clientIPs.push(client.ip);
            });
            console.log(`Clients in [LOBBY]: ${clientIPs.toString()}`);
        }
        else {
            if (roomName in maps){
                maps[roomName].clients.forEach(client => {
                    clientIPs.push(client.ip);
                });
                console.log(`Clients in [${roomName}]: ${clientIPs.toString()}`);
            }
            else {
                console.log(`Room [${roomName}] doesn't exist!`);
            }
        }
    },

    rooms: function(){
        
    }


};