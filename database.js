var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var Account = require('./accountModel');

var port = 8080;
var db = 'mongodb://localhost/PB'
mongoose.connect(db);

app.use(express.json())
app.get('/', function(req, res) {
    res.send('Welcome to Personal-Blockchain');
  });

app.get('/accounts', function(req, res) {
    Account.find({})
      .exec(function(err, accounts) {
        if(err) {
          res.send('error occured')
        } else {
          res.json(accounts);
        }
      });
});


app.get('/accounts/:username', function(req, res) {
    Account.findOne({
      username: req.params.username
      })
      .exec(function(err, accounts) {
        if(err) {
          res.send('Error occured to get Account information!')
        } else {
          res.json(accounts);
        }
      });
  });

  app.post('/account', function(req, res) {
    Account.create(req.body, function(err, account) {
      if(err) {
        console.log(err)
        res.send('Error saving account')
      } else {
        res.send("Account Created")
      }
    });
});



app.listen(port, function() {
  console.log('app listening on port ' + port);
});


module.exports = {port}

