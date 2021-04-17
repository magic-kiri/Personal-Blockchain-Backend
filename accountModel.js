var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AccountSchema = new Schema({
    username:               {type: String, required: true, unique: true},
    passHash:               {type: String, required: true},
    publicKey:              {type: Object, required: true},
    encryptedPrivateKey:    {type: Object, required: true}

},{strict:false});

module.exports = mongoose.model('Account', AccountSchema);

