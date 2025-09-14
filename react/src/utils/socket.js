// config/socket.js
import { io } from "socket.io-client";
import { clientServer } from "../config/clientServer"; // Adjust path if needed

// Extract the base URL from the Axios instance
const URL = clientServer.defaults.baseURL;

export const socket = io(URL, {
  withCredentials: true,
  autoConnect: false,
});
