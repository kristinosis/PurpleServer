//Import required libraries
require(__dirname + "/Resources/config.js");
const fs = require("fs");
const net = require("net");
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

//HEY LOOK A COMMENT
net.createServer(function(socket){

    //Create new client instance
    var c_instance = new require("./client.js");
    var client = new c_instance();

    client.socket = socket;
    client.initialize();

    //Network events
    socket.on("error", client.error);
    socket.on("end", client.end);
    socket.on("data", client.data);

}).listen(config.port);

var initTimerEnd = new Date().getTime();
console.log(`\nInitialization completed in ${initTimerEnd-initTimerStart}ms. Server running on port: ${config.port}`);
