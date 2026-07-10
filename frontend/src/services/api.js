import axios from "axios";

const API = axios.create({
    baseURL: "https://github-automation-bot-6.onrender.com/api"
});

export default API;