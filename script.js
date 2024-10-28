// Elements
const todoContainer = document.querySelector(".todo-container");
const todoForm = document.querySelector("#todo-form");
const todoInput = document.querySelector("#todo-input");
const todoList = document.querySelector("#todo-list");
const editForm = document.querySelector("#edit-form");
const editInput = document.querySelector("#edit-input");
const cancelEditBtn = document.querySelector("#cancel-edit-btn");
const searchInput = document.querySelector("#search-input");
const eraseBtn = document.querySelector("#erase-button");
const filterBtn = document.querySelector("#filter-select");
const resetButton = document.getElementById("reset-button");
const confirmReset = document.getElementById("confirm-reset");
const confirmButton = document.getElementById("confirm-button");
const tasksCounter = document.getElementById("tasks-counter");
const colorPicker = document.getElementById('color-picker');
const textPicker = document.getElementById('text-picker');
const dropdownButton = document.getElementById('dropdown-button');
const dropdownMenu = document.getElementById('dropdown-menu');
const bellButton = document.getElementById('bell-button');
const dropdownBell = document.getElementById('dropdown-bell');
const column = document.getElementById("todo-list");

function updateTaskCount() {
    const todos = document.querySelectorAll(".todo").length;
    const done = document.querySelectorAll(".done").length;
    tasksCounter.innerText = `${done} / ${todos}`;
}

updateTaskCount();

// Background Local Storage
function applyBackgroundAndColors() {
    const todoBg = localStorage.getItem('todoBackground');
    const bodyBg = localStorage.getItem('bodyBackground');
    const todoColor = localStorage.getItem('todoColor');
    const textColor = localStorage.getItem('textColor');

    if (todoBg) todoContainer.style.backgroundImage = todoBg;
    if (bodyBg) document.body.style.backgroundImage = bodyBg;
    if (todoColor) todoContainer.style.backgroundColor = todoColor;
    if (textColor) document.body.style.color = textColor;
}

// Apply Backgrounds on Load
window.onload = applyBackgroundAndColors;
// Drag-and-drop
document.addEventListener("dragstart", (e) => e.target.classList.add("dragging"));
document.addEventListener("dragend", (e) => e.target.classList.remove("dragging"));

column.addEventListener("dragover", (e) => {
    e.preventDefault();
    const dragging = document.querySelector(".dragging");
    const applyAfter = getNewPosition(column, e.clientY);
    if (applyAfter) column.insertBefore(dragging, applyAfter.nextSibling);
    else column.appendChild(dragging);
});

function getNewPosition(column, posY) {
    return Array.from(column.querySelectorAll(".todo:not(.dragging)")).reduce((closest, card) => {
        const boxCenterY = card.getBoundingClientRect().y + card.offsetHeight / 2;
        return (posY >= boxCenterY) ? card : closest;
    }, null);
}

// Reset background settings
resetButton.addEventListener("click", () => {
    confirmReset.style.display = confirmReset.style.display === 'none' ? 'flex' : 'none';
    confirmButton.addEventListener("click", () => {
        ["todoBackground", "bodyBackground", "bodyColor", "todoColor", "textColor"].forEach(item => localStorage.removeItem(item));
        location.reload(true);
    });
});

// Dropdown toggle
dropdownButton.addEventListener("click", () => dropdownMenu.style.display = dropdownMenu.style.display === 'none' ? 'grid' : 'none');
bellButton.addEventListener("click", () => dropdownBell.style.display = dropdownBell.style.display === 'none' ? 'grid' : 'none');

// Hide dropdowns if clicked outside
document.addEventListener("click", (event) => {
    if (!dropdownButton.contains(event.target)) dropdownMenu.style.display = 'none';
    if (!bellButton.contains(event.target)) dropdownBell.style.display = 'none';
    if (!resetButton.contains(event.target)) confirmReset.style.display = 'none';
});

// Background upload
document.getElementById('bg-upload').addEventListener('change', handleImageUpload('todoBackground', todoContainer));
document.getElementById('body-upload').addEventListener('change', handleImageUpload('bodyBackground', document.body));

function handleImageUpload(storageKey, element) {
    return (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const imgUrl = `url(${e.target.result})`;
                element.style.backgroundImage = imgUrl;
                localStorage.setItem(storageKey, imgUrl);
            };
            reader.readAsDataURL(file);
        }
    };
}

// Color pickers
colorPicker.addEventListener('input', (event) => {
    const color = event.target.value;
    todoContainer.style.backgroundColor = color;
    localStorage.setItem('todoColor', color);
});

textPicker.addEventListener('input', (event) => {
    const color = event.target.value;
    document.body.style.color = color;
    localStorage.setItem('textColor', color);
});

let oldInputValue;

// Saving Todo
const saveTodo = (text, done = 0, save = 1) => {
    const todo = document.createElement("div");
    todo.classList.add("todo");
    todo.setAttribute("draggable", "true");

    todo.innerHTML = `
        <button class="finish-todo"><i class="bi bi-check2"></i></button>
        <h3 class="todo-title">${text}</h3>
        <button class="edit-todo"><i class="bi bi-pen"></i></button>
        <button class="remove-todo"><i class="bi bi-x-lg"></i></button>
    `;

    if (done) todo.classList.add("done");
    if (save) saveTodoLocalStorage({ text, done: 0 });

    todoList.appendChild(todo);
    todoInput.value = "";
    updateTaskCount();
};

const updateTodo = (text) => {
    document.querySelectorAll(".todo").forEach((todo) => {
        if (todo.querySelector("h3").innerText === oldInputValue) {
            todo.querySelector("h3").innerText = text;
            updateTodoLocalStorage(oldInputValue, text);
        }
    });
};

const getSearchedTodos = (search) => {
    document.querySelectorAll(".todo").forEach((todo) => {
        const title = todo.querySelector("h3").innerText.toLowerCase();
        todo.style.display = title.includes(search) ? "flex" : "none";
    });
};

const filterTodos = (filterValue) => {
    document.querySelectorAll(".todo").forEach((todo) => {
        todo.style.display =
            (filterValue === "all") ||
                (filterValue === "done" && todo.classList.contains("done")) ||
                (filterValue === "todo" && !todo.classList.contains("done"))
                ? "flex" : "none";
    });
};

// Events
todoForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const inputValue = todoInput.value;
    if (inputValue) {
        showToast("Tarefa Adicionada!", "rgb(80, 80, 255)", "rgb(90, 90, 250)");
        saveTodo(inputValue)
    } else {
        showToast("Adicione um nome!", "rgb(255, 0 ,0)", "rgb(255, 10, 10)");
    }
});

// Toastify Alert Function
function showToast(text, fromColor, toColor) {
    Toastify({
        text,
        duration: 3000,
        gravity: "top",
        position: "right",
        backgroundColor: `linear-gradient(to right, ${fromColor}, ${toColor})`,
        style: { width: "200px" }
    }).showToast();
}

document.addEventListener("click", (e) => {
    const targetEl = e.target;
    const parentEl = targetEl.closest("div");

    if (targetEl.classList.contains("finish-todo")) {
        parentEl.classList.toggle("done");
        updateTodoStatusLocalStorage(parentEl.querySelector("h3").innerText);
        updateTaskCount();
        if (parentEl.classList.contains("done")) showToast("Tarefa concluída!", "rgb(54, 185, 80)", "rgb(54, 210, 80)");
    }

    if (targetEl.classList.contains("remove-todo")) {
        removeTodoLocalStorage(parentEl.querySelector("h3").innerText);
        parentEl.remove();
        updateTaskCount();
    }

    if (targetEl.classList.contains("edit-todo")) {
        editForm.style.display = 'flex';
        editInput.value = parentEl.querySelector("h3").innerText;
        oldInputValue = editInput.value;
    }
});

cancelEditBtn.addEventListener("click", (e) => {
    e.preventDefault();
    editForm.style.display = 'none';
    todoContainer.style.overflowY = "auto";
});

editForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const editInputValue = editInput.value;
    todoContainer.style.overflowY = "auto";
    editInputValue ? updateTodo(editInputValue) : showToast("Adicione um nome!", "rgb(255, 0 ,0)", "rgb(255, 10, 10)");
    editForm.style.display = 'none';
});

searchInput.addEventListener("keyup", (e) => getSearchedTodos(e.target.value));

eraseBtn.addEventListener("click", (e) => {
    e.preventDefault();
    searchInput.value = "";
    searchInput.dispatchEvent(new Event("keyup"));
});

filterBtn.addEventListener("change", (e) => filterTodos(e.target.value));

// Local Storage
const getTodosLocalStorage = () => JSON.parse(localStorage.getItem("todos")) || [];

const loadTodos = () => getTodosLocalStorage().forEach((todo) => saveTodo(todo.text, todo.done, 0));

const saveTodoLocalStorage = (todo) => {
    const todos = getTodosLocalStorage();
    todos.push(todo);
    localStorage.setItem("todos", JSON.stringify(todos));
};

const removeTodoLocalStorage = (todoText) => {
    const todos = getTodosLocalStorage().filter((todo) => todo.text !== todoText);
    localStorage.setItem("todos", JSON.stringify(todos));
};

const updateTodoStatusLocalStorage = (todoText) => {
    const todos = getTodosLocalStorage();
    todos.map((todo) => {
        if (todo.text === todoText) todo.done = !todo.done;
    });
    localStorage.setItem("todos", JSON.stringify(todos));
};

const updateTodoLocalStorage = (todoOldText, todoNewText) => {
    const todos = getTodosLocalStorage();
    todos.map((todo) => {
        if (todo.text === todoOldText) todo.text = todoNewText;
    });
    localStorage.setItem("todos", JSON.stringify(todos));
};

loadTodos();
