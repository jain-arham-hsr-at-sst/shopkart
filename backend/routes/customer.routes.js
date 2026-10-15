const express = require("express");
const {
  register,
  login,
  getProfile,
  logout,
} = require("../controllers/customer.controller");
const protectRoute = require("../middlewares/auth.middleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

router.get("/me", protectRoute, getProfile);
router.post("/logout", protectRoute, logout);

module.exports = router;
