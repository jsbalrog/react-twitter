var express = require('express'),
		exphbs = require('express-handlebars'),
		http = require('http'),
		mongoose = require('mongoose'),
		twitter = require('ntwitter'),
		routes = require('./routes'),
		config = require('./config'),
		streamHandler = require('./utils/streamHandler');

// Create an express instance and set a port variable
var app = express();
var port = process.env.port || 8080;

// Set handlebars as the templating engine
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

// Disable etag headers on responses
app.disable('etag');

// Connect to our mongo database
mongoose.connect('mongodb://localhost/react-tweets');

// Create a new ntwitter instance
var twit = new twitter(config.twitter);

// Index route
app.get('/', routes.index);

// Page route
app.get('/page/:page/:skip', routes.page);

// Set /public as our static content dir
app.use("/", express.static(__dirname + "/public/"));

// Start the server
var server = http.createServer(app).listen(port, function() {
	console.log("Express server listening on port " + port);
});

// Initialize socket.io
var io = require('socket.io').listen(server);

// Set a strea listener for tweets matching tracking keywords
twit.stream('statuses/filter', { track: 'scotch_io, #scotchio' }, function(stream) {
	streamHandler(stream, io);
});
