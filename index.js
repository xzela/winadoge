var express = require('express'),
	connect = require('connect'),
	RedisStore = require('connect-redis')(express),
	redis = require('redis'),
	http = require('http');

var app = express();

app.configure(function () {
	app.set('port', process.env.npm_package_config_port || 3000);
	app.use(express.cookieParser('tothemoon'));
	app.use(express.session({
		key: 'dogekie',
		store: new RedisStore({
			prefix: 'doge:::',
			host: '',
			port: 6379,
			client: redis.createClient()
		}),
		secret: 'tothemoon',
		cookie: {
			maxAge: 60 * 60 * 1000,
			secure: false,
			path: '/'
		}
	}));
});


app.get('/', function (request, response) {
	console.dir(request.sessionID);
	request.session.user = {
		name: 'username',
		time: Math.random()
	};
	var json = {
		sessionID: request.sessionID
	};
	if (request.cookies) {
		json['session'] = request.session;
		json['cookies'] = request.cookies;
	}
	response.json(json);
});
app.get('/login', function (request, response) {
	response.cookie('rememberme', true);
	response.cookie('sessionID', request.sessionID);
	var json = {
		sessionID: request.sessionID,
		session: request.session,
		cookie: request.cookies,
	};
	response.json(json);
});

app.get('/who', function (request, response) {
	var json = {
		sessionID: request.sessionID
	};
	json['session'] = request.session;
	response.json(json);
});

app.get('/update', function (request, response) {
	var json = {
		sessionID: request.sessionID
	};
	if (request.session.user !== undefined) {
		request.session.user.time = Math.random();
	} else {
		request.session.user = {
			name: 'update-set',
			time: Math.random()
		};
	}

	json['session'] = request.session;
	response.json(json);
});

app.get('/logout', function (request, response) {
	request.session.destroy();
	var json = {
		session: request.session
	};
	response.json(json);
});

http.createServer(app).listen(app.get('port'), function () {
	console.log('Express server listening on port ' + app.get('port'));
});
