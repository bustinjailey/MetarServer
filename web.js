var express = require("express");
var http = require("http");
var __ = require("underscore");
var fs = require("fs");
var csv = require("csv");
var $ = require("jQuery");
var jsonQuery = require("json-query");
var app = express();
app.use(express.logger());

var lat = "39.0780";
var lon = "-77.5575";

var filePath = "./data/GlobalAirportDatabase.txt";
var transformedData = "";

// Dump CSV in to JSON
csv().from(filePath, {delimiter: ":"}).to.array(function(data){
	transformedData = transformData(data);
	console.log("successful parse and transform");
});

// Only works for USA right now, limited by data
function transformData(origData){
	var newData = [];
	for (var i = 0; i < origData.length; i++){
		var o = origData[i];
		if(o[4] == "USA"){ // Get USA values only
			var latSign = 1;
			var lonSign = 1;
			
			if(o[8] == "S"){
				latSign = -1;
			}		
			if(o[12] == "W" || o[12] == "U"){ // U: unknown, but in USA will always be western hemisphere.
				lonSign = -1;
			}
			
			newData[i] = 
			{
					"icao" : o[0],
					"iata" : o[1],
					"name" : o[2],
					"city" : o[3],
					"country" : o[4],
					"lat" : (parseFloat(o[5]) + parseFloat(o[6])/60 + parseFloat(o[7])/3600) * latSign,
					"lon" : (parseFloat(o[9]) + parseFloat(o[10])/60 + parseFloat(o[11])/3600) * lonSign,
					"alt" : o[13]
			};	
		}
	}
	
	return newData.filter(function(n){return n}); // remove nulls from skipping other countries
}

function distance(x1, y1, x2, y2){
	return Math.sqrt(Math.pow(x2-x1, 2) + Math.pow(y2-y1, 2));
}
 
function getClosestAirport(lat, lon, json) {
	var minDist = null;
	var bestMatch = [];
	
	$.each(json, function(){
		var thisDist = distance(lat, lon, this.lat, this.lon);
		
		if(minDist == null || minDist > thisDist){
			minDist = thisDist;
			bestMatch = this;
		}
	});
	
	return bestMatch;
}

app.get("/", function(req, res){
	// On web request, send data file stuff	
	
	var closestAirport = getClosestAirport(lat, lon, transformedData);
		
	res.send(closestCode);
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
	console.log("Listening on " + port);
});
