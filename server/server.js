var mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/TodoApp');

var Todo = mongoose.model('Todo', {
    text: {
        type: String
    },
    completed: {
        type: Boolean
    },
    completedAt: {
        type: Number
    }
});

var newTodo = new Todo({
    text: 'Walk the dog',
    completed: 'true',
    completedAt: 5
});

newTodo.save().then( (res) => {
    console.log('Saved todo', res)
}, (err) => {
    console.log('Unable to save todo', err)
});