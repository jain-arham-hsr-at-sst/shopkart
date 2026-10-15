import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import api from "../services/api";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  const { addToCart } = useContext(CartContext);
  const [addingCart, setAddingCart] = useState(false);

  const [savingWishlist, setSavingWishlist] = useState(false);
  const [wishlistMsg, setWishlistMsg] = useState("");

  const handleAddCart = async () => {
    setAddingCart(true);
    try {
      await addToCart(product._id);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to add to cart");
    } finally {
      setAddingCart(false);
    }
  };

  const handleAddWishlist = async () => {
    setSavingWishlist(true);
    setWishlistMsg("");
    try {
      await api.post(`/wishlist/${product._id}`);
      setWishlistMsg("♥ Added to Wishlist");
    } catch (error) {
      if (error.response?.status === 409) {
        setWishlistMsg("♥ Already in Wishlist");
      } else {
        setWishlistMsg("Unable to save product. Please try again.");
      }
    } finally {
      setSavingWishlist(false);
    }
  };

  return (
    <div
      style={{
        border: "1px solid #ddd",
        padding: "15px",
        borderRadius: "8px",
        width: "250px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <img
        src={product.image}
        alt={product.name}
        style={{ width: "100%", height: "200px", objectFit: "cover" }}
      />
      <h3>{product.name}</h3>
      <p style={{ color: "#555", margin: "5px 0" }}>{product.category}</p>
      <p style={{ fontWeight: "bold", fontSize: "1.2rem", margin: "5px 0" }}>
        ₹{product.price}
      </p>
      <p style={{ margin: "5px 0" }}>
        {product.stock > 0 ? `${product.stock} units left` : "Out of Stock"}
      </p>

      {wishlistMsg && (
        <p style={{ fontSize: "0.9rem", color: "#e0245e", margin: "5px 0" }}>
          {wishlistMsg}
        </p>
      )}

      <div style={{ flexGrow: 1 }}></div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          marginTop: "15px",
        }}
      >
        <button
          onClick={handleAddCart}
          disabled={addingCart || product.stock < 1}
          style={{
            padding: "10px",
            backgroundColor: product.stock < 1 ? "#ccc" : "#28a745",
            color: "white",
            border: "none",
            cursor: product.stock < 1 ? "not-allowed" : "pointer",
            borderRadius: "4px",
          }}
        >
          {addingCart
            ? "⏳ Adding..."
            : product.stock < 1
              ? "Out of Stock"
              : "Add to Cart"}
        </button>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => navigate(`/products/${product._id}`)}
            style={{
              flex: 1,
              padding: "8px",
              backgroundColor: "#f0f0f0",
              border: "1px solid #ddd",
              cursor: "pointer",
              borderRadius: "4px",
            }}
          >
            View Details
          </button>
          <button
            onClick={handleAddWishlist}
            disabled={savingWishlist}
            style={{
              flex: 1,
              padding: "8px",
              backgroundColor: "#ffe4e1",
              color: "#e0245e",
              border: "1px solid #ffb6c1",
              cursor: "pointer",
              borderRadius: "4px",
            }}
          >
            {savingWishlist ? "⏳ Saving..." : "♡ Add to Wishlist"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
