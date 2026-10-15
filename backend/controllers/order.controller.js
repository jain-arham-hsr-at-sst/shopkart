const mongoose = require("mongoose");
const Order = require("../models/order.model");
const Customer = require("../models/customer.model");
const Product = require("../models/product.model");
const razorpay = require("../config/razorpay.config");
const crypto = require("crypto");

exports.createPaymentOrder = async (req, res) => {
  try {
    const { shippingAddress } = req.body;

    const fields = [
      "fullName",
      "phone",
      "addressLine1",
      "city",
      "state",
      "pincode",
    ];
    if (
      !shippingAddress ||
      fields.some(
        (f) =>
          typeof shippingAddress[f] !== "string" || !shippingAddress[f].trim(),
      )
    )
      return res
        .status(400)
        .json({ success: false, message: "All shipping fields are required" });
    if (!/^\d{10}$/.test(shippingAddress.phone.trim()))
      return res
        .status(400)
        .json({ success: false, message: "Phone must contain 10 digits" });
    if (!/^\d{6}$/.test(shippingAddress.pincode.trim()))
      return res
        .status(400)
        .json({ success: false, message: "Pincode must contain 6 digits" });

    const customer = await Customer.findById(req.user._id).populate(
      "cart.product",
    );

    if (!customer.cart.length)
      return res.status(400).json({ success: false, message: "Cart is empty" });

    let totalAmount = 0;
    const orderItems = [];

    for (const item of customer.cart) {
      if (!item.product)
        return res.status(400).json({
          success: false,
          message: "A product in your cart is no longer available",
        });
      const product = await Product.findById(item.product._id);
      if (item.quantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}`,
        });
      }
      totalAmount += product.price * item.quantity;
      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.image,
      });
    }

    const order = await Order.create({
      user: customer._id,
      items: orderItems,
      shippingAddress: Object.fromEntries(
        fields.map((f) => [f, shippingAddress[f].trim()]),
      ),
      totalAmount,
    });

    const rzpOrder = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100),
      currency: "INR",
      receipt: order._id.toString(),
    });

    order.razorpayOrderId = rzpOrder.id;
    await order.save();

    res.status(200).json({
      success: true,
      shopKartOrderId: order._id,
      razorpayOrderId: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { shopKartOrderId, razorpay_payment_id, razorpay_signature } =
      req.body;

    if (!mongoose.isValidObjectId(shopKartOrderId))
      return res
        .status(400)
        .json({ success: false, message: "Invalid order ID" });

    const order = await Order.findOne({
      _id: shopKartOrderId,
      user: req.user._id,
    });
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });

    const body = order.razorpayOrderId + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid payment signature" });
    }

    order.paymentStatus = "PAID";
    order.status = "PLACED";
    order.razorpayPaymentId = razorpay_payment_id;
    await order.save();

    const customer = await Customer.findById(req.user._id);
    customer.cart = [];
    await customer.save();

    res
      .status(200)
      .json({ success: true, message: "Payment verified successfully", order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id))
      return res
        .status(400)
        .json({ success: false, message: "Invalid order ID" });

    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });

    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
