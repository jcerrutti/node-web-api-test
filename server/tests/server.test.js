const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');

const { app } = require('./../server');
const { Todo } = require('./../models/todo');

const todos = [
    {
        _id: new ObjectID(),
        text: 'First test todo'
    },
    {
        _id: new ObjectID(),
        text: 'Second test todo'
    }
];

beforeEach((done) => {
    Todo.remove({}).then(() => {
        Todo.insertMany(todos);
    }).then(() => done());
});

describe('POST /todos', () => {
    it('Should create a new todo', (done) => {
        const text = 'Test todo text';

        request(app)
            .post('/todos')
            .send({ text })
            .expect(200)
            .expect((res) => {
                expect(res.body.text).toBe(text);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                return Todo.find({ text }).then((todos) => {
                    expect(todos.length).toBe(1);
                    expect(todos[0].text).toBe(text);
                    done();
                }).catch(e => done(e));
            });
    });

    it('should not create todo with invalid body status', (done) => {
        request(app)
            .post('/todos')
            .send({})
            .expect(400)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                Todo.find().then((todos) => {
                    expect(todos.length).toBe(2);
                    done();
                }).catch(e => done(e));
            });
    });
});

describe('GET /todos', () => {
    it('Should get all todos', (done) => {
        request(app)
            .get('/todos')
            .expect(200)
            .expect((res) => {
                expect(res.body.todos.length).toBe(2);
            })
            .end(done);
    });
});

describe('GET /todos/:id', () => {
    it('Should return todo doc', (done) => {
        request(app)
            .get(`/todos/${todos[0]._id.toHexString()}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(todos[0].text);
            })
            .end(done);
    });

    it('Should return 404 if todo not found', (done) => {
        const id = new ObjectID().toHexString();
        request(app)
            .get(`/todos/${id}`)
            .expect(404)
            .expect((res) => {
                expect(res.body.todo).toBe();
            })
            .end(done);
    });

    it('Should return 404 for non-objects ids', (done) => {
        request(app)
            .get('/todos/123abc')
            .expect(404)
            .end(done);
    });
});

describe('DELETE /todos/:id', () => {
    it('Should remove a todo', (done) => {
        const id = todos[0]._id.toHexString();
        request(app)
            .delete(`/todos/${id}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo._id).toBe(id);
            })
            .end((err, res) => {
                if (err) {
                    done(err);
                }

                Todo.findById(id).then((todo) => {
                    expect(todo).toBeFalsy();
                    done();
                }).catch(e => done(e));
            });
    });

    it('Should return 404 if todo not found', (done) => {
        const id = new ObjectID().toHexString();
        request(app)
            .delete(`/todos/${id}`)
            .expect(404)
            .end(done);
    });

    it('Should return 404 if object id is invalid', (done) => {
        request(app)
            .delete('/todos/123abc')
            .expect(404)
            .end(done);
    });
});
