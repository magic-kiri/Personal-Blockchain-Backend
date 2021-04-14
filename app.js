var express = require('express');
var path = require('path');
// var bodyParser = require('body-parser');
var json = require('json');
var logger = require('logger');
// var methodOverride = require('method-override');
var http = require('http')

const authentication = require('./Authentication')
const transactionHandler = require('./transactionHandler')
const { Account } = require('./account')


// var urlencoded = require('url');
var sha256 = require('js-sha256')

var Blockchain = require('./Blockchain')
var routes = require('./routes')
var app = express();
const database = require('./database')
var { comunicatorInit } = require('./comunicator');
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
app.post('/add_transaction', async (req, res) => {
    const response = await transactionHandler.createTransaction(req.body, loggedAccount, userPassword)
    res.status(response.statusCode).send(response.body)
})


// This is an API to know that any user is signed in or not?
app.get('/is_log_in', (req, res) => {
    if (loggedAccount == null)
        res.status(200).send({ loggedIn: false, username: null })
    else
        res.status(200).send({ loggedIn: true, username: loggedAccount.getUsername() })
})

// This is an API for sign_up
// Returns a string as response
app.post('/sign_up', async (req, res) => {
    const response = await authentication.signUp(req.body.username, req.body.password)
    res.status(response.statusCode).send(response.body)
})

// This is an API for sign_in
// Returns a string as response
app.post('/sign_in', async (req, res) => {
    let response = (await authentication.signIn(req.body.username, req.body.password))
    if (response.statusCode == 200) {
        const account = response.body
        loggedAccount = new Account(account.username, account.passHash, account.publicKey, account.encryptedPrivateKey, account.timestamp)
        userPassword = req.body.password
    }
    res.status(response.statusCode).send(response.body)
})

app.get('/log_out', (req, res) => {
    loggedAccount = null
    userPassword = null
    res.status(200).send("Logged-out successfully!")
})

app.get('/get_keys', (req, res) => {
    if (loggedAccount == null)
        res.status(204).send("You have to log-in first!")
    else {
        const publicKey = loggedAccount.getPublicKey()
        const privateKey = loggedAccount.getPrivateKey(userPassword)
        res.status(200).send({ publicKey: publicKey, privateKey: privateKey })
    }

})

comunicatorInit()


http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port' + app.get('port'));
});



