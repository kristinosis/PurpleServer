const now = require("performance-now");
const us = require("underscore");

module.exports = function(){

    //Added by the server at runtime:
    //this.socket = {}
    //this.user = {}

    this.initialize = function(){
        var client = this;

        //Send handshake to client
        client.socket.write(packet.build(["HELLO", now().toString()]));

        console.log("Client connected.")
    }

    this.data = function(data){
        console.log("Client data recieved " + data.toString())
    }

    this.error = function(err){
        console.log ("Client error " + err.toString())
    }

    this.end = function(){
        console.log("Client closed.")
    }

}