const express = require("express");
const router = express.Router();
const {
  getPerformanceByLesson,
  getPerformanceByUserId,
  createPerformanceRecord,
} = require("../controllers/performance.controller");

router.get("/user/:id", getPerformanceByUserId);
router.get("/lesson/:id", getPerformanceByLesson);
router.post("/create", createPerformanceRecord);

module.exports = router;
