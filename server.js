
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
  console.log('Conectou:', socket.id)

  socket.on('join', (name) => {
    users[socket.id] = {
      id: socket.id,
      name,
      x: 50,
      y: 100
    }

    // Envia o próprio ID do socket
    socket.emit('me', socket.id)

    broadcast()
  })

  socket.on('move', ({ x, y }) => {
    const user = users[socket.id]
    if (!user) return

    user.x = x
    user.y = y

    broadcast()
  })

  socket.on('disconnect', () => {
    console.log('Saiu:', socket.id)
    delete users[socket.id]
    broadcast()
  })
})

const PORT = process.env.PORT;

server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});