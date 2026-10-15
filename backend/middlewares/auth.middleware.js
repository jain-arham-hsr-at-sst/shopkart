const jwt = require("jsonwebtoken");
const Customer = require("../models/customer.model");

const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized: No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized: Invalid token" });
    }

    const customer = await Customer.findById(decoded.id).select("-password");
    if (!customer) {
      return res
        .status(401)
        .json({ success: false, message: "Customer not found" });
    }

    req.user = customer;
    next();
  } catch (error) {
    res
      .status(401)
      .json({ success: false, message: "Unauthorized: Invalid token" });
  }
};

module.exports = protectRoute;
