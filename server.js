//Import required libraries
require(__dirname + "/Resources/config.js");
const fs = require("fs");
const dgram = require("dgram");
require("./packet.js");

var initTimerStart = new Date().getTime();

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
    console.log("Loading Model: " + modelFile);
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

var socket = dgram.createSocket('udp4');

//When socket recieves an error
socket.on("error", err => {
    console.log("Server error: " + err.stack);
    socket.close()
});

//When socket recieves message
socket.on("message", (message, rinfo) => {
    console.log(`Recieved data: ${message} from address ${rinfo.address}:${rinfo.port}`);
    
    
    
    
    
    var test = {
        command: "TEST",
        val: "Message recieved!"
    };
    console.log("Sending response data to the client...");
    socket.send(Buffer.from(JSON.stringify(test), "ascii"), rinfo.port, rinfo.address);
});

//When server starts listening
socket.on("listening", () => {
    var initTimerEnd = new Date().getTime();
    console.log(`\nInitialization completed in ${initTimerEnd-initTimerStart}ms. Server running on port: ${config.port}`);
});

socket.bind(config.port, config.ip);

