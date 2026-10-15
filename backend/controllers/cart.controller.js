const mongoose = require("mongoose");
const Customer = require("../models/customer.model");
const Product = require("../models/product.model");

exports.addToCart = async (req, res) => {
  try {
    const customerId = req.user._id;
    const { productId } = req.params;

    if (!mongoose.isValidObjectId(productId))
      return res
        .status(400)
        .json({ success: false, message: "Invalid product ID" });

    const product = await Product.findById(productId);
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    if (product.stock < 1)
      return res.status(400).json({ success: false, message: "Out of stock" });

    const customer = await Customer.findById(customerId);
    const cartItemIndex = customer.cart.findIndex(
      (item) => item.product.toString() === productId,
    );

    if (cartItemIndex > -1) {
      if (customer.cart[cartItemIndex].quantity + 1 > product.stock) {
        return res
          .status(400)
          .json({ success: false, message: "Cannot exceed available stock" });
      }
      customer.cart[cartItemIndex].quantity += 1;
    } else {
      customer.cart.push({ product: productId, quantity: 1 });
    }

    await customer.save();
    res
      .status(200)
      .json({ success: true, message: "Cart updated", cart: customer.cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getCart = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user._id).populate(
      "cart.product",
    );

    const validCart = customer.cart.filter((item) => item.product != null);

    res.status(200).json({ success: true, cart: validCart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateCartQuantity = async (req, res) => {
  try {
    const customerId = req.user._id;
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!mongoose.isValidObjectId(productId))
      return res
        .status(400)
        .json({ success: false, message: "Invalid product ID" });

    if (!Number.isInteger(quantity) || quantity < 1)
      return res
        .status(400)
        .json({ success: false, message: "Quantity must be at least 1" });

    const product = await Product.findById(productId);
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    if (quantity > product.stock)
      return res
        .status(400)
        .json({ success: false, message: "Quantity exceeds stock" });

    const customer = await Customer.findById(customerId);
    const cartItem = customer.cart.find(
      (item) => item.product.toString() === productId,
    );

    if (!cartItem)
      return res
        .status(404)
        .json({ success: false, message: "Product not in cart" });

    cartItem.quantity = quantity;
    await customer.save();

    res.status(200).json({
      success: true,
      message: "Quantity updated",
      cart: customer.cart,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.productId))
      return res
        .status(400)
        .json({ success: false, message: "Invalid product ID" });

    const customer = await Customer.findById(req.user._id);
    customer.cart = customer.cart.filter(
      (item) => item.product.toString() !== req.params.productId,
    );
    await customer.save();

    res
      .status(200)
      .json({ success: true, message: "Product removed", cart: customer.cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
