import { io, Socket } from "socket.io-client";

const token = localStorage.getItem("authToken");

if (!token) {
  console.warn("Token de autenticação não encontrado!");
}

const socket: Socket = io("http://192.168.0.149:1338", {
  transports: ["websocket"],
  auth: {
    token,
  },
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 2000,
  timeout: 10000,
});

socket.on("connect", () => {
  console.log("Conectado ao servidor Socket.IO:", socket.id);
});

socket.on("disconnect", (reason) => {
  console.warn("Desconectado:", reason);
});

socket.on("connect_error", (error) => {
  console.error("Erro de conexão:", error);
});

socket.on("reconnect_attempt", (attempt) => {
  console.log(`Tentativa de reconexão (${attempt})...`);
});

export default socket;
