import { io, Socket } from "socket.io-client";
const token = localStorage.getItem("authToken");

const socket = io("http://192.168.18.231:1338/", {
  auth: { token },
});

export default socket;
