var alltodos = [];

const todoForm = document.querySelector('#todoForm');
const todoInput = document.querySelector('.new-todo');
const todoList = document.querySelector('.todo-list');
const allCounter = document.querySelector('.all-counter');
const todoCounter = document.querySelector('.todo-counter');
const doneCounter = document.querySelector('.done-counter');
const footer = document.querySelector('.footer');

function addListItem(item) {
    if (footer.classList.contains("hidden")) {
        footer.classList.remove('hidden');
    }

    todoList.innerHTML += `<li id="${item.id}" class="${item.done?'completed':''}">
        <div class="view">
            <input id="checkbox-${item.id}" class="toggle" type="checkbox">
            <label id="label-${item.id}" class="todoLabel">${item.todo}</label>
            <button class="destroy"></button>
        </div>
        <input id="input-${item.id}" class="edit" value="${item.todo}">
    </li>`;
}
function markTodo(item) {
    document.getElementById(`checkbox-${item.id}`).checked = item.done;
    const doneButNotMarked = item.done && !document.getElementById(item.id).classList.contains('completed');
    const markedButNotDone = !item.done && document.getElementById(item.id).classList.contains('completed');

    if (doneButNotMarked || markedButNotDone) {
        document.getElementById(item.id).classList.toggle('completed');
    }
}

function loadData() {
    todoList.innerHTML="";
    const updatedData = JSON.parse(localStorage.getItem('data')) || [];
    alltodos = [...updatedData];
    alltodos.forEach(item=>{
        addListItem(item);
        markTodo(item);
    });

    bindClicks();

    allCounter.innerHTML = alltodos.length;
    todoCounter.innerHTML = alltodos.filter(item=>{ return !item.done}).length;
    doneCounter.innerHTML = alltodos.filter(item=>{ return item.done }).length;
    if (!alltodos.length && !footer.classList.contains("hidden")) {
        footer.classList.add('hidden');
    }
    console.log("All todos", alltodos);
}

window.addEventListener("update", loadData);
window.dispatchEvent( new Event('update') );

function clearData() {
    localStorage.clear();
    window.dispatchEvent( new Event('update'));
}

function addTodo(event) {
    event.preventDefault();
    const newId = new Date().getTime().toString();
    const newValue = todoInput.value?.trim();
    if (!newValue) {
        alert('Boş bırakılamaz. ESC ile iptal edin veya yeni bir değer girin.');
    }
    else if (alltodos.find(item=>item.todo===newValue)) {
        alert('Bu zaten listenizde mevcut.');
    }
    else {
        const newItem = { id: newId, todo: newValue, done: false };
        const newList = [newItem, ...alltodos];

        localStorage.setItem('data', JSON.stringify(newList));
        window.dispatchEvent( new Event('update') );

        todoInput.value = '';

        if (todoList.classList.contains("completed")||todoList.classList.contains("active")) {
            todoList.classList.value = 'todo-list all';
            allCounter.closest("label").querySelector("input").checked = true;
            todoCounter.closest("label").querySelector("input").checked = false;
            doneCounter.closest("label").querySelector("input").checked = false;
        }
    }
}

todoForm.addEventListener('submit', addTodo);

function toggleDone() {
    const todoElement = this.closest("li");
    const checkedTodoIndex = alltodos.findIndex(item=>item.id===todoElement.id);
    const checkedTodo = alltodos[checkedTodoIndex];
    const updatedTodo = {...checkedTodo, done:!checkedTodo.done};
    alltodos.splice(checkedTodoIndex,1,updatedTodo);

    localStorage.setItem('data', JSON.stringify(alltodos));
    window.dispatchEvent( new Event('update'));
}

function removeTodo() {
    const todoElement = this.closest("li");
    const removedTodoIndex = alltodos.findIndex(item=>item.id===todoElement.id);
    alltodos.splice(removedTodoIndex,1);
    if (!alltodos.length) {
        clearData();
    }
    else {
        localStorage.setItem('data', JSON.stringify(alltodos));
        window.dispatchEvent( new Event('update'));
    }
}

function editTodo(event) {
    const targetListItem = event.target.closest("li");
    const inputElement = document.getElementById(`input-${targetListItem.id}`);
    const targetItemIndex = alltodos.findIndex(item=>item.id === targetListItem.id);
    const targetItem = alltodos[targetItemIndex];
    if (event.key === 'Escape') {
        inputElement.value = targetItem.todo;
        targetListItem.classList.remove('editing');
    }
    if (event.key === 'Enter') {
        const newValue = event.target.value?.trim();
        if (!newValue) {
            alert('Boş bırakılamaz. ESC ile iptal edin veya yeni bir değer girin.');
        }
        else {
            if (newValue===targetItem.todo) {
                targetListItem.classList.remove('editing');
            }
            else {
                if (alltodos.find(item=>item.todo===newValue)) {
                    alert('Bu zaten listenizde mevcut.');
                }
                else {
                    const editedItem = {...targetItem, todo:newValue};
                    alltodos.splice(targetItemIndex,1,editedItem);

                    localStorage.setItem('data', JSON.stringify(alltodos));
                    window.dispatchEvent( new Event('update') );

                    document.getElementById(`label-${alltodos[targetItemIndex].id}`).innerText = newValue;
                    targetListItem.classList.remove('editing');
                }
            }
        }
    }
}

function delegateDblClick(event) {
    const targetElement = event.target;
    if(targetElement.classList.contains('todoLabel')) {
        const listItems = event.target.closest("ul").children;
        for (const listItem of listItems) {
            if (listItem.classList.contains('editing')) listItem.classList.remove('editing');
        }
        const targetListItem = event.target.closest("li");
        targetListItem.classList.add('editing');
        const targetItem = alltodos.find(item=>item.id===targetListItem.id);
        const inputValue = targetItem.todo;
        const targetInput = document.getElementById(`input-${targetListItem.id}`);
        targetInput.focus();
        targetInput.value = "";
        targetInput.value = inputValue;
    }
}

todoList.addEventListener('dblclick', delegateDblClick);

for (const filter of document.querySelectorAll('.filters input')) {
    filter.addEventListener('click', function(){
        todoList.classList.value = 'todo-list ' + this.value;
    });
}

function bindClicks() {
    for (const btn of document.querySelectorAll('.destroy')) {
        btn.addEventListener('click', removeTodo);
    }
    for (const btn of document.querySelectorAll('.toggle')) {
        btn.addEventListener('click', toggleDone);
    }
    document.querySelectorAll('.edit').forEach(x => x.addEventListener('keydown', editTodo));
}