var activities = [];
var list = null;
var pixelsPerMinute = 1;

addEventListener('load', function() {
	getActivities();

	document.querySelector('[data-action=show-form]').addEventListener('click', openDrawer);
	document.querySelector('[data-action=hide-form]').addEventListener('click', closeDrawer);

	var form = document.querySelector('form');
	form.addEventListener('submit', function(e) {
		try {
			var req = submitForm(form);
			req.addEventListener('load', function(loadEvent) {
				if(req.status == 200) {
					activities.push(hydrateActivity(JSON.parse(req.responseText)));
					renderActivities();
					closeDrawer();
				}
				else
					alert("Something broke :/");
			});
		} finally {
			e.preventDefault();
		}
	});
});

function openDrawer() {
	var drawer = document.querySelector('.drawer');
	drawer.classList.remove('closed');
	drawer.classList.add('open');

	var now = new Date();
	document.querySelector('[name=time]').value = now.format('{HH}:{mm}');
	document.querySelector('[name=date]').value = now.format('{yyyy}-{MM}-{dd}');

	list.classList.add('blurry');
}

function closeDrawer() {
	var drawer = document.querySelector('.drawer');
	drawer.classList.remove('open');
	drawer.classList.add('closed');

	list.classList.remove('blurry');
}

function getActivities() {
	var req = new XMLHttpRequest();
	list = document.querySelector('[data-activity-list]');
	req.open('GET', '/api/activities');
	req.addEventListener('load', function(e) {
		activities = parseActivities(req.response);
		renderActivities();
	});
	req.send();
}

function parseActivities(json) {
	return JSON.parse(json).map(hydrateActivity).sort(function(x, y) {
		return x.time - y.time;
	});
}

function hydrateActivity(obj) {
	obj.time = Date.create(obj.date+'T'+obj.time);
	obj.date = Date.create(obj.date);
	return obj;
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

function submitForm(form) {
	var payload = {};
	for(var i = 0; i < form.elements.length; i++) {
		if(form.elements[i].name)
			payload[form.elements[i].name] = form.elements[i].value;
	}
	var req = new XMLHttpRequest();
	req.open(form.method, form.action);
	req.setRequestHeader('Content-Type', 'application/json');
	req.send(JSON.stringify(payload));
	return req;
}
