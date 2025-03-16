import axios from "axios";

const axiosInstance = axios.create({
  baseURL:
    "http://localhost:4001/gamified-learning/api/lesson-management/recommendations",
});

export default axiosInstance;
