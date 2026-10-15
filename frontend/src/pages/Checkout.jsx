import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import api from "../services/api";
import Navbar from "../components/Navbar";

const Checkout = () => {
  const {
    cartItems,
    subtotal,
    fetchCart,
    loading: cartLoading,
  } = useContext(CartContext);
  const navigate = useNavigate();
  const [shipping, setShipping] = useState({
    fullName: "",
    phone: "",
    addressLine1: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!cartLoading && cartItems.length === 0) navigate("/cart");
  }, [cartLoading, cartItems, navigate]);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (Object.values(shipping).some((v) => !v.trim()))
      return setError("All shipping fields are required.");
    if (!/^\d{10}$/.test(shipping.phone.trim()))
      return setError("Phone must contain 10 digits.");
    if (!/^\d{6}$/.test(shipping.pincode.trim()))
      return setError("Pincode must contain 6 digits.");

    setLoading(true);
    setError("");

    try {
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded)
        throw new Error("Failed to load Razorpay. Check your connection.");

      const { data } = await api.post("/orders/create-payment-order", {
        shippingAddress: shipping,
      });

      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: "ShopKart",
        description: "Order Payment",
        order_id: data.razorpayOrderId,
        prefill: { name: shipping.fullName, contact: shipping.phone },
        handler: async function (response) {
          try {
            await api.post("/orders/verify-payment", {
              shopKartOrderId: data.shopKartOrderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            navigate(`/order-success/${data.shopKartOrderId}`);
            fetchCart();
          } catch (err) {
            setError("Payment verification failed.");
          }
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.on("payment.failed", () =>
        setError(
          "Payment failed. Your cart has not been cleared. Please try again.",
        ),
      );
      paymentObject.open();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div style={{ maxWidth: "800px", margin: "40px auto", padding: "20px" }}>
        <h2>Checkout</h2>
        {error && <p style={{ color: "red" }}>{error}</p>}

        <form
          onSubmit={handleCheckout}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "15px",
            marginTop: "20px",
          }}
        >
          <input
            placeholder="Full Name"
            value={shipping.fullName}
            onChange={(e) =>
              setShipping({ ...shipping, fullName: e.target.value })
            }
            required
          />
          <input
            placeholder="Phone"
            value={shipping.phone}
            onChange={(e) =>
              setShipping({ ...shipping, phone: e.target.value })
            }
            required
          />
          <input
            placeholder="Address Line 1"
            value={shipping.addressLine1}
            onChange={(e) =>
              setShipping({ ...shipping, addressLine1: e.target.value })
            }
            required
          />
          <input
            placeholder="City"
            value={shipping.city}
            onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
            required
          />
          <input
            placeholder="State"
            value={shipping.state}
            onChange={(e) =>
              setShipping({ ...shipping, state: e.target.value })
            }
            required
          />
          <input
            placeholder="Pincode (6 digits)"
            value={shipping.pincode}
            onChange={(e) =>
              setShipping({ ...shipping, pincode: e.target.value })
            }
            required
          />

          <div
            style={{
              padding: "20px",
              background: "#f9f9f9",
              marginTop: "20px",
            }}
          >
            <h3>Order Summary</h3>
            {cartItems.map((item) => (
              <p
                key={item.product._id}
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                <span>
                  {item.product.name} × {item.quantity}
                </span>
                <span>₹{item.product.price * item.quantity}</span>
              </p>
            ))}
            <h3>Total to Pay: ₹{subtotal}</h3>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "15px",
                background: "#28a745",
                color: "white",
                border: "none",
                cursor: "pointer",
                width: "100%",
                marginTop: "10px",
              }}
            >
              {loading ? "Processing..." : "Pay with Razorpay"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
