var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TransactionSchema = new Schema({
    // timestamp: {type:Date, required: true},
    sender: {type:String,required: true},
    reciever: {type:String,required: true},
    data: {type: Object}

},{strict:false});

module.exports = mongoose.model('Transaction', TransactionSchema);