
        // DOM Elements
        const taskInput = document.getElementById('task-input');
        const addBtn = document.getElementById('add-btn');
        const taskList = document.getElementById('task-list');
        const filterBtns = document.querySelectorAll('.filter-btn');
        const totalTasksEl = document.getElementById('total-tasks');
        const completedTasksEl = document.getElementById('completed-tasks');
        const remainingTasksEl = document.getElementById('remaining-tasks');

        // State
        let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        let currentFilter = 'all';

        // Initialize the app
        function init() {
            renderTasks();
            updateStats();
            
            // Event Listeners
            addBtn.addEventListener('click', addTask);
            taskInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') addTask();
            });
            
            filterBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    filterBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    currentFilter = btn.dataset.filter;
                    renderTasks();
                });
            });
        }

        // Add a new task
        function addTask() {
            const text = taskInput.value.trim();
            
            if (text === '') {
                alert('Please enter a task!');
                taskInput.focus();
                return;
            }
            
            const newTask = {
                id: Date.now(),
                text: text,
                completed: false,
                createdAt: new Date().toISOString()
            };
            
            tasks.push(newTask);
            saveTasks();
            renderTasks();
            updateStats();
            
            // Reset input
            taskInput.value = '';
            taskInput.focus();
        }

        // Toggle task completion
        function toggleTask(id) {
            tasks = tasks.map(task => {
                if (task.id === id) {
                    return { ...task, completed: !task.completed };
                }
                return task;
            });
            
            saveTasks();
            renderTasks();
            updateStats();
        }

        // Edit a task
        function editTask(id) {
            const taskItem = document.querySelector(`[data-id="${id}"]`);
            const taskText = taskItem.querySelector('.task-text');
            const currentText = tasks.find(task => task.id === id).text;
            
            const editInput = document.createElement('input');
            editInput.type = 'text';
            editInput.className = 'edit-input';
            editInput.value = currentText;
            
            taskText.replaceWith(editInput);
            editInput.focus();
            
            // Save on Enter or Blur
            const saveEdit = () => {
                const newText = editInput.value.trim();
                if (newText && newText !== currentText) {
                    tasks = tasks.map(task => {
                        if (task.id === id) {
                            return { ...task, text: newText };
                        }
                        return task;
                    });
                    saveTasks();
                }
                renderTasks();
            };
            
            editInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') saveEdit();
            });
            
            editInput.addEventListener('blur', saveEdit);
        }

        // Delete a task
        function deleteTask(id) {
            if (confirm('Are you sure you want to delete this task?')) {
                tasks = tasks.filter(task => task.id !== id);
                saveTasks();
                renderTasks();
                updateStats();
            }
        }

        // Save tasks to localStorage
        function saveTasks() {
            localStorage.setItem('tasks', JSON.stringify(tasks));
        }

        // Update task statistics
        function updateStats() {
            const total = tasks.length;
            const completed = tasks.filter(task => task.completed).length;
            const remaining = total - completed;
            
            totalTasksEl.textContent = `Total: ${total}`;
            completedTasksEl.textContent = `Completed: ${completed}`;
            remainingTasksEl.textContent = `Remaining: ${remaining}`;
        }

        // Render tasks based on current filter
        function renderTasks() {
            // Filter tasks
            let filteredTasks = tasks;
            if (currentFilter === 'active') {
                filteredTasks = tasks.filter(task => !task.completed);
            } else if (currentFilter === 'completed') {
                filteredTasks = tasks.filter(task => task.completed);
            }
            
            // Clear the list
            taskList.innerHTML = '';
            
            // Show empty state if no tasks
            if (filteredTasks.length === 0) {
                const emptyState = document.createElement('div');
                emptyState.className = 'empty-state';
                
                let message = '';
                if (currentFilter === 'all') {
                    message = 'No tasks yet. Add a task to get started!';
                } else if (currentFilter === 'active') {
                    message = 'No active tasks. Great job!';
                } else if (currentFilter === 'completed') {
                    message = 'No completed tasks yet.';
                }
                
                emptyState.innerHTML = `
                    <svg width="120" height="120" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        <path d="M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5C15 6.10457 14.1046 7 13 7H11C9.89543 7 9 6.10457 9 5Z" stroke="currentColor" stroke-width="2"/>
                        <path d="M9 12H15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        <path d="M9 16H15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                    <p>${message}</p>
                `;
                
                taskList.appendChild(emptyState);
                return;
            }
            
            // Render tasks
            filteredTasks.forEach(task => {
                const taskItem = document.createElement('li');
                taskItem.className = `task-item ${task.completed ? 'completed' : ''}`;
                taskItem.setAttribute('data-id', task.id);
                
                taskItem.innerHTML = `
                    <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                    <span class="task-text ${task.completed ? 'completed' : ''}">${task.text}</span>
                    <div class="task-actions">
                        <button class="edit-btn" title="Edit task">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                                <path d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </button>
                        <button class="delete-btn" title="Delete task">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M3 6H5H21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                                <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                                <path d="M10 11V17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                                <path d="M14 11V17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                            </svg>
                        </button>
                    </div>
                `;
                
                // Add event listeners
                const checkbox = taskItem.querySelector('.task-checkbox');
                const editBtn = taskItem.querySelector('.edit-btn');
                const deleteBtn = taskItem.querySelector('.delete-btn');
                
                checkbox.addEventListener('change', () => toggleTask(task.id));
                editBtn.addEventListener('click', () => editTask(task.id));
                deleteBtn.addEventListener('click', () => deleteTask(task.id));
                
                taskList.appendChild(taskItem);
            });
        }

        // Initialize the app
        document.addEventListener('DOMContentLoaded', init);
    