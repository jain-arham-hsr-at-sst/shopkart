import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";

const OrderSuccess = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    api
      .get(`/orders/${id}`)
      .then(({ data }) => setOrder(data.order))
      .catch(() => setOrder(null));
  }, [id]);

  return (
    <div>
      <Navbar />
      <div
        style={{
          maxWidth: "600px",
          margin: "50px auto",
          padding: "40px",
          textAlign: "center",
          border: "1px solid #ddd",
          borderRadius: "8px",
          backgroundColor: "#f9fff9",
        }}
      >
        <h1
          style={{ color: "#28a745", fontSize: "3rem", margin: "0 0 20px 0" }}
        >
          ✅
        </h1>
        <h2>Order Placed Successfully</h2>
        <p style={{ color: "#555", fontSize: "1.1rem" }}>
          Thank you for shopping with ShopKart! Your payment has been verified
          and your order is now being processed.
        </p>
        {order && (
          <div style={{ marginTop: "20px" }}>
            <p>
              <strong>Order ID:</strong> {order._id}
            </p>
            <p>
              <strong>Total:</strong> ₹{order.totalAmount}
            </p>
            <p>
              <strong>Status:</strong> {order.status}
            </p>
          </div>
        )}

        <div
          style={{
            display: "flex",
            gap: "20px",
            justifyContent: "center",
            marginTop: "30px",
          }}
        >
          <button
            onClick={() => navigate("/orders")}
            style={{
              padding: "12px 24px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            View My Orders
          </button>
          <button
            onClick={() => navigate("/products")}
            style={{
              padding: "12px 24px",
              backgroundColor: "#e9ecef",
              color: "#333",
              border: "1px solid #ccc",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
