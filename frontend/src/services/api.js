import axios from "axios";

const API = axios.create({
    baseURL: window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
        ? "http://127.0.0.1:8000/api"
        : "/api"
});

export default API;