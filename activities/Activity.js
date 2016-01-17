var dateRE = /\d{4}-\d{2}-\d{2}/;
var timeRE = /\d{2}:\d{2}:\d{2}/;

var required = ['name', 'date', 'time'];

function Activity(json) {
	required.forEach(function(field) {
		if(!(field in json))
			throw new Error("Missing required field "+field);
	});

	if(!timeRE.test(json.time))
		throw new Error("Time must be in the format "+timeRE);

	if(!dateRE.test(json.date))
		throw new Error("Date must be in the format "+dateRE);

	if('id' in json)
		this.id = json.id;
	
	this.name = json.name;
	this.date = json.date;
	this.time = json.time;
}

module.exports = Activity;
