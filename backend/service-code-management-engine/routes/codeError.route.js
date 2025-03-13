const express = require("express");
const router = express.Router();
const { addErrorLog } = require("../controllerls/codeErrorController");

router.post("/add-error", addErrorLog);

module.exports = router;
