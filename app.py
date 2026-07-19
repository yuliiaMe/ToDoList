from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+mysqlconnector://root:YOUR_PASSWORD@localhost/todo_db'
db = SQLAlchemy(app)

class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.String(200), nullable=False)
    due_date = db.Column(db.String(10), nullable=False)
    subtasks = db.relationship('Subtask', backref='task', cascade="all, delete-orphan", lazy=True)

class Subtask(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.String(200), nullable=False)
    due_date = db.Column(db.String(10), nullable=False) # Додаємо дату
    completed = db.Column(db.Boolean, default=False)
    task_id = db.Column(db.Integer, db.ForeignKey('task.id'), nullable=False)

with app.app_context():
    db.create_all()

@app.route('/tasks', methods=['GET'])
def get_tasks():
    tasks = Task.query.all()
    return jsonify([{
        "id": t.id, "text": t.text, "due_date": t.due_date,
        "subtasks": [{"id": s.id, "text": s.text, "completed": s.completed, "due_date": s.due_date} for s in t.subtasks]
    } for t in tasks])

@app.route('/tasks', methods=['POST'])
def add_task():
    data = request.get_json()
    new_task = Task(text=data['text'], due_date=data['due_date'])
    db.session.add(new_task)
    db.session.commit()
    return jsonify({"id": new_task.id}), 201

@app.route('/tasks/<int:task_id>/subtasks', methods=['POST'])
def add_subtask(task_id):
    data = request.get_json()
    new_sub = Subtask(text=data['text'], due_date=data['due_date'], task_id=task_id)
    db.session.add(new_sub)
    db.session.commit()
    return jsonify({"success": True}), 201

@app.route('/subtasks/<int:id>/toggle', methods=['PATCH'])
def toggle_subtask(id):
    sub = Subtask.query.get_or_404(id)
    sub.completed = not sub.completed
    db.session.commit()
    return jsonify({"success": True})

@app.route('/tasks/<int:id>', methods=['DELETE'])
def delete_task(id):
    task = Task.query.get_or_404(id)
    db.session.delete(task)
    db.session.commit()
    return jsonify({"success": True})

if __name__ == '__main__':
    app.run(debug=True, port=5000)