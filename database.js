var express = require('express');
var app = express();
var mongoose = require('mongoose');
var Account = require('./accountModel');
var Block = require('./BlockModel')
var Pool = require('./transactionModel')
const { getAllData, getDataFromId, addData } = require(`./dbMethod`);

var port = 8080;
var db = 'mongodb://localhost/PB'
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

// This portion is for accounts and others
app.use(express.json())

app.get('/', function (req, res) {
  res.send('Welcome to Personal-Blockchain');
});

app.get('/accounts', async function (req, res) {
  res.json((await getAllData(Account)))
});

// Get an account with username
app.get('/account/:username', async function (req, res) {
  res.json((await getDataFromId(Account, "username", req.params.username)))
});

// Add a new account
app.post('/account', async function (req, res) {
  await addData(Account, req.body, res)
});





// This section is for Blockchain Database
////////////////////////////////////////////////////


// Getting the full Blockchain
app.get('/Blockchain', async function (req, res) {
  res.json((await getAllData(Block)))
});

// Get a certain block with index
app.get('/Blockchain/:index', async function (req, res) {
  res.json((await getDataFromId(Block, "index", req.params.index)))
});

// WARNING::
// Add a new account /// This will not exist....
app.post('/addBlock', async function (req, res) {
  await addData(Block, req.body, res)
});

////////////// Upper portion will be depricated
///////////////////////////////////////////////////////////////////////////



////////////////////////////////////////////////////////////////////////////
/////////////////// Transaction Pool section ///////////////////////////////
/////////////////////////////////////////////////////////////////////////////
// Getting the full transaction pool
app.get('/Pool', async function (req, res) {
  res.json((await getAllData(Pool)))
});


// WARNING::
// Add a new transaction/// This will not exist....
app.post('/addTransaction', async function (req, res) {
  await addData(Pool, req.body, res)
});
////////////// Upper portion will be depricated


// Deletes specific transaction....
// ///////////////////////////////////
async function dlt(block) {
  Pool.findOneAndRemove(block, function (err, block) {
    if(err)
    {
      console.log(err);
    }
    else
    {
      console.log("Deleted: ");
      console.log(block);
    }
  })
}
//////////////////////////////////

// Running the server
app.listen(port, function () {
  console.log('Database sarver listening on port: ' + port);
});







