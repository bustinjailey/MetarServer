var express = require('express');
var http = require('http');
var jsonQuery = require('json-query');

var app = express();
app.use(express.logger());
var json = '';

var latlng = '39.0780,-77.5575'

var options = {
	host: 'maps.googleapis.com',
	port: 80,
	path: '/maps/api/geocode/json?latlng=' + latlng + '&sensor=false'
};

http.get(options, function(res) {

	var body = '';

	res.on('data', function(data){
		body += data;
	});

	res.on('end', function(){
		json = JSON.parse(body);
		console.log('json done');
	});

}).on('error', function(e) {
	console.log("Got error: " + e.message);
});

app.get('/', function(req, res){
	var result = jsonQuery('results[types=airport].name', json)
	res.send(json);
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
	console.log('Listening on ' + port);
});
