var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var BlockchainSchema = new Schema({
    index : {type: Number, required: true, unique: true},
    // timestamp: {type:Date, required: true},
    previousHash: {type:String,required: true},
    transactions: {type:Array, required: true}
},{strict:false});

module.exports = mongoose.model('Block', BlockchainSchema);