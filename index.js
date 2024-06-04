
const http = require("http");
const url = require('url');
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const {
    save,
    saveList,
    getAll,
    getById,
    update,
    deleteById,
} = require("./controllers/todo");

const server = http.createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    if (req.url === "/save" && req.method === "POST") {
        let body = "";
        req.on("data", (chunk) => {
            body += chunk.toString();
        });
        req.on("end", async () => {
            console.log(body);
            const { title, description } = JSON.parse(body);
            const newTodo = await save(title, description);
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(newTodo));
        });

    } else if (req.url === "/saveList" && req.method === "POST") {
        let body = "";
        req.on("data", (chunk) => {
            body += chunk.toString();
        });
        req.on("end", async () => {
            const todos = JSON.parse(body);
            const newTodos = [];
            for (let todo of todos) {
                const { title, description } = todo;
                const newTodo = await save(title, description);
                newTodos.push(newTodo);
            }
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(newTodos));
        });

    }
    else if (req.url === "/register" && req.method === "POST") {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', async () => {
            const { name, email, password, role } = JSON.parse(body);
            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = await prisma.user.create({
                data: { name, email, password: hashedPassword, role }
            });
            res.writeHead(201, { "Content-Type": "application/json" });
            res.end(JSON.stringify(newUser));
        });
    }
     else if (req.url === "/getAll" && req.method === "GET") {
        const allTodos = await getAll();
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(allTodos));

    } else if (req.url.startsWith("/getById") && req.method === "GET") {
        const id = req.url.split("/")[2];
        const todo = await getById(parseInt(id));
        if (todo) {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(todo));
        } else {
            res.writeHead(404, { "Content-Type": "text/plain" });
            res.end("Todo not found");
        }
    } else if (req.url.startsWith('/update/') && req.method === 'PATCH') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', async () => {
            const id = parseInt(req.url.split('/')[2]);
            const { title, description } = JSON.parse(body);
            const updatedTodo = await update(id, title, description);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(updatedTodo));
        });
    } else if (req.url.startsWith("/delete/") && req.method === "DELETE") {
        const id = req.url.split("/")[2];
        const deletedTodo = await deleteById(parseInt(id));
        if (deletedTodo) {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(deletedTodo));
        } else {
            res.writeHead(404, { "Content-Type": "text/plain" });
            res.end("Todo not found");
        }

    }else if (req.url === "/authorize" && req.method === "POST") {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', async () => {
            const { id, userId } = JSON.parse(body);
            const user = await prisma.user.findUnique({ where: { id: userId } });
            if (user && user.role === "ADMIN") {
                const todo = await prisma.todo.update({
                    where: { id: Number(id) },
                    data: { authorised: true }
                });
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify(todo));
            } else {
                res.writeHead(403, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ message: "Forbidden" }));
            }
        });
    } else if (req.url.startsWith("/filter") && req.method === "GET") {
        const urlParts = url.parse(req.url, true);
        const query = urlParts.query;
        const allTodos = await getAll();
        const filteredTodos = allTodos.filter(todo => {
            for (let key in query) {
                if (!String(todo[key]).toLowerCase().includes(query[key].toLowerCase())) {
                    return false;
                }
            }
            return true;
        });
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(filteredTodos));
    }
     else {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Not Found");
    }
});

server.listen(5000, () => {
    console.log("Server is running on http://localhost:5000");
});