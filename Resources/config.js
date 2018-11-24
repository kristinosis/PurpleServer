//Import required libraries
const args = require("minimist")(process.argv.slice(2));
const extend = require("extend");

//Grab environment from args
var environment = args.env || "test";

//Common configuration
var common_conf = {
    name : "Project Purple",
    version : "0.0.1",
    environment : environment,
    max_players : 100,
    data_paths : {
        items : __dirname + "/GameData/Items/",
        maps : __dirname + "/GameData/Maps/"
    },
    starting_zone : "rm_default"
}

//Environment specific configuration
var conf = {
    production : {
        ip : args.ip | "0.0.0.0",
        port : args.port | 8081,
        database : "mongodb://127.0.0.1/purplemmo_prod"
    },  

    test : {
        ip : args.ip | "0.0.0.0",
        port : args.port | 8082,
        database : "mongodb://127.0.0.1/purplemmo_test"
    }
}

//Extend common conf onto environment confs
extend(false, conf.production, common_conf);
extend(false, conf.test, common_conf);

//Export as config
module.exports = config = conf[environment];