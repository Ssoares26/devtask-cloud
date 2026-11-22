// DevTask Cloud - Gerenciador de Tarefas
// Armazenamento em localStorage com persistência

class DevTaskCloud {
    constructor() {
        this.tasks = [];
        this.currentFilter = 'all';
        this.taskInput = document.getElementById('task-input');
        this.taskForm = document.getElementById('task-form');
        this.taskList = document.getElementById('task-list');
        this.filterButtons = document.querySelectorAll('.filter-btn');
        this.counterText = document.getElementById('counter-text');

        this.init();
    }

    init() {
        this.loadTasks();
        this.bindEvents();
        this.render();
    }

    loadTasks() {
        const stored = localStorage.getItem('devtask-cloud-tasks');
        if (stored) {
            try {
                this.tasks = JSON.parse(stored);
            } catch (e) {
                console.error('Erro ao carregar tarefas:', e);
                this.tasks = [];
            }
        }
    }

    saveTasks() {
        localStorage.setItem('devtask-cloud-tasks', JSON.stringify(this.tasks));
    }

    bindEvents() {
        this.taskForm.addEventListener('submit', (e) => this.addTask(e));

        this.filterButtons.forEach(btn => {
            btn.addEventListener('click', () => this.setFilter(btn.dataset.filter));
        });
    }

    addTask(e) {
        e.preventDefault();
        const text = this.taskInput.value.trim();
        if (!text) return;

        const task = {
            id: Date.now().toString(),
            text: text,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.tasks.unshift(task);
        this.saveTasks();
        this.taskInput.value = '';
        this.render();
    }

    deleteTask(id) {
        this.tasks = this.tasks.filter(task => task.id !== id);
        this.saveTasks();
        this.render();
    }

    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.render();
        }
    }

    setFilter(filter) {
        this.currentFilter = filter;
        this.filterButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        this.render();
    }

    getFilteredTasks() {
        switch (this.currentFilter) {
            case 'pending':
                return this.tasks.filter(t => !t.completed);
            case 'completed':
                return this.tasks.filter(t => t.completed);
            default:
                return this.tasks;
        }
    }

    updateCounter() {
        const filtered = this.getFilteredTasks();
        const total = this.tasks.length;
        const completed = this.tasks.filter(t => t.completed).length;
        const pending = total - completed;

        let text = '';
        if (this.currentFilter === 'all') {
            text = `${total} tarefa${total !== 1 ? 's' : ''} (${pending} pendente${pending !== 1 ? 's' : ''}, ${completed} concluída${completed !== 1 ? 's' : ''})`;
        } else if (this.currentFilter === 'pending') {
            text = `${pending} tarefa${pending !== 1 ? 's' : ''} pendente${pending !== 1 ? 's' : ''}`;
        } else {
            text = `${completed} tarefa${completed !== 1 ? 's' : ''} concluída${completed !== 1 ? 's' : ''}`;
        }
        this.counterText.textContent = text;
    }

    render() {
        const filteredTasks = this.getFilteredTasks();

        if (filteredTasks.length === 0) {
            this.taskList.innerHTML = `
                <li class="empty-state">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
                    </svg>
                    <p>${this.getEmptyMessage()}</p>
                </li>
            `;
        } else {
            this.taskList.innerHTML = filteredTasks.map(task => `
                <li class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
                    <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} aria-label="Marcar como ${task.completed ? 'pendente' : 'concluída'}">
                    <span class="task-text">${this.escapeHtml(task.text)}</span>
                    <button class="task-delete" aria-label="Excluir tarefa">Excluir</button>
                </li>
            `).join('');

            // Bind events for dynamically created elements
            this.taskList.querySelectorAll('.task-checkbox').forEach(checkbox => {
                checkbox.addEventListener('change', (e) => {
                    const id = e.target.closest('.task-item').dataset.id;
                    this.toggleTask(id);
                });
            });

            this.taskList.querySelectorAll('.task-delete').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = e.target.closest('.task-item').dataset.id;
                    this.deleteTask(id);
                });
            });
        }

        this.updateCounter();
    }

    getEmptyMessage() {
        switch (this.currentFilter) {
            case 'pending':
                return 'Nenhuma tarefa pendente. Ótimo trabalho!';
            case 'completed':
                return 'Nenhuma tarefa concluída ainda.';
            default:
                return 'Nenhuma tarefa cadastrada. Adicione a primeira acima!';
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    new DevTaskCloud();
});