import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:4000/gamified-learning/api/user-management",
});

export default axiosInstance;
