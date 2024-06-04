const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function save(title, description){
    const todo = await prisma.todo.create({
        data: {
            title: title,
            description: description
        }
    });

    return todo;
}

async function saveList(todos){
    const savedTodos = await prisma.todo.createMany({
        data: todos
    });

    return savedTodos;

}

async function getAll(){
    const todos = await prisma.todo.findMany();

    return todos;
}

async function getById(id){
    const todo = await prisma.todo.findUnique({
        where: {
            id: id
        }
    });

    return todo;
    
}

async function update(id, title, description){
    const todo = await prisma.todo.update({
        where: {
            id: id
        },
        data: {
            title: title,
            description: description
        }
    });

    return todo;
}

async function deleteById(id){
    const todo = await prisma.todo.delete({
        where: {
            id: id
        }
    });

    return todo;
}

module.exports = {
    save,
    saveList,
    getAll,
    getById,
    update,
    deleteById,
};
  