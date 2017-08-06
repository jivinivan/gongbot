var express = require('express');
var Gong = require('./gong')

// Create app
var app = express();
var port = 3700;
var gong = new Gong();

app.get('/gong', function(req, res) {
  if(gong.active) {
    res.send('Gong is gonging. Please try again later.');
  }
  else {
    res.send('Gong sequence Initiated.');
  }
  gong.ring();
})

// Start server
app.listen(port);
console.log('Listening on port ' + port)
