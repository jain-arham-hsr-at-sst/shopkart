import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import Navbar from "../components/Navbar";

const Cart = () => {
  const {
    cartItems,
    loading,
    error,
    cartCount,
    subtotal,
    fetchCart,
    updateQuantity,
    removeFromCart,
  } = useContext(CartContext);
  const navigate = useNavigate();

  if (loading)
    return (
      <div>
        <Navbar />
        <h3 style={{ padding: "20px" }}>Loading your cart...</h3>
      </div>
    );
  if (error)
    return (
      <div>
        <Navbar />
        <h3 style={{ padding: "20px", color: "red" }}>
          Unable to load your cart.
        </h3>
        <button onClick={fetchCart} style={{ marginLeft: "20px" }}>
          Try Again
        </button>
      </div>
    );

  return (
    <div>
      <Navbar />
      <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
        <h2>My Cart</h2>

        {cartItems.length === 0 ? (
          <div style={{ textAlign: "center", marginTop: "50px" }}>
            <h2>🛒 Your cart is empty</h2>
            <p>Looks like you haven't added anything yet.</p>
            <button
              onClick={() => navigate("/products")}
              style={{ padding: "10px 20px" }}
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", gap: "40px" }}>
            {/* Cart Items List */}
            <div style={{ flex: 2 }}>
              {cartItems.map((item) => (
                <div
                  key={item.product._id}
                  style={{
                    display: "flex",
                    gap: "20px",
                    borderBottom: "1px solid #ddd",
                    padding: "15px 0",
                    alignItems: "center",
                  }}
                >
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    style={{
                      width: "100px",
                      height: "100px",
                      objectFit: "cover",
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <h4>{item.product.name}</h4>
                    <p style={{ color: "#555" }}>₹{item.product.price}</p>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "15px",
                        marginTop: "10px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          border: "1px solid #ccc",
                        }}
                      >
                        <button
                          onClick={() =>
                            updateQuantity(item.product._id, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1}
                          style={{
                            padding: "5px 10px",
                            border: "none",
                            background: "#f9f9f9",
                            cursor:
                              item.quantity > 1 ? "pointer" : "not-allowed",
                          }}
                        >
                          {" "}
                          -{" "}
                        </button>
                        <span style={{ padding: "0 15px" }}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.product._id, item.quantity + 1)
                          }
                          disabled={item.quantity >= item.product.stock}
                          style={{
                            padding: "5px 10px",
                            border: "none",
                            background: "#f9f9f9",
                            cursor:
                              item.quantity < item.product.stock
                                ? "pointer"
                                : "not-allowed",
                          }}
                        >
                          {" "}
                          +{" "}
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.product._id)}
                        style={{
                          color: "#e0245e",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          textDecoration: "underline",
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <h4 style={{ minWidth: "80px", textAlign: "right" }}>
                    ₹{item.product.price * item.quantity}
                  </h4>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div
              style={{
                flex: 1,
                padding: "20px",
                border: "1px solid #ddd",
                borderRadius: "8px",
                height: "fit-content",
                background: "#fafafa",
              }}
            >
              <h3>Order Summary</h3>
              <p style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Items:</span> <span>{cartCount}</span>
              </p>
              <h3
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  borderTop: "1px solid #ccc",
                  paddingTop: "15px",
                }}
              >
                <span>Subtotal:</span> <span>₹{subtotal}</span>
              </h3>
              <button
                onClick={() => navigate("/checkout")}
                style={{
                  width: "100%",
                  padding: "15px",
                  marginTop: "20px",
                  backgroundColor: "#28a745",
                  color: "white",
                  border: "none",
                  fontSize: "1.1rem",
                  cursor: "pointer",
                }}
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
