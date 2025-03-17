const express = require("express");
const router = express.Router();
const { addErrorLog, getErrorTypesByUserID } = require("../controllerls/codeErrorController");

router.post("/add-error", addErrorLog);
router.get("/error-types/:userID", getErrorTypesByUserID);

module.exports = router;
