var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');
var bcrypt = require('bcryptjs');
var middleware = require('./middleware.js')(db);

var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());

//data  used earlier for the todos array
/*{
	id: 1,
	description: 'Meet Ben for lunch',
	completed: false
},{
	id: 2,
	description: 'Go to market',
	completed: false
},{
	id: 3,
	description: 'Buy lunch',
	completed: true
}
*/
app.get('/', function(req, res) {
	res.send('Todo API Root');
});

// GET /todos
app.get('/todos', middleware.requireAuthentication, function(req, res) {
	var query = req.query;
	var where = {};

	if (query.hasOwnProperty('completed') && query.completed === 'true') {
		where.completed = true;
	} else if (query.hasOwnProperty('completed') && query.completed === 'false') {
		where.completed = false;
	}

	if (query.hasOwnProperty('q') && query.q.length > 0) {
		where.description = {
			$like: '%' + query.q + '%'
		};
	}

	db.todo.findAll({
		where: where
	}).then(function(todos) {
		res.json(todos);
	}, function(e) {
		res.ststus(500).send();
	});


	//var filteredTodos = todos;

	//console.log(filteredTodos);

	// if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'true') {
	// 	filteredTodos = _.where(filteredTodos, {
	// 		completed: true
	// 	});
	// } else if (queryParams.hasOwnProperty('completed') && queryParams.completed == 'false') {
	// 	filteredTodos = _.where(filteredTodos, {
	// 		completed: false
	// 	});
	// }
	// if has property && completed == 'true'
	// filteredTodos = _.where(filteredTodos, ?)
	// else if has prop && completed if 'false'
	// if (queryParams.hasOwnProperty('q') && queryParams.q.length > 0) {
	// 	filteredTodos = _.filter(filteredTodos, function(todo) {
	// 		return todo.description.toLowerCase().indexOf(queryParams.q) > -1;
	// 	});
	// }


	// res.json(filteredTodos);
});

// GET /todos/:id
app.get('/todos/:id',middleware.requireAuthentication, function(req, res) {
	var todoId = parseInt(req.params.id, 10);

	db.todo.findById(todoId).then(function(todo) {
		if (!!todo) {
			res.json(todo.toJSON());
		} else {
			// res.status(404).send();
			res.status(404).json({
				"error": "no todo found with that id"
			});
		}
	}, function(e) {
		res.status(500).send();
	});
	// var matchedTodo = _.findWhere(todos, {
	// 	id: todoId
	// });
	// var matchedTodo;

	// todos.forEach(function (todo) {
	// 	if(todoId === todo.id) {
	// 		matchedTodo = todo;
	// 	}
	// });

	// if (matchedTodo) {
	// 	res.json(matchedTodo);
	// } else {
	// 	res.status(404).send();
	// }

});

// POST /todos

app.post('/todos', middleware.requireAuthentication, function(req, res) {
	//var body = req.body;
	var body = _.pick(req.body, 'description', 'completed');

	console.log('Body is' + body);

	db.todo.create(body).then(function(todo) {
		res.json(todo.toJSON());
		//todos.push(todo);
	}, function(e) {
		res.status(400).json(e);
	});

	/*if (!_.isBoolean(body.completed) || (!_.isString(body.description) || body.description.trim().length === 0)) {
		return res.status(400).send();
	}

	body.description = body.description.trim();

	body.id = todoNextId++;
	todos.push(body);

	//console.log(todos[0])
	res.json(body);*/
});

// DELETE /todos/:id
app.delete('/todos/:id', middleware.requireAuthentication, function(req, res) {
	var todoId = parseInt(req.params.id, 10);

	db.todo.destroy({
		where: {
			id: todoId
		}
	}).then(function(rowsDeleted) {
		if (rowsDeleted === 0) {
			res.status(404).json({
				error: 'No todo with id'
			});
		} else {
			res.status(204).send();
		}
	}, function(e) {
		res.status(500).send();
	});
	// var matchedTodo = _.findWhere(todos, {
	// 	id: todoId
	// });

	// if (!matchedTodo) {
	// 	res.status(404).json({
	// 		"error": "no todo found with that id"
	// 	});
	// } else {
	// 	todos = _.without(todos, matchedTodo);
	// 	res.json(matchedTodo);
	// }
});

// PUT
app.put('/todos/:id', middleware.requireAuthentication, function(req, res) {
	var todoId = parseInt(req.params.id, 10);
	// var matchedTodo = _.findWhere(todos, {
	// 	id: todoId
	// });
	var body = _.pick(req.body, 'description', 'completed');
	var attributes = {};

	// if (!matchedTodo) {
	// 	return res.status(404).send();
	// }

	if (body.hasOwnProperty('completed')) {
		attributes.completed = body.completed;
	}

	if (body.hasOwnProperty('description')) {
		attributes.description = body.description;
	}

	console.log('todo id is ' + todoId);
	db.todo.findById(todoId).then(function(todo) {

		console.log('todo is ' + todo);
		if (todo) {
			console.log('About to update attributes')
			todo.update(attributes).then(function(todo) {
				console.log('About to send JSON response')
				res.json(todo.toJSON());

			}, function(e) {
				console.log('Unable to update attributes')
				res.status(400).json(e);
			});
		} else {
			console.log('No todo found')
			res.status(404).send();
		}
	}, function(e) {
		console.log('Unable to findById')
		res.status(500).send();
	});

});

// PUT
// app.put('/todos/:id', function(req, res) {
// 	var todoId = parseInt(req.params.id, 10);
// 	var matchedTodo = _.findWhere(todos, {
// 		id: todoId
// 	});
// 	var body = _.pick(req.body, 'description', 'completed');
// 	var validAttributes = {};

// 	if (!matchedTodo) {
// 		return res.status(404).send();
// 	}

// 	if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
// 		validAttributes.completed = body.completed;
// 	} else if (body.hasOwnProperty('completed')) {
// 		return res.status(400).send();
// 	}

// 	if (body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0) {
// 		validAttributes.description = body.description;
// 	} else if (body.hasOwnProperty('description')) {
// 		return res.status(400).send();
// 	}

// 	_.extend(matchedTodo, validAttributes);
// 	res.json(matchedTodo);

// });

app.post('/users', function(req, res) {
	//var body = req.body;
	var body = _.pick(req.body, 'email', 'password');

	db.user.create(body).then(function(user) {
		res.json(user.toPublicJSON());
		//todos.push(todo);
	}, function(e) {
		res.status(400).json(e);
	});

	/*if (!_.isBoolean(body.completed) || (!_.isString(body.description) || body.description.trim().length === 0)) {
		return res.status(400).send();
	}

	body.description = body.description.trim();

	body.id = todoNextId++;
	todos.push(body);

	//console.log(todos[0])
	res.json(body);*/
});

//POST /users/login
app.post('/users/login', function(req, res) {
	var body = _.pick(req.body, 'email', 'password');

	db.user.authenticate(body).then(function(user) {
		//res.json(user.toPublicJSON());
		var token = user.generateToken('authentication');

		if(token){
			res.header('Auth', token).json(user.toPublicJSON());	
		} else {
			res.status(401).send();
		}
		
	}, function() {
		res.status(401).send();
	});

	// if (typeof body.email !== 'string' || typeof body.password !== 'string') {
	// 	return res.status(400).send();
	// }

	// db.user.findOne({
	// 	where: {
	// 		email: body.email
	// 	}
	// }).then(function(user) {
	// 	if (!user || !bcrypt.compareSync(body.password, user.get('password_hash'))) {
	// 		return res.status(401).send();
	// 	} else {
	// 		console.log('User found!!!')
	// 	}


	// 	res.json(user.toPublicJSON());

	// }, function(e) {
	// 	res.status(500).send();
	// });

})

db.sequelize.sync({
	force: true,
	logging: console.log
}).then(function() {
	app.listen(PORT, function() {
		console.log('Express listening on port ' + PORT + '!');
	});
});