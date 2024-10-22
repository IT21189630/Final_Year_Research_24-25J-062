const express = require("express");
const router = express.Router();
const auth_roles = require("../config/userRoles");
const verifyRoles = require("../middlewares/verifyRolesMiddleware");
const {
  createNewAdmin,
  createNewStudent,
} = require("../controllers/registration.controller");

const { Admin } = auth_roles;

router.post("/register/student", createNewStudent);
router.post("/register/admin", createNewAdmin);

module.exports = router;
