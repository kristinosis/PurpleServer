var zeroBuffer = new Buffer("00", "hex"); //Zero buffer added to the end of string buffers to mark the end

module.exports = packet = {

    //params: array of js objects to be turned into buffers
    build : function(params){

        var packetParts = [];
        var packetSize = 0;

        //Process each param and add to the packetParts array
        params.forEach(param => {
            var buffer;

            if (typeof(param) === "string"){
                buffer = new Buffer(param, "utf8");
                buffer = Buffer.concat([buffer, zeroBuffer], buffer.length + 1);
            }
            else if (typeof(param) === "number"){
                buffer = new Buffer(2);
                buffer.writeUInt16LE(param, 0);
            }
            else {
                console.log("WARNING: Unknown data type in packet builder.");
            }

            packetSize += buffer.length;
            packetParts.push(buffer);
        });

        //Concatenate packetParts into one data packet
        var dataBuffer = Buffer.concat(packetParts, packetSize);

        //Add another byte to the front of the packet, which tells us the length of the packet(including this new byte)
        var size = new Buffer(1);
        size.writeUInt8(dataBuffer.length+1, 0);

        //Assemble final packet (SIZE -> DATA)
        var finalPacket = Buffer.concat([size, dataBuffer], size.length + dataBuffer.length);

        return finalPacket;

    }

}