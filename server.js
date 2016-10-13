//-------------------------------------------------------//
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var session = require('express-session');
var fs = require("fs");
var	https = require('https');
//-------------------------------------------------------//
var hskey = fs.readFileSync('key.pem');
var hscert = fs.readFileSync('cert.pem');
var options = {
    key: hskey,
    cert: hscert
};
//-------------------------------------------------------//
// Setting environment
app.set('views', __dirname + '/client/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(session({
    secret: '*********',
    resave: false,
    saveUninitialized: true
}));
app.use(express.static('client'));
//-------------------------------------------------------//
// Start the app by listening on <port>
// var port = process.env.PORT || 443;
var port = process.env.PORT || 4000;
// var server = app.listen(port, function(){
//     console.log("Live Video Chat Server has started on port " + port);
// });
var server = https.createServer(options, app).listen(port, function(){
  console.log("Https server listening on port " + port);
});

//-------------------------------------------------------//
// Database for mongooes
require('./server/dbs');
//-------------------------------------------------------//
// Socket.io for Real Time Chat
require('./server/chatserver')(server);
//-------------------------------------------------------//
// RESTful API for client
require('./server/router')(app,fs);
//-------------------------------------------------------//
