var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');

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
app.get('/', function(req, res){
	res.send('Todo API Root');
});

// GET /todos
app.get('/todos', function(req, res){
	res.json(todos);
});

// GET /todos/:id
app.get('/todos/:id', function(req, res){
	var todoId = parseInt(req.params.id, 10);
	var matchedTodo = _.findWhere(todos,{id: todoId});
	// var matchedTodo;

	// todos.forEach(function (todo) {
	// 	if(todoId === todo.id) {
	// 		matchedTodo = todo;
	// 	}
	// });

	if (matchedTodo) {
		res.json(matchedTodo);	
	} else {
		res.status(404).send();
	}
	
});

// POST /todos

app.post('/todos', function(req, res) {
	//var body = req.body;
	var body = _.pick(req.body, 'description', 'completed');

	if(!_.isBoolean(body.completed) || (!_.isString(body.description) || body.description.trim().length === 0)){
		return res.status(400).send();
	}

	body.description = body.description.trim();
	
	body.id = todoNextId++;
	todos.push(body);

	//console.log(todos[0])
	res.json(body);
});

app.listen(PORT, function (){
	console.log('Express listening on port ' + PORT + '!');
});