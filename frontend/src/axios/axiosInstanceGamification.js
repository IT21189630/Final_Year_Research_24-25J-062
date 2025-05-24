import axios from "axios";

const axiosInstanceGamification = axios.create({
	baseURL: "http://localhost:4004",
	headers: {
		"Content-Type": "application/json",
	},
	withCredentials: true,
});

export default axiosInstanceGamification;
