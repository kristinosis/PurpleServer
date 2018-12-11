module.exports = function(){

    client = this;
    

    this.initiate = function(ip, port, socket, clientList){
        this.ip = ip;
        this.port = port;
        this.socket = socket;
        this.clientList = clientList;
    }

    this.sayHello = function(){
        console.log("Hello! This is coming from the client instance!");
    }

    this.handlePacket = function(data){
        switch(data.cmd){
        case "test":
            console.log("This was a custom command passed through the header");    
            break;
        }
    }

    
}