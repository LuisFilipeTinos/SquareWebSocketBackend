
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";

dotenv.config();

const app = express()
app.use(cors())

const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: '*'
  }
})

let users = {}

function broadcast() {
  io.emit('update', Object.values(users))
}

io.on('connection', (socket) => {
  const id = uuidv4()

  console.log('Novo usuário conectado')

  socket.on('join', (name) => {
    users[id] = {
      id,
      name,
      x: Math.random() * 300,
      y: Math.random() * 500
    }

    socket.userId = id
    broadcast()
  })

  socket.on('move', ({ x, y }) => {
    const user = users[socket.userId]
    if (!user) return

    user.x = x
    user.y = y

    broadcast()
  })

  socket.on('disconnect', () => {
    if (socket.userId) {
      delete users[socket.userId]
      broadcast()
    }
    console.log('Usuário desconectado')
  })
})

const PORT = process.env.PORT;

server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});