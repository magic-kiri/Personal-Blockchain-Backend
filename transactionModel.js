var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TransactionSchema = new Schema({
    _id: {type: String , required: true}
    // timestamp: {type:Date, required: true},
    // sender: {type:String,required: true},
    // reciever: {type:String,required: true},
    // data: {type: Object}

},{_id:false,strict:false});

module.exports = mongoose.model('Transaction', TransactionSchema);
