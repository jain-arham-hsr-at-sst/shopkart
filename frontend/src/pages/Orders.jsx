import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get("/orders");
        setOrders(data.orders);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading)
    return (
      <div>
        <Navbar />
        <h3 style={{ padding: "20px" }}>Loading your orders...</h3>
      </div>
    );
  if (error)
    return (
      <div>
        <Navbar />
        <h3 style={{ padding: "20px", color: "red" }}>
          Unable to load your orders.
        </h3>
      </div>
    );

  return (
    <div>
      <Navbar />
      <div style={{ padding: "20px", maxWidth: "1000px", margin: "0 auto" }}>
        <h2>My Orders</h2>

        {orders.length === 0 ? (
          <div style={{ textAlign: "center", marginTop: "50px" }}>
            <h3>You have not placed any orders yet.</h3>
            <button
              onClick={() => navigate("/products")}
              style={{ padding: "10px 20px", marginTop: "15px" }}
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "20px" }}
          >
            {orders.map((order) => (
              <div
                key={order._id}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    backgroundColor: "#f4f4f4",
                    padding: "15px",
                    display: "flex",
                    justifyContent: "space-between",
                    borderBottom: "1px solid #ddd",
                  }}
                >
                  <div>
                    <p style={{ margin: 0, fontSize: "0.9rem", color: "#555" }}>
                      ORDER PLACED
                    </p>
                    <p style={{ margin: 0, fontWeight: "bold" }}>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: "0.9rem", color: "#555" }}>
                      TOTAL
                    </p>
                    <p style={{ margin: 0, fontWeight: "bold" }}>
                      ₹{order.totalAmount}
                    </p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ margin: 0, fontSize: "0.9rem", color: "#555" }}>
                      ORDER # {order._id.toUpperCase()}
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontWeight: "bold",
                        color:
                          order.status === "PLACED" ? "#28a745" : "#007bff",
                      }}
                    >
                      Status: {order.status}
                    </p>
                  </div>
                </div>

                <div style={{ padding: "15px" }}>
                  {order.items.map((item, index) => (
                    <div
                      key={index}
                      style={{
                        display: "flex",
                        gap: "20px",
                        marginBottom:
                          index !== order.items.length - 1 ? "15px" : "0",
                      }}
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        style={{
                          width: "80px",
                          height: "80px",
                          objectFit: "cover",
                          borderRadius: "4px",
                        }}
                      />
                      <div>
                        <h4 style={{ margin: "0 0 5px 0" }}>{item.name}</h4>
                        <p style={{ margin: 0, color: "#555" }}>
                          ₹{item.price} × {item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
