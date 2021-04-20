var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Block = new Schema({
    _id : {type: Number, required: true},
    timestamp: {type:Date, required: true},
    previousHash: {type:String,required: true},
    transactions: {type:Array, required: true},
    limit: {type: Number,required:true}
},{_id:false,strict:true});

module.exports = mongoose.model('Block', Block);


