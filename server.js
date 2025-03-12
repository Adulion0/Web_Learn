const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 8989;

// 启用 CORS 支持
app.use(cors());

// 使用 body-parser 中间件解析 JSON 格式的请求体
app.use(bodyParser.json());

// 定义存储 Todo 数据的文件路径
const todosFilePath = path.join(__dirname, 'todos.json');

// 从文件中加载 Todo 数据
function loadTodos() {
    try {
        const data = fs.readFileSync(todosFilePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Failed to load todos:', error);
        return [];
    }
}

// 将 Todo 数据保存到文件中
function saveTodos(todos) {
    try {
        fs.writeFileSync(todosFilePath, JSON.stringify(todos, null, 2), 'utf-8');
    } catch (error) {
        console.error('Failed to save todos:', error);
    }
}

// 获取所有 Todo
app.get('/todos', (req, res) => {
    const todos = loadTodos();
    res.json(todos);
});

// 获取单个 Todo
app.get('/todos/:id', (req, res) => {
    const todos = loadTodos();
    const id = parseInt(req.params.id);
    const todo = todos.find(todo => todo.id === id);

    if (todo) {
        res.json(todo);
    } else {
        res.status(404).json({ message: "Todo not found" });
    }
});

// 创建 Todo
app.post('/todos', (req, res) => {
    const { title, completed = false } = req.body;

    if (!title) {
        return res.status(400).json({ message: "Title is required" });
    }

    const todos = loadTodos();
    const newTodo = {
        id: todos.length + 1, // 自动生成新的 ID
        title,
        completed
    };

    todos.push(newTodo);
    saveTodos(todos);
    res.status(201).json(newTodo);
});

// 删除 Todo
app.delete('/todos/:id', (req, res) => {
    const todos = loadTodos();
    const id = parseInt(req.params.id);
    const todoIndex = todos.findIndex(todo => todo.id === id);

    if (todoIndex !== -1) {
        todos.splice(todoIndex, 1);
        saveTodos(todos);
        res.status(204).send();
    } else {
        res.status(404).json({ message: "Todo not found" });
    }
});

// 修改 Todo 的完成状态
app.patch('/todos/:id', (req, res) => {
    const todos = loadTodos();
    const id = parseInt(req.params.id);
    const { completed } = req.body;

    const updatedTodos = todos.map(todo => {
        if (todo.id === id) {
            return { ...todo, completed };
        }
        return todo;
    });

    saveTodos(updatedTodos);
    res.json({ message: "Todo updated successfully" });
});

// 启动服务器
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});