<script>
    const STORAGE_KEY = 'priority-matrix-tasks';
    let tasks = [];
    let draggedTask = null;
    let taskCounter = 1;

    window.addEventListener('DOMContentLoaded', () => {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        tasks = JSON.parse(saved);
        taskCounter = tasks.reduce((max, t) => Math.max(max, t.id), 0) + 1;
        renderTasks();
      }
      loadFromURL();
    });

    function addTask() {
      const input = document.getElementById('taskInput');
      const text = input.value.trim();
      if (text) {
        const task = {
          id: taskCounter++,
          text: text,
          x: 50,
          y: 50
        };
        tasks.push(task);
        input.value = '';
        renderTasks();
        saveToLocal();
      }
    }

    function addTaskAtPosition(event) {
      const input = document.getElementById('taskInput');
      const text = input.value.trim();
      if (text) {
        const rect = event.currentTarget.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;

        const task = {
          id: taskCounter++,
          text: text,
          x: Math.max(10, Math.min(90, x)),
          y: Math.max(10, Math.min(90, y))
        };
        tasks.push(task);
        input.value = '';
        renderTasks();
        saveToLocal();
      }
    }

    function removeTask(id) {
      tasks = tasks.filter(task => task.id !== id);
      renderTasks();
      saveToLocal();
    }

    function clearAll() {
      tasks = [];
      renderTasks();
      localStorage.removeItem(STORAGE_KEY);
    }

    function exportData() {
      const data = JSON.stringify(tasks, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'priority-matrix.json';
      a.click();
      URL.revokeObjectURL(url);
    }

    function saveToLocal() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }

    function loadFromURL() {
      const hash = decodeURIComponent(window.location.hash.substring(1));
      if (hash) {
        try {
          const parsed = JSON.parse(atob(hash));
          tasks = parsed;
          taskCounter = tasks.reduce((max, t) => Math.max(max, t.id), 0) + 1;
          renderTasks();
        } catch (e) {
          console.error("Failed to load from URL hash:", e);
        }
      }
    }

    function generateShareLink() {
      const encoded = btoa(JSON.stringify(tasks));
      const url = `${location.origin}${location.pathname}#${encoded}`;
      prompt("Copy your shareable link:", url);
    }

    function getTaskClass(x, y) {
      if (x >= 50 && y <= 50) return 'task-q1';
      if (x < 50 && y <= 50) return 'task-q2';
      if (x < 50 && y > 50) return 'task-q3';
      return 'task-q4';
    }

    function renderTasks() {
      const matrix = document.getElementById('matrix');
      const existingTasks = matrix.querySelectorAll('.task');
      existingTasks.forEach(task => task.remove());

      tasks.forEach(task => {
        const taskEl = document.createElement('div');
        taskEl.className = `task ${getTaskClass(task.x, task.y)}`;
        taskEl.style.left = task.x + '%';
        taskEl.style.top = task.y + '%';

        const textSpan = document.createElement('span');
        textSpan.textContent = task.text;
        textSpan.contentEditable = true;
        textSpan.onblur = () => {
          task.text = textSpan.textContent.trim();
          saveToLocal();
        };

        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove';
        removeBtn.innerHTML = '×';
        removeBtn.onclick = (e) => {
          e.stopPropagation();
          removeTask(task.id);
        };

        taskEl.appendChild(textSpan);
        taskEl.appendChild(removeBtn);

        taskEl.onmousedown = (e) => {
          e.preventDefault();
          draggedTask = task.id;

          const handleMouseMove = (moveEvent) => {
            if (draggedTask === task.id) {
              const rect = matrix.getBoundingClientRect();
              const x = ((moveEvent.clientX - rect.left) / rect.width) * 100;
              const y = ((moveEvent.clientY - rect.top) / rect.height) * 100;

              task.x = Math.max(10, Math.min(90, x));
              task.y = Math.max(10, Math.min(90, y));

              taskEl.style.left = task.x + '%';
              taskEl.style.top = task.y + '%';
              taskEl.className = `task ${getTaskClass(task.x, task.y)}`;
              saveToLocal();
            }
          };

          const handleMouseUp = () => {
            draggedTask = null;
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
          };

          document.addEventListener('mousemove', handleMouseMove);
          document.addEventListener('mouseup', handleMouseUp);
        };

        matrix.appendChild(taskEl);
      });
    }

    document.getElementById('taskInput').addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        addTask();
      }
    });
  </script>
