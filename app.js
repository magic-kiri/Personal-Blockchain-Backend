
const express = require('express');
const cors = require('cors')
const http = require('http')
const mongoose = require('mongoose');

const accountHandler = require('./accountHandler')
const transactionHandler = require('./transactionHandler')
const blockchainHandler = require('./blockchainHandler');
const blockRoutes = require('./blockRoutes')
const comunicator = require('./communicator')
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
    res.json("Welcome to Personal Blockchain!");
});









//////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////  TRANSACTION RELATED API  //////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////

app.post('/verify_transaction', async (req, res) => {
    let packet = req.body
    const response = await transactionHandler.verifyTransaction(packet)
    res.status(response.statusCode).json(response.body)
})

// this adds transaction to the ledger...
app.post('/add_transaction', async (req, res) => {
    const response = await transactionHandler.createTransaction(req.body, loggedAccount, userPassword)
    res.status(response.statusCode).json(response.body)
})

app.get('/transactions',async (req,res)=>{
    const response = await transactionHandler.getTransactions()
    res.status(response.statusCode).json(response.body)
})
//////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////


app.post('/add_ip',async (req,res)=>{
    const response = comunicator.addIpAddress(req.body)
    res.status(response.statusCode).json(response.body)
})


//////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////// ACCOUNT RELATED API ////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////
// This is an API to know that any user is signed in or not?
app.get('/is_log_in', (req, res) => {
    if (loggedAccount == null)
        res.status(200).json({ loggedIn: false, username: null })
    else
        res.status(200).json({ loggedIn: true, username: loggedAccount.getUsername() })
})

// This is an API for sign_up
// Returns a string as response
app.post('/sign_up', async (req, res) => {
    const response = await accountHandler.signUp(req.body.username, req.body.password)
    res.status(response.statusCode).json(response.body)
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
    res.status(response.statusCode).json(response.body)
})
// This API is to log out from current user
app.get('/log_out', (req, res) => {
    loggedAccount = null
    userPassword = null
    res.status(200).json("Logged-out successfully!")
})
// The API provides current users public key and private key
app.post('/get_keys', (req, res) => {

    if (loggedAccount == null)
        res.status(204).json("You have to log-in first!")
    else if (req.body.password == userPassword) {
        const publicKey = loggedAccount.getPublicKey()
        const privateKey = loggedAccount.getPrivateKey(userPassword)
        res.status(200).json({ publicKey: publicKey, privateKey: privateKey })
    }
    else
        res.status(401).json("Password didn't matched!")
})

// This recieves an prepared account and adds in its own db
app.post('/add_account', async (req, res) => {
    const response = await accountHandler.addAccount(req.body)
    res.status(response.statusCode).json(response.body)
})

app.get('/accounts', async (req, res) => {
    const response = await accountHandler.getAccounts()
    res.status(response.statusCode).json(response.body)
})

app.get('/account/:username', async (req, res) => {
    const response = await accountHandler.getAccount(req.params.username)
    res.status(response.statusCode).json(response.body)
})

//////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////// END OF THIS PORTION //////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////



app.get('/blockchain', async function (req, res) {
    const response = await blockRoutes.getChain()
    res.status(response.statusCode).json(response.body)
});

// Get a certain block with index
app.get('/blockchain/:index', async function (req, res) {
    const response = await blockRoutes.getBlock(req.params.index)
    res.status(response.statusCode).json(response.body)
});


app.get('/get_updated', async function (req, res) {
    const response = await blockRoutes.getUpdated()
    res.status(response.statusCode).json(response.body)
});

app.post('/add_block', async (req, res) => {
    const response = await blockRoutes.addBlock(req.body)
    res.status(response.statusCode).json(response.body)
})

app.post('/propose_block', async (req, res) => {
    const response = await blockchainHandler.proposePacket(req.body)
    res.status(response.statusCode).json(response.body)
})

app.get('/consensus_time', (req,res)=>{
    res.status(200).json(blockchainHandler.getConsensusTime())
})


async function appStart() {
    setTimeout(()=>{blockchainHandler.init()},4000)
}

appStart()


http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port' + app.get('port'));
});

