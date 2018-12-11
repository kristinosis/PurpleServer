const mongoose = require("mongoose");
require("./../Resources/config.js");

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
    },

    //Character sprite data
    head_id: Number,
    body_id: Number,
    legs_id: Number,
    
    //Positional Data
    pos_x: Number,
    pos_y: Number,
    current_room: String

});

const userSchema = mongoose.Schema({
    //Unique user ID
    _id: mongoose.Schema.Types.ObjectId,
    //Family name is the account name.. the last name for all characters. It's also the login name
    family_name: {type: String, unique: true},
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

userSchema.statics.register = function(email, password, family_name, callback){

    var new_user = new User({
        _id: mongoose.Types.ObjectId(),
        family_name: family_name,
        email: email,
        password: password,
        characters: []
    });

    //Try to save the new user.. if there's no error send 'true' to the callback function. else send 'false'.
    new_user.save((err) => {
        if (!err){
            callback(true);
        }
        else {
            callback(false);
        }
    });

};

userSchema.statics.login = function(email, password, callback){
    User.findOne({email: email}, (error, user) => {
        if (!error && user){
            if (user.password == password){
                callback(true, user);
            }
            else {
                callback(false, null);
            }
        }
        else {
            callback(false, null);
        }
    });

};

module.exports = User = mongoose.model("User", userSchema);