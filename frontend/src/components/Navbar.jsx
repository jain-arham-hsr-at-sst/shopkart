import { useNavigate, Link } from "react-router-dom";
import { useContext } from "react";
import { CartContext } from "../context/CartContext";
import api from "../services/api";

const Navbar = () => {
  const navigate = useNavigate();
  const { cartCount, fetchCart } = useContext(CartContext); // Pull derived state

  const handleLogout = async () => {
    try {
      await api.post("/customers/logout");
    } catch (err) {
      console.error("Logout request failed:", err);
    } finally {
      fetchCart();
      navigate("/login");
    }
  };

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "15px",
        background: "#333",
        color: "#fff",
      }}
    >
      <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
        <h2 style={{ margin: 0 }}>ShopKart</h2>
        <Link to="/home" style={{ color: "white", textDecoration: "none" }}>
          Home
        </Link>
        <Link to="/products" style={{ color: "white", textDecoration: "none" }}>
          Products
        </Link>
        <Link to="/wishlist" style={{ color: "white", textDecoration: "none" }}>
          Wishlist
        </Link>
        <Link to="/cart" style={{ color: "white", textDecoration: "none" }}>
          Cart {cartCount > 0 && `(${cartCount})`}
        </Link>
      </div>
      <button onClick={handleLogout}>Logout</button>
    </nav>
  );
};

export default Navbar;
