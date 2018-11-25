const mongoose = require("mongoose");
require(__dirname + "/Resources/config.js");

const characterSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    //First name of this specific character
    name: String,
    race: String,
    class: String,
    hp: Number,
    max_hp: Number,
    //Energy: adrenaline for warrior, nature essence for hunter, mana for mage
    //Maybe come up with a new name for mana.. it's too generic
    energy: Number,
    max_energy: Number,
    //Essentia, only used by the mage, is for elemancy (rather than their mana, for illusion magic)
    essentia: {
        type: [{type: Number}],
        validate: [essentiaLimit, "{PATH} must be of length 3"]
    },
    max_essentia: {
        type: [{type: Number}],
        validate: [essentiaLimit, "{PATH} must be of length 3"]
    }
    

});

const userSchema = mongoose.Schema({
    //Unique user ID
    _id: mongoose.Schema.Types.ObjectId,
    //Family name is the account name.. the last name for all characters. It's also the login name
    family_name: String, 
    email: String,
    password: String,
    characters: {
        type: [{type: characterSchema}],
        validate: [characterLimit, "{PATH} exceeds character limit!"]
    }
});

function essentiaLimit(val){
    return val.length == 3;
}

function characterLimit(val){
    return val.length <= config.max_user_characters;
}