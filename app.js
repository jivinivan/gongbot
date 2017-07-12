// Requires
var express = require('express');
var path = require('path');
var querystring = require("querystring");
var url = require('url');
var gong = require('./gong.js');
var gongActive = false;

// Create app
var app = express();
var port = 3700;

// Set views
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'views')));

// Serve files
app.get('/interface', function(request, response){
  response.sendfile('views/interface.html')
});

// Send commands to PI
app.get("/gong", function(req, res){

  if(!gongActive) {
    gongActive = true;
    gong.gong( 0.10, 0.25, 3000 ).then(function(){
      gong.gong( 0.25, 0.10, 0 ).then(function(){
        gong.gong( 0.10, 0.11, 0 ).then(function(){
          gong.gong( 0.11, 0.10, 2000 ).then(function(){
            gong.gong( 0.10, 0, 0 ).then(function(){
              gongActive = false;
            });
          });
        });
      });
    });
    res.send('Gong sequence Initiated.');
  } else {
    res.send('Gong is gonging. Please try again later.');
  }
});

// Start server
app.listen(port);
console.log("Listening on port " + port);
