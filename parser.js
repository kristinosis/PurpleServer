

module.exports = Parser = {

    parse: function(buffer){
        return JSON.parse(buffer.toString());
    },

    package: function(object){
        return Buffer.from(JSON.stringify(object), "ascii");
    }

}