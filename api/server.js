const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);

// Configura o Socket.IO com CORS
const io = socketIo(server, {
  cors: {
    origin: "http://127.0.0.1:5500", // Permite conexões dessa origem
    methods: ["GET", "POST"] // Métodos permitidos
  }
});

// Armazenamento do estado do jogo
let players = {};  // Armazenar os jogadores conectados

// Quando um jogador se conecta
io.on('connection', (socket) => {
  console.log('Novo jogador conectado:', socket.id);

  // Inicializa o jogador no servidor
  players[socket.id] = {
    x: 100,
    y: 100,
    speed: 5,
    magic: 0,
    magicMax: 100,
    stamina: 100,
  };

  // Envia o estado do jogador para o cliente
  socket.emit('initialize', players[socket.id]);

  // Atualiza as informações do jogador quando ele se move
  socket.on('move', (data) => {
    if (players[socket.id]) {
      players[socket.id].x = data.x;
      players[socket.id].y = data.y;
      io.emit('update', players);  // Envia o estado atualizado de todos os jogadores
    }
  });

  // Quando o jogador se desconecta
  socket.on('disconnect', () => {
    console.log('Jogador desconectado:', socket.id);
    delete players[socket.id];
    io.emit('playerDisconnected', socket.id); // Notifica os outros jogadores
    io.emit('update', players);
  });

});

// Serve arquivos estáticos (como HTML, JS)
app.use(express.static('public'));

// Inicia o servidor
server.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});