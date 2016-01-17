addEventListener('load', function() {
	var req = new XMLHttpRequest();
	req.open('GET', '/api/activities');
	req.responseType = 'json';
	req.addEventListener('load', function(e) {
		addActivities(req.response);
	});
	req.send();
});

function addActivities(activities) {
	var ol = document.querySelector('ol');
	activities.forEach(function(activity) {
		var li = document.createElement('li');
		li.innerText = activity.name;
		ol.appendChild(li);
	});
}
