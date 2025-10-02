import axios from "axios";

const clientServer = axios.create({
  baseURL: "https://x-clone-1-d23n.onrender.com/api",
});

clientServer.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default clientServer;
