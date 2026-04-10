document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('taskInput');
    const addBtn = document.getElementById('addBtn');
    const taskList = document.getElementById('taskList');

    // 1. Функція для отримання та відображення списку задач (GET)
    async function fetchTasks() {
        try {
            const response = await fetch('/tasks'); // Відправляємо GET запит
            const tasks = await response.json();    // Очікуємо JSON відповідь
            
            renderTasks(tasks); // Малюємо список на екрані
        } catch (error) {
            console.error('Помилка при отриманні задач:', error);
        }
    }

    // Функція для відмальовки списку в HTML
    function renderTasks(tasks) {
        taskList.innerHTML = ''; // Очищуємо список перед оновленням
        
        tasks.forEach(task => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${task.text}</span>
                <button class="delete-btn" onclick="deleteTask(${task.id})">Delete</button>
            `;
            taskList.appendChild(li);
        });
    }

    // 2. Функція для додавання задачі (POST)
    addBtn.addEventListener('click', async () => {
        const text = taskInput.value.trim();
        if (!text) return;

        try {
            const response = await fetch('/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json' // Вказуємо, що відправляємо JSON
                },
                body: JSON.stringify({ text: text }) // Конвертуємо об'єкт у рядок JSON
            });

            if (response.ok) {
                taskInput.value = ''; // Очищуємо поле вводу
                fetchTasks();         // Оновлюємо список задач
            }
        } catch (error) {
            console.error('Помилка при додаванні задачі:', error);
        }
    });

    // 3. Функція для видалення задачі (DELETE)
    // Винесена в global scope (window), щоб працював атрибут onclick в HTML
    window.deleteTask = async (id) => {
        try {
            const response = await fetch(`/tasks/${id}`, {
                method: 'DELETE' // Відправляємо запит на видалення за ID
            });

            if (response.ok) {
                fetchTasks(); // Оновлюємо список після успішного видалення
            }
        } catch (error) {
            console.error('Помилка при видаленні задачі:', error);
        }
    };

    // Автоматично завантажуємо задачі при старті
    fetchTasks();
});