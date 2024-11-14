
document.getElementById('dropdownButton').addEventListener('click', function (e) {
    e.target.style.backgroundColor = 'white';
    e.target.style.color = 'black';
    const menu = document.getElementById('dropdownMenu');
    menu.classList.toggle('hidden');
    getDP();
});

const taskList = document.getElementById('taskList');
let todoList = [];
let SKIP = 0;
const LIMIT = 7;

let loadPages = true;
function getAndRenderAllTodos() {
    axios
        .get(`/get-todo?skip=${SKIP}`)
        .then((res) => {
            const todos = res.data.data;
            todoList = todos;
            console.log(todos);
            if (res.status !== 200) {
                alert('No Todo Found!');
                return;
            }

            taskList.innerHTML = '';

            taskList.insertAdjacentHTML('beforeend', todos.map((item) => {
                return `<li class="todo flex justify-between items-center bg-gray-100 px-4 py-3 rounded-lg shadow-md select-none w-full">
                            <span data-id="${item._id}" class="todo-text w-3/6 px-2 py-1 text-gray-700 select-text">${item.todo}</span>
                            <div class="btn-container flex items-center select-none w-52">
                                    <label for="${item._id}" class="mx-2 text-sm">Status:</label>
                                    <select data-id="${item._id}" class="status-dropdown mr-1 text-sm bg-gray-100 w-24 font-semibold">
                                    <option class="option">${item.currentStatus}</option>
                                        <option class="option text-red-500" value="Not Done!">Not Done!</option>
                                        <option class="option text-yellow-500" value="In Progress!">In Progress!</option>
                                        <option class="option text-green-500" value="Done!">Done!</option>
                                    </select>
                                <button class="text-blue-500 mx-2 hover:text-blue-700 transition duration-200 ease-in-out cursor-pointer select-none"><i data-id=${item._id} class="fa-solid fa-pen-to-square edit btn-edit"></i></button>
                                <button class="text-red-500 hover:text-red-700 transition duration-200 ease-in-out cursor-pointer select-none"><i data-id=${item._id}  class="fa-solid fa-trash delete btn-delete"></i></button>
                            </div>
                        </li>`
            }).join('')
            );
        })
        .then(() => {
            addColor();

        })
        .catch((err) => {
            console.log(err);
            alert('Internal Server Error!');
        });

}


function getDP() {
    axios
        .get('/get-userDP')
        .then((res) => {
            console.log(res.data.data.img);
            if (res.status === 200 && res.data.data.img !== 'undefined') {
                const img = res.data.data.img || 'https://i.imgur.com/37OLBtw.png';

                if(!img || img=== 'undefined') return;
                
                const DP = document.getElementById('DP');
                DP.src = img;
            }
        })
        .catch((err) => {
            console.log(err);
        });
}

window.onload = getAndRenderAllTodos;

const addColor = function () {
    let TodoStatus = Array.from(document.querySelectorAll('.status-dropdown'));

    console.log(TodoStatus);
    TodoStatus.forEach((item) => {
        if (item.value === 'Done!') {
            item.classList.add('text-green-500');
        }
        else if (item.value === 'In Progress!') {
            item.classList.add('text-yellow-500');
        }
        else if (item.value === 'Not Done!') {
            item.classList.add('text-red-500');
        }
    })
}

// delete todo

document.addEventListener('click', function (e) {
    if (e.target.classList.contains('delete')) {

        const todoId = e.target.getAttribute('data-id');

        axios
            .post('/delete-todo', { todoId })
            .then((res) => {
                if (res.status === 200) {
                    alert('Todo deleted!');
                }
                e.target.parentElement.parentElement.parentElement.remove();
                getAndRenderAllTodos();
            })
            .catch((err) => {
                alert(err.message);
            });
    }
    else if (e.target.classList.contains('btn-edit')) {
        // edit todo
        const todo = e.target.parentElement.parentElement.parentElement;
        const todoText = todo.querySelector('.todo-text');
        const todoStatus = todo.querySelector('.status-dropdown');

        let saveBtn = todo.querySelector('.btn-save');
        if (!saveBtn) {
            saveBtn = document.createElement('button');
            saveBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i>';
            saveBtn.classList.add('btn-save');
            todo.querySelector('.btn-container').prepend(saveBtn);
        }

        todoText.setAttribute('contenteditable', 'true');
        todoText.focus();

        // Move the cursor to the end
        const range = document.createRange();
        range.selectNodeContents(todoText);
        range.collapse(false);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);


        const todoId = e.target.getAttribute('data-id');


        saveBtn.addEventListener('click', (e) => {
            const newTodo = todoText.textContent;
            const todoStatusValue = todoStatus.value;
            console.log({ todoId, newTodo, todoStatusValue });

            axios
                .post('/edit-todo', { todoId, newTodo, todoStatusValue })
                .then((res) => {
                    if (res.status === 200) {
                        e.target.remove();
                        alert('Todo updated!');
                        return;
                    }
                })
                .catch((err) => {
                    alert(err.message);
                });
        })
    }
    else if (e.target.id === 'addTask') {
        e.preventDefault();

        const task = document.getElementById('taskName');

        if (!task.value) {
            alert("Please enter a task!");
            return;
        }
        if (typeof task.value !== "string") {
            alert("Todo must be a string");
            return;
        }
        if (task.value.length < 5 || task.value.length > 50) {

            alert("Todo must be between 5 and 50 characters");
            return;
        }

        loadPages = true;

        axios
            .post('/create-todo', { newTodo: task.value })
            .then((res) => {
                if (res.status === 200) {
                    alert('Todo added!');
                    task.value = '';
                    getAndRenderAllTodos();
                }
            })
            .catch((err) => {
                alert(err.message);
            });
    }
    else if (e.target.id === 'logout' || e.target.id === 'logoutIcon') {
        axios
            .post('/logout')
            .then((res) => {
                alert('Logged Out Successfully!');
                window.location.href = '/login';
            })
            .catch((err) => {
                alert(err.message);
            })

    }
    else if (e.target.id === 'logoutAll' || e.target.id === 'logoutAllIcon') {
        axios
            .post('/logoutAll')
            .then((res) => {
                alert('Logged Out from all devices Successfully!');
                window.location.href = '/login';
            })
            .catch((err) => {
                alert(err.message);
            })
    }
    else if (e.target.id === 'Prve' || e.target.id === 'PrveIcon') {

        const newLength = todoList && todoList.length < LIMIT ? LIMIT : todoList.length;
        if (SKIP >= LIMIT) {
            SKIP -= newLength;
            getTodos(SKIP)
        }

        const page = document.getElementById('Page');
        // Scroll left by a specific amount (e.g., 100 pixels)
        page.scrollBy({
            top: 0,
            left: -70, // Change this value as needed
            behavior: 'smooth'
        });

    }
    else if (e.target.id === 'Next' || e.target.id === 'NextIcon') {

        if (todoList.length === LIMIT) {
            SKIP += todoList.length;
            getTodos(SKIP);
        }
        else {
            alert('No more todos!');
        }
        const page = document.getElementById('Page');
        // Scroll right by a specific amount (e.g., 100 pixels)
        page.scrollBy({
            top: 0,
            left: 70, // Change this value as needed
            behavior: 'smooth'
        });

    }
    else if (e.target.classList.contains('page')) {
        let pageNo = e.target.pageNo;
        SKIP = (pageNo - 1) * LIMIT;
        getTodos(SKIP);

    }
    else if (e.target.id === 'changeProfilePic') {
        const fileInput = document.getElementById('fileInput');
        fileInput.click();
        fileInput.addEventListener('change', function (e) {
            const formData = new FormData();
            const file = e.target.files[0];

            console.log(formData, file);

            if (file) {
                formData.append('profilePic', file);

                axios.post('/uploadDP', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                })
                    .then((res) => {
                        if (res.status === 200) {
                            getDP();
                            alert('Profile picture updated!');
                        }
                    })
                    .catch((err) => {
                        alert(err.message);
                    });
            };
        })
    }
    else if (e.target.id === 'changePassword') {
        window.location.href = '/newPassword';
    }
    else if (e.target.id === 'deleteAccount') {
        axios
            .post('/delete-user')
            .then((res) => {
                alert("Account deleted");
                window.location.href = '/login';
            })
            .catch((err) => {
                alert(err.message);
            })
    }
    else if (e.target.id === 'themeicon') {
        const todoContainer = document.getElementById('mainContainer');
        const dropdownIcon = document.getElementById('dropdownicon');

        e.target.classList.toggle('fa-moon');
        e.target.classList.toggle('fa-sun');
        todoContainer.classList.toggle('bg-white');
        todoContainer.classList.toggle('bg-black');

        const isSmallScreen = window.matchMedia('(max-width: 500px)').matches;
        if (isSmallScreen) {
            if (dropdownIcon.style.color === 'white') {
                dropdownIcon.style.color = 'black';
            }
            else {
                dropdownIcon.style.color = 'white';
            }
        }
    }
})


document.addEventListener('change', function (e) {
    if (e.target.classList.contains('status-dropdown')) {


        const todoId = e.target.getAttribute('data-id');
        const todo = e.target.parentElement.parentElement;
        const newTodo = todo.querySelector('.todo-text').textContent;
        const todoStatusValue = e.target.value;
        console.log({ todoId, newTodo, todoStatusValue });


        e.target.classList.remove('text-green-500', 'text-yellow-500', 'text-red-500');


        if (todoStatusValue === 'Done!') {
            e.target.classList.add('text-green-500');
        } else if (todoStatusValue === 'In Progress!') {
            e.target.classList.add('text-yellow-500');
        } else {
            e.target.classList.add('text-red-500');
        }

        axios
            .post('/edit-todo', { todoId, newTodo, todoStatusValue })
            .then((res) => {
                if (res.status === 200) {

                    alert('Todo status updated!');
                    return;
                }
            })
            .catch((err) => {
                alert(err.message);
            });

    }
})

function getTodos(SKIP) {
    axios
        .get(`/get-todo?skip=${SKIP}`)
        .then((res) => {
            const todos = res.data.data;
            todoList = todos;
            console.log(todos, res.status);
            if (res.status !== 200 || todos.length === 0) {
                alert('No Todo Found!');
                return;
            }

            taskList.innerHTML = '';

            taskList.insertAdjacentHTML('beforeend', todos.map((item) => {
                return `<li class="todo flex justify-between items-center bg-gray-100 px-4 py-3 rounded-lg shadow-md select-none w-full">
                            <span data-id="${item._id}" class="todo-text w-3/6 px-2 py-1 text-gray-700 select-text">${item.todo}</span>
                            <div class="btn-container flex items-center select-none w-52">
                                    <label for="${item._id}" class="status-label mx-2 text-sm">Status:</label>
                                    <select data-id="${item._id}" class="status-dropdown mr-1 text-sm bg-gray-100 w-24 font-semibold">
                                    <option>${item.currentStatus}</option>
                                        <option class="text-red-500" value="Not Done!">Not Done!</option>
                                        <option class="text-yellow-500" value="In Progress!">In Progress!</option>
                                        <option class="text-green-500" value="Done!">Done!</option>
                                    </select>
                                <button class="text-blue-500 mx-2 hover:text-blue-700 transition duration-200 ease-in-out cursor-pointer select-none"><i data-id=${item._id} class="fa-solid fa-pen-to-square edit btn-edit"></i></button>
                                <button class="text-red-500 hover:text-red-700 transition duration-200 ease-in-out cursor-pointer select-none"><i data-id=${item._id}  class="fa-solid fa-trash delete btn-delete"></i></button>
                            </div>
                        </li>`
            }).join('')
            );
        })
        .then(() => {
            addColor();

        })
        .catch((err) => {
            console.log(err);
            alert('Internal Server Error!');
        });
}

const pages = document.getElementById('Page');

function renderPageNumbers() {
    axios
        .get('/total-todo-count')
        .then((res) => {
            let totalTodoCount = res.data.count || 1;
            const totalPages = Math.ceil(totalTodoCount / LIMIT);

            for (let i = 1; i <= totalPages; i++) {
                const page = document.createElement('button');
                page.pageNo = i;
                page.classList.add('page', 'mr-1', 'px-2', 'py-1', 'rounded-lg', 'bg-gray-200', 'text-gray-700', 'text-sm', 'cursor-pointer', 'hover:bg-gray-400', 'transition', 'duration-200', 'ease-in-out');
                page.textContent = i;
                pages.appendChild(page);
            }
        })
        .catch((err) => {
            console.log(err);
            alert('Internal Server Error!');
        });
}

if (loadPages) {
    async function showPages() {
        try {
            await renderPageNumbers();
            loadPages = false;
        } catch (error) {
            console.error('Error loading pages:', error);
        }
    }
    showPages();
}

const user = document.getElementById('user');
const email = document.getElementById('email');

function renderUser() {
    axios
        .get('/get-user')
        .then((res) => {
            console.log(res.data.data.name);
            user.textContent = res.data.data.name;
            email.textContent = res.data.data.email;
        })
        .catch((err) => {
            console.log(err);
            alert('Internal Server Error!');
        });
}

if (!user.textContent || user.textContent === '') {
    renderUser();
}

