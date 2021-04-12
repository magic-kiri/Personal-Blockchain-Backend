var express = require('express');
var path = require('path');
// var bodyParser = require('body-parser');
var json = require('json');
var logger = require('logger');
// var methodOverride = require('method-override');
var http = require('http');
const authentication = require('./Authentication')
// var urlencoded = require('url');
var sha256 = require('js-sha256')

var Blockchain = require('./Blockchain')
var routes = require('./routes')
var app = express();
const database = require('./database')
var {adjacentNode} = require('./findHost')

app.set('port', 4000);

// CREATED A BLOCKCHAIN 

app.use(express.json());
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded());
// app.use(methodOverride());

// app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req,res){
    res.send("Welcome to Personal Blockchain!");
});

var blockchain = new Blockchain() 

// var pp = blockchain.chain
// app.get('/', routes.);
// console.log(blockchain)
app.get('/get_chain', (req,res) => routes.get_chain(req,res,blockchain))

app.get('/is_valid', (req,res) => routes.is_valid(req,res,blockchain))

app.post('/add_transaction', (req,res) => routes.add_transaction(req,res,blockchain))

app.post('/connect_node', (req,res) => routes.connect_node(req,res,blockchain))

app.post('/request_transaction', (req,res)=> routes.request_transaction(req,res))


// This is an API for sign_up
// Returns a string as response
app.post('/sign_up',async (req,res)=>{
    let response = await authentication.signUp(req.body.username,req.body.password)
    res.send(response)
})

// This is an API for sign_in
// Returns a string as response
app.post('/sign_in',async (req,res)=>{

    let response = await authentication.signIn(req.body.username,req.body.password)
    res.send(response)
})





// var MongoClient = require('mongodb').MongoClient;

http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port' + app.get('port'));
});



