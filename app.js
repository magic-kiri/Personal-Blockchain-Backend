const express = require('express');
const cors = require('cors')
const http = require('http')
const mongoose = require('mongoose');

// const path = require('path');
// const bodyParser = require('body-parser');
// const json = require('json');
// const logger = require('logger');
// const methodOverride = require('method-override');
// const urlencoded = require('url');
// const sha256 = require('js-sha256')

const accountHandler = require('./accountHandler')
const transactionHandler = require('./transactionHandler')
const { comunicatorInit } = require('./comunicator');
const blockchainHandler = require('./blockchainHandler');
const { Account } = require('./account')


const app = express();


app.set('port', 4000);
const db = 'mongodb://localhost/PB'

mongoose.connect(db,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
  }, (err) => {
    if (err)
      console.error(err);
    else
      console.log("Connected to the mongodb");
  });


var loggedAccount = null
var userPassword = null

// CREATED A BLOCKCHAIN 

app.use(express.json());
app.use(cors())

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded());
// app.use(methodOverride());

// app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function (req, res) {
    res.send("Welcome to Personal Blockchain!");
});









//////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////  TRANSACTION RELATED API  //////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////

app.post('/verify_transaction', async (req, res) => {
    await accountHandler.addAccount(req.body.account)
    const response = await transactionHandler.verifyTransaction(req.body.transaction, req.body.account.publicKey)
    res.status(response.statusCode).send(response.body)
})

// this adds transaction to the ledger...
app.post('/add_transaction', async (req, res) => {
    const response = await transactionHandler.createTransaction(req.body, loggedAccount, userPassword)
    res.status(response.statusCode).send(response.body)
})

//////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////


//////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////// ACCOUNT RELATED API ////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////
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
    console.log(req.body)
    const response = await accountHandler.signUp(req.body.username, req.body.password)
    res.status(response.statusCode).send(response.body)
})

// This is an API for sign_in
// Returns a string as response
app.post('/sign_in', async (req, res) => {
    let response = (await accountHandler.signIn(req.body.username, req.body.password))
    if (response.statusCode == 200) {
        const account = response.body
        loggedAccount = new Account(account.username, account.passHash, account.publicKey, account.encryptedPrivateKey, account.timestamp)
        userPassword = req.body.password
    }
    res.status(response.statusCode).send(response.body)
})
// This API is to log out from current user
app.get('/log_out', (req, res) => {
    loggedAccount = null
    userPassword = null
    res.status(200).send("Logged-out successfully!")
})
// The API provides current users public key and private key
app.post('/get_keys', (req, res) => {
    
    if (loggedAccount == null)
        res.status(204).send("You have to log-in first!")
    else if(req.body.password == userPassword){
        const publicKey = loggedAccount.getPublicKey()
        const privateKey = loggedAccount.getPrivateKey(userPassword)
        res.status(200).send({ publicKey: publicKey, privateKey: privateKey })
    }
    else
        res.status(401).send("Password didn't matched!")
})
// This recieves an account and adds in its own db
app.post('/add_account', async (req, res) => {
    const response = await accountHandler.addAccount(req.body)
    res.status(response.statusCode).send(response.body)
})
app.get('/accounts', async (req, res) => {
    const response = await accountHandler.getAccounts()
    res.status(response.statusCode).send(response.body)
})

app.get('/account/:username', async (req, res) => {
    const response = await accountHandler.getAccount(req.params.username)
    res.status(response.statusCode).send(response.body)
})

//////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////// END OF THIS PORTION //////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////



app.get('/blockchain', async function (req, res) {
    const response = await blockchainHandler.getChain()
    res.status(response.statusCode).send(response.body)
});

// Get a certain block with index
app.get('/blockchain/:index', async function (req, res) {
    const response = await blockchainHandler.getBlock(req.params.index)
    res.status(response.statusCode).send(response.body)
});

app.post('/add_block', async (req, res) => {
    const response = await blockchainHandler.addBlock(req.body)
    res.status(response.statusCode).send(response.body)
})


comunicatorInit()
accountHandler.init()
blockchainHandler.init()

http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port' + app.get('port'));
});



