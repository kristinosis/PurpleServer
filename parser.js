//Define packet models.. we only care about the keys, not the values.
const packetModels = {
    LOGIN: {
        cmd: "",
        email: "",
        password: ""
    }
};

module.exports = Parser = {

    parse: function(buffer){
        return JSON.parse(buffer.toString());
    },

    package: function(protocol, object){
        return Buffer.from(protocol + JSON.stringify(object), "ascii");
    },

    validatePacket: function(cmd, packet){
        if (cmd in packetModels){
            var aKeys = Object.keys(packet).sort();
            var bKeys = Object.keys(packetModels[cmd]).sort();
            return JSON.stringify(aKeys) === JSON.stringify(bKeys);
        }
        else {
            print("Packet model doesn't exist!");
            return false;
        }
    }

}
