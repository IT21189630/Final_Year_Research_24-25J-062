const express = require("express");
const router = express.Router();
const {
	getPerformanceByLesson,
	getPerformanceByUserId,
	createPerformanceRecord,
	getAllPerformanceRecords,
} = require("../controllers/performance.controller");

router.get("/", getAllPerformanceRecords);
router.get("/user/:id", getPerformanceByUserId);
router.get("/lesson/:id", getPerformanceByLesson);
router.post("/create", createPerformanceRecord);

module.exports = router;
