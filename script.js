document.addEventListener("DOMContentLoaded", () => {
  const taskForm = document.getElementById("task-form");
  const taskList = document.getElementById("task-list");
  const filterInput = document.getElementById("filter-input");
  const statusFilter = document.getElementById("status-filter");
  const exportButton = document.getElementById("export-btn");
  const prevPageButton = document.getElementById("prev-page");
  const nextPageButton = document.getElementById("next-page");
  const currentPageSpan = document.getElementById("current-page");

  const TASKS_PER_PAGE = 10; // Número máximo de tarefas por página
  let currentPage = 1; // Página inicial
  let allTasks = []; // Todas as tarefas carregadas
  let taskBeingEdited = null; // Variável para armazenar a tarefa sendo editada

  // Função para carregar tarefas do LocalStorage
  function loadTasks() {
    allTasks = JSON.parse(localStorage.getItem("tasks")) || [];
    renderTasks();
  }

  // Função para salvar tarefas no LocalStorage
  function saveTask(name, deadline, status) {
    allTasks.push({ name, deadline, status });
    localStorage.setItem("tasks", JSON.stringify(allTasks));
    renderTasks();
  }

  // Função para remover uma tarefa do LocalStorage
  function deleteTaskFromStorage(name) {
    allTasks = allTasks.filter((task) => task.name !== name);
    localStorage.setItem("tasks", JSON.stringify(allTasks));
    renderTasks();
  }

  // Função para atualizar tarefa no LocalStorage
  function updateTaskInStorage(oldName, newName, newDeadline) {
    allTasks = allTasks.map((task) =>
      task.name === oldName ? { ...task, name: newName, deadline: newDeadline } : task
    );
    localStorage.setItem("tasks", JSON.stringify(allTasks));
    renderTasks();
  }

  // Função para criar uma linha de tarefa na tabela
  function createTaskElement(task) {
    const { name, deadline, status } = task;
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${name}</td>
      <td>${deadline}</td>
      <td class="status ${status === "Executado" ? "completed" : "pending"}">${status}</td>
      <td><button class="complete-btn">Completar</button></td>
      <td><button class="edit-btn">Editar</button></td>
      <td><button class="delete-btn">Excluir</button></td>
    `;

    row.querySelector(".complete-btn").addEventListener("click", () => {
      task.status = "Executado";
      updateTaskInStorage(task.name, task.name, task.deadline);
    });

    row.querySelector(".edit-btn").addEventListener("click", () => {
      document.getElementById("task-name").value = name;
      document.getElementById("task-deadline").value = deadline;
      taskBeingEdited = task; // Define a tarefa como a que está sendo editada
    });

    row.querySelector(".delete-btn").addEventListener("click", () => {
      deleteTaskFromStorage(name);
    });

    return row;
  }

  // Função para renderizar as tarefas na página atual
  function renderTasks() {
    taskList.innerHTML = "";
    const startIndex = (currentPage - 1) * TASKS_PER_PAGE;
    const tasksToShow = allTasks.slice(startIndex, startIndex + TASKS_PER_PAGE);

    tasksToShow.forEach((task) => {
      taskList.appendChild(createTaskElement(task));
    });

    updatePagination();
  }

  // Função para atualizar os controles de paginação
  function updatePagination() {
    const totalPages = Math.ceil(allTasks.length / TASKS_PER_PAGE);

    prevPageButton.disabled = currentPage === 1;
    nextPageButton.disabled = currentPage === totalPages || totalPages === 0;

    currentPageSpan.textContent = `Página ${currentPage}`;
  }

  // Event listeners para os botões de paginação
  prevPageButton.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      renderTasks();
    }
  });

  nextPageButton.addEventListener("click", () => {
    if (currentPage < Math.ceil(allTasks.length / TASKS_PER_PAGE)) {
      currentPage++;
      renderTasks();
    }
  });

  // Função para exportar tarefas para Excel
  exportButton.addEventListener("click", () => {
    const worksheetData = [["Nome da Tarefa", "Prazo", "Status"], ...allTasks.map(task => [task.name, task.deadline, task.status])];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Tarefas");
    XLSX.writeFile(workbook, "tarefas.xlsx");
  });

  // Função para filtrar tarefas
  function filterTasks() {
    const filterText = filterInput.value.toLowerCase();
    const statusValue = statusFilter.value;

    const filteredTasks = allTasks.filter((task) => {
      const matchesName = task.name.toLowerCase().includes(filterText);
      const matchesStatus =
        statusValue === "all" || task.status.toLowerCase() === statusValue;

      return matchesName && matchesStatus;
    });

    taskList.innerHTML = "";
    filteredTasks.forEach((task) => {
      taskList.appendChild(createTaskElement(task));
    });

    updatePagination();
  }

  // Event listeners para filtros
  filterInput.addEventListener("input", filterTasks);
  statusFilter.addEventListener("change", filterTasks);

  // Event listener para adicionar ou editar tarefas
  taskForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const taskName = document.getElementById("task-name").value.trim();
    const taskDeadline = document.getElementById("task-deadline").value;

    if (!taskName || !taskDeadline) {
      alert("Por favor, preencha todos os campos.");
      return;
    }

    if (taskBeingEdited) {
      // Atualiza a tarefa existente no LocalStorage
      updateTaskInStorage(taskBeingEdited.name, taskName, taskDeadline);
      taskBeingEdited = null; // Reseta a variável de edição
    } else {
      // Adiciona uma nova tarefa
      saveTask(taskName, taskDeadline, "Pendente");
    }

    taskForm.reset();
  });

  // Carregar tarefas ao iniciar
  loadTasks();
});
