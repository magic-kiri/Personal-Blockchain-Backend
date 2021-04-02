var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var Account = require('./accountModel');
var Block = require('./BlockchainModel')
var Pool = require('./transactionModel')

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

app.get('/accounts', function (req, res) {
  Account.find({})
    .exec(function (err, accounts) {
      if (err) {
        res.send('error occured')
      } else {
        res.json(accounts);
      }
    });
});

// Get an account with username
app.get('/account/:username', function (req, res) {
  Account.findOne({
    username: req.params.username
  })
    .exec(function (err, accounts) {
      if (err) {
        res.send('Error occured to get Account information!')
      } else {
        res.json(accounts);
      }
    });
});

// Add a new account
app.post('/account', function (req, res) {
  Account.create(req.body, function (err, account) {
    if (err) {
      console.log(err)
      res.send('Error saving account')
    } else {
      res.send("Account Created")
    }
  });
});





// This section is for Blockchain Database
////////////////////////////////////////////////////


// Getting the full Blockchain
app.get('/Blockchain', function (req, res) {
  Block.find({})
    .exec(function (err, blockchain) {
      if (err) {
        res.send('error occured')
      } else {
        res.json(blockchain);
      }
    });
});

// Get a certain block with index
app.get('/Blockchain/:index', function (req, res) {
  Block.findOne({
    index: req.params.index
  })
    .exec(function (err, block) {
      if (err) {
        res.send('Error occured to get Account information!')
      } else {
        res.json(block);
      }
    });
});


// WARNING::
// Add a new account /// This will not exist....
app.post('/addBlock', function (req, res) {
  Block.create(req.body, function (err, block) {
    if (err) {
      console.log(err)
      res.send('Error saving account')
    } else {
      res.send("Account Created")
    }
  });
});

////////////// Upper portion will be depricated
///////////////////////////////////////////////////////////////////////////
// Transaction Pool section 

// Getting the full transaction pool
app.get('/Pool', function (req, res) {
  Pool.find({})
    .exec(function (err, transaction) {
      if (err) {
        res.send('error occured')
      } else {
        res.json(transaction);
      }
    });
});


// WARNING::
// Add a new transaction/// This will not exist....
app.post('/addTransaction', function (req, res) {
  Pool.create(req.body, function (err, account) {
    if (err) {
      console.log(err)
      res.send('Error saving account')
    } else {
      res.send("Account Created")
    }
  });
});
////////////// Upper portion will be depricated


// Running the server
app.listen(port, function () {
  console.log('Database sarver listening on port: ' + port);
});
