var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TransactionSchema = new Schema({
    _id: {type: String , required: true},
    transaction: {type: Object, required: true},
    signature  : {type: Object, required: true}
},{_id:false,strict:false});

module.exports = mongoose.model('Transaction', TransactionSchema);
