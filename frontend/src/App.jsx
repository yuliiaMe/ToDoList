import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [text, setText] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [expanded, setExpanded] = useState({});
  
  // Стан для вводу підзадач (текст і дата окремо для кожної задачі)
  const [subInputs, setSubInputs] = useState({}); 

  useEffect(() => { fetchTasks(); }, []);

  const fetchTasks = async () => {
    const res = await fetch('http://localhost:5000/tasks');
    const data = await res.json();
    setTasks(data);
  };

  const addTask = async () => {
    if (!text) return;
    await fetch('http://localhost:5000/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, due_date: date })
    });
    setText('');
    fetchTasks();
  };

  const addSubtask = async (e, taskId) => {
    e.stopPropagation();
    const input = subInputs[taskId] || {};
    if (!input.text || !input.date) {
        alert("Введіть назву та дату підзадачі");
        return;
    }

    await fetch(`http://localhost:5000/tasks/${taskId}/subtasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: input.text, due_date: input.date })
    });

    setSubInputs({ ...subInputs, [taskId]: { text: '', date: input.date } });
    fetchTasks();
  };

  const handleSubInputChange = (taskId, field, value) => {
    setSubInputs({
      ...subInputs,
      [taskId]: { ...(subInputs[taskId] || {date: date}), [field]: value }
    });
  };

  const toggleSub = async (e, id) => {
    e.stopPropagation(); // ЦЕ ВАЖЛИВО: щоб не закривалася картка
    await fetch(`http://localhost:5000/subtasks/${id}/toggle`, { method: 'PATCH' });
    fetchTasks();
  };

  const deleteTask = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Видалити групу задач?")) return;
    await fetch(`http://localhost:5000/tasks/${id}`, { method: 'DELETE' });
    fetchTasks();
  };

  const getStatus = (subs) => {
    if (subs.length === 0) return 'empty';
    const done = subs.filter(s => s.completed).length;
    if (done === subs.length) return 'full';
    return done > 0 ? 'progress' : 'empty';
  };

  return (
    <div className="card">
      <header>
        <i className="fa-solid fa-clipboard-check logo"></i>
        <h1>To-Do List</h1>
      </header>

      <div className="input-row">
        <input value={text} onChange={e => setText(e.target.value)} placeholder="Назва головної задачі..." className="main-input" />
        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="date-input" />
        <button className="add-btn" onClick={addTask}>Add</button>
      </div>

      <div className="task-list">
        {tasks.map(task => {
          const status = getStatus(task.subtasks);
          const done = task.subtasks.filter(s => s.completed).length;
          const total = task.subtasks.length;
          const progress = total > 0 ? (done / total) * 100 : 0;

          return (
            <div key={task.id} className="task-container">
              <div className="task-header" onClick={() => setExpanded({...expanded, [task.id]: !expanded[task.id]})}>
                <div className={`status-icon ${status}`}>
                  {status === 'full' && <i className="fa-solid fa-check"></i>}
                  {status === 'progress' && <i className="fa-solid fa-minus"></i>}
                </div>
                <div className="task-info">
                  <div className="task-title">{task.text}</div>
                  {total > 0 && (
                    <div className="progress-wrapper">
                      <div className="progress-track"><div className="progress-fill" style={{width: `${progress}%`}}></div></div>
                      <span className="count">{done} / {total}</span>
                    </div>
                  )}
                </div>
                <div className="task-meta">
                  <span>{task.due_date.split('-').reverse().join('.')}</span>
                  <i className="fa-regular fa-calendar"></i>
                  <i className="fa-solid fa-trash-can trash" onClick={(e) => deleteTask(e, task.id)}></i>
                  <i className={`fa-solid fa-chevron-${expanded[task.id] ? 'up' : 'down'} arrow`}></i>
                </div>
              </div>

              {expanded[task.id] && (
                <div className="subtasks">
                  {task.subtasks.map(sub => (
                    <div key={sub.id} className="sub-item" onClick={(e) => toggleSub(e, sub.id)}>
                      <div className={`sub-check ${sub.completed ? 'checked' : ''}`}>
                        {sub.completed && <i className="fa-solid fa-check"></i>}
                      </div>
                      <span className="sub-text">{sub.text}</span>
                      <div className="sub-meta">
                        {sub.due_date.split('-').reverse().join('.')} <i className="fa-regular fa-calendar"></i>
                      </div>
                    </div>
                  ))}
                  <div className="sub-input-row" onClick={e => e.stopPropagation()}>
                    <input 
                        value={subInputs[task.id]?.text || ''} 
                        onChange={e => handleSubInputChange(task.id, 'text', e.target.value)} 
                        placeholder="Назва підзадачі..." 
                    />
                    <input 
                        type="date" 
                        value={subInputs[task.id]?.date || date} 
                        onChange={e => handleSubInputChange(task.id, 'date', e.target.value)} 
                    />
                    <button onClick={e => addSubtask(e, task.id)}>+</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;