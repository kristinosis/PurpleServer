//Import required libraries
require(__dirname + "/Resources/config.js");
const fs = require("fs");
const dgram = require("dgram");
require("./parser.js");
require("./console_commands.js");

var initTimerStart = new Date().getTime(); //Tracks server init time
lobbyClients = []; //All clients currently held in the lobby (user hasn't selected a character yet)
connections = {}; //All game connections

console.log(`Initializing server version ${config.version}
Environment: ${config.environment}
Max Players: ${config.max_players}
Starting Zone: ${config.starting_zone}\n`);

//Load initializers
var init_files = fs.readdirSync(__dirname + "/Initializers");
init_files.forEach(initFile => {
    console.log("Loading Initializer: " + initFile);
    require(__dirname + "/Initializers/" + initFile);
});

//Load models
var model_files = fs.readdirSync(__dirname + "/Models");
model_files.forEach(modelFile => {
    console.log("Loading Data Model: " + modelFile);
    require(__dirname + "/Models/" + modelFile);
});

//Load maps
maps = {};

var map_files = fs.readdirSync(config.data_paths.maps);
map_files.forEach(mapFile => {
    console.log("Loading Map: " + mapFile);
    var map = require(config.data_paths.maps + mapFile);
    maps[map.room] = map;
});

var connection = require("./connection.js"); //Connection is a local proxy to a client
var client = require("./client.js"); //Client is stored on the room it's in, and handles communication abstraction
var socket = dgram.createSocket('udp4');

//When socket recieves an error
socket.on("error", err => {
    console.log("Server error: " + err.stack);
    socket.close();
});

//When socket recieves message
socket.on("message", (message, rinfo) => {
    console.log(`Recieved data: ${message} from address ${rinfo.address}:${rinfo.port}`);
    
    //Verify custom protocol header, split it from the JSON and send raw JSON to the parser
    var prot = message.slice(0,6);
    if (prot == config.custom_protocol_headers.udp_reg){
        //Regular protocol
    }
    else if (prot == config.custom_protocol_headers.udp_safe){
        //Safe protocol, handle ACK sending
    }
    else if (prot == config.custom_protocol_headers.udp_safe_ack){
        //Ack confirmation packet for a sent Safe packet
    }
    else {
        console.log("Recieved a packet without a custom protocol header, ignoring.");
        return;
    }
    var data = Parser.parse(message.slice(6));

    if (!('cmd' in data)) {
        console.log("Packet doesn't have field 'cmd'. Disregarding.");
        return;
    }
    switch (data.cmd){
    //If it's a HS packet, intiate a connection and store it here
    case 'HS': {
        //Create new connection
        var conn_i = new connection();
        conn_i.initiate(rinfo.address, rinfo.port);
        connections[rinfo.address] = conn_i;
        //Send confirmation packet
        let packetData = {cmd:"HS", status:"OK", detail:"NIL"};
        socket.send(Parser.package(config.custom_protocol_headers.udp_reg, packetData), rinfo.port, rinfo.address);
        break;
    }
    
    //If it's a LOGIN packet, initiate a client and store it here
    case 'LOGIN': {
        //validation
        if(!(rinfo.address in connections)){
            console.log("WARNING: Recieved LOGIN packet from address without a connection! Ignoring.");
            return;
        }

        if (!Parser.validatePacket(data.cmd, data)) return;

        User.login(data.email, data.password, (success, user) => {
            //On successful login
            if (success && user) {
                //Send confirmation/data
                let packetData = {cmd:"LOGIN", status:"OK", detail:user};
                socket.send(Parser.package(config.custom_protocol_headers.udp_reg, packetData), rinfo.port, rinfo.address);
            
                //initiate a client
                client_i = new client();
                client_i.initiate(rinfo.address, rinfo.port, socket, lobbyClients);
                lobbyClients.push(client_i);
                connections[rinfo.address].setRoom("Lobby");
            } 
            else {
                let packetData = {cmd:"LOGIN", status:"ERR", detail:null};
                socket.send(Parser.package(config.custom_protocol_headers.udp_reg, packetData), rinfo.port, rinfo.address);
            }
        });        
        break;
    }
    
    //If it's a CONN packet, connect with specific character and enter room
    case 'CONN':
        if(!(rinfo.address in connections)) return;

        connections[rinfo.address].setRoom("rm_default");
        break;

    //If it's a TOLOBBY packet, return client to lobby for character select
    case 'TOLOBBY':
        if (!(rinfo.address in connections)) return;

        connections[rinfo.address].toLobby();

        break;


    //If it's a LOGOUT packet, delete any Clients associated with this connection
    case "LOGOUT":
        if (!(rinfo.address in connections)) return;

        let index = lobbyClients.indexOf(connections[rinfo.address].getClient);
        if (index) {
            lobbyClients.splice(index, 1);
            console.log(`Client [${rinfo.address}] logged out.`);
        }

        break;

    //If it's a DC packet, delete the connection from the connections array
    case 'DC':
        if(!(rinfo.address in connections)) return;

        delete connections[rinfo.address];
        console.log(`[${rinfo.address}] disconnected.`);
        break;

    //Otherwise, redirect the packet to it's specified client (with help from that IP's connection) to 
        //be processed by the client
    default:
        if (!(rinfo.address in connections)) {
            console.log("Recieved non-handshake packet from an address without a connection! Ingoring.");
            return;
        }
        else {
            connections[rinfo.address].getClient((success, result) => {
                if (success)
                    result.handlePacket(data);
                else {
                    console.log("Recieved non-login/register packet from connection without a client! Ignoring.");
                }
            });
        }
        break;
    }
    
    //SENDING DATA
    /*var test = {
        command: "TEST",
        val: "Message recieved!"
    };
    console.log("Sending response data to the client...");
    socket.send(Buffer.from(JSON.stringify(test), "ascii"), rinfo.port, rinfo.address);
    */
});

//When server starts listening
socket.on("listening", () => {
    var initTimerEnd = new Date().getTime();
    console.log(`\nInitialization completed in ${initTimerEnd-initTimerStart}ms. Server running on port: ${config.port}`);
});

socket.bind(config.port, config.ip);

