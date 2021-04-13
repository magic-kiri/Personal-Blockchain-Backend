var express = require('express');
var path = require('path');
// var bodyParser = require('body-parser');
var json = require('json');
var logger = require('logger');
// var methodOverride = require('method-override');
var http = require('http')

const authentication = require('./Authentication')
const transactionHandler = require('./transactionHandler')
const {Account} = require('./account')


// var urlencoded = require('url');
var sha256 = require('js-sha256')

var Blockchain = require('./Blockchain')
var routes = require('./routes')
var app = express();
const database = require('./database')
var { adjacentNode } = require('./findHost');
const { response } = require('express');

app.set('port', 4000);

var loggedAccount = null
var userPassword = null
let tmpPrivateKey
// CREATED A BLOCKCHAIN 

app.use(express.json());
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded());
// app.use(methodOverride());

// app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function (req, res) {
    res.send("Welcome to Personal Blockchain!");
});


// var pp = blockchain.chain
// app.get('/', routes.);
// console.log(blockchain)
app.get('/get_chain', (req, res) => routes.get_chain(req, res, blockchain))

app.get('/is_valid', (req, res) => routes.is_valid(req, res, blockchain))

app.post('/connect_node', (req, res) => routes.connect_node(req, res, blockchain))

app.post('/request_transaction', (req, res) => routes.request_transaction(req, res))

// this adds transaction to the ledger...
app.post('/add_transaction', async (req, res)=>{  
    res.send(await transactionHandler.createTransaction(req.body,loggedAccount,userPassword))
})


// This is an API to know that any user is signed in or not?
app.get('/is_log_in', (req,res)=>{
    res.send({status: (loggedAccount)})
})

// This is an API for sign_up
// Returns a string as response
app.post('/sign_up', async (req, res) => {
    res.send(await authentication.signUp(req.body.username, req.body.password))
})

// This is an API for sign_in
// Returns a string as response
app.post('/sign_in', async (req, res) => {
    let response = (await authentication.signIn(req.body.username, req.body.password))
    if(response.status == "Login Successful")
    {
        const account = response.account
        loggedAccount = new Account(account.username,account.passHash,account.publicKey,account.encryptedPrivateKey,account.timestamp)
        userPassword = req.body.password  
    }
    res.send(response)
})

app.get('/log_out', (req,res)=>{
    loggedAccount = null
    userPassword = null
    res.send({status:"Logged-out successfully!"})
})

http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port' + app.get('port'));
});



