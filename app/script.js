var activities = [];
var list = null;
var pixelsPerMinute = 1;

addEventListener('load', function() {
	var req = new XMLHttpRequest();
	list = document.querySelector('[data-activity-list]');
	req.open('GET', '/api/activities');
	req.addEventListener('load', function(e) {
		activities = parseActivities(req.response);
		renderActivities();
	});
	req.send();

	var drawer = document.querySelector('.drawer');

	document.querySelector('[data-action=hide-form]').addEventListener('click', function() {
		drawer.classList.remove('open');
		drawer.classList.add('closed');

		list.classList.remove('blurry');
	});

	document.querySelector('[data-action=show-form]').addEventListener('click', function() {
		drawer.classList.remove('closed');
		drawer.classList.add('open');

		list.classList.add('blurry');
	});

	document.querySelector('form').addEventListener('submit', function(e) {
		e.preventDefault();
	});
});

function parseActivities(json) {
	return JSON.parse(json).map(function(x) {
		x.time = Date.create(x.date+'T'+x.time);
		x.date = Date.create(x.date);
		return x;
	}).sort(function(x, y) {
		return x.time - y.time;
	});
}

function renderActivities() {

	while(list.firstChild)
		list.removeChild(list.firstChild);
	
	activities.forEach(function(activity, i, activities) {
		if(!i || activity.date.getTime() != activities[i-1].date.getTime())
			list.appendChild(createDivider(activity.date));
		else
			list.appendChild(createSpacer(activities[i-1], activity));
		list.appendChild(createActivityNode(activity));
	});

	list.lastChild.scrollIntoView();
}

function createSpacer(a, b) {
	var spacer = document.createElement('div');
	spacer.className = 'spacer';
	var minutes = Math.abs(a.time - b.time) / (1000*60);
	spacer.style.marginTop = minutes * pixelsPerMinute + 'px';
	return spacer;
}

function createDivider(date) {
	var node = document.createElement('div');
	node.className = 'divider';
	node.textContent = date.isToday() ? 'today' : date.relative();
	return node;
}

function createActivityNode(activity) {
	var node = document.createElement('div');
	node.className = 'activity';
	
	var ball = document.createElement('div');
	ball.className = 'activity-node';
	node.appendChild(ball);
	if(activity.color)
		ball.style.backgroundColor = activity.color;

	var label = document.createElement('div');
	label.className = 'activity-label';
	node.appendChild(label);
	
	var name = document.createElement('div');
	name.className = 'name';
	name.textContent = activity.name;
	label.appendChild(name);

	var time = document.createElement('time');
	time.textContent = activity.time.format('{hh}:{mm} {tt}}');
	label.appendChild(time);

	return node;
}
