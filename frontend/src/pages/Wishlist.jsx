import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  const fetchWishlist = async () => {
    setLoading(true);
    setError(false);
    try {
      const { data } = await api.get("/wishlist");
      setWishlist(data.wishlist);
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = async (productId) => {
    try {
      await api.delete(`/wishlist/${productId}`);
      // Optimistically update UI
      setWishlist(wishlist.filter((item) => item._id !== productId));
    } catch (err) {
      alert("Failed to remove product");
    }
  };

  return (
    <div>
      <Navbar />
      <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
        <h2>My Wishlist</h2>
        {!loading && !error && wishlist.length > 0 && (
          <p>{wishlist.length} products saved</p>
        )}

        {loading && <h3>Loading your wishlist...</h3>}

        {error && (
          <div style={{ color: "red" }}>
            <h3>Something went wrong. We couldn't load your wishlist.</h3>
            <button onClick={fetchWishlist}>Try Again</button>
          </div>
        )}

        {!loading && !error && wishlist.length === 0 && (
          <div style={{ textAlign: "center", marginTop: "50px" }}>
            <h2>❤️ Your wishlist is empty</h2>
            <p>Save products you love and find them here later.</p>
            <button
              onClick={() => navigate("/products")}
              style={{ padding: "10px 20px", marginTop: "15px" }}
            >
              Browse Products
            </button>
          </div>
        )}

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "20px",
            marginTop: "20px",
          }}
        >
          {wishlist.map((product) => (
            <div
              key={product._id}
              style={{
                border: "1px solid #ddd",
                padding: "15px",
                borderRadius: "8px",
                width: "250px",
              }}
            >
              <img
                src={product.image}
                alt={product.name}
                style={{ width: "100%", height: "200px", objectFit: "cover" }}
              />
              <h3>{product.name}</h3>
              <p>₹{product.price}</p>
              <p>{product.category}</p>
              <p>
                {product.stock > 0
                  ? `${product.stock} units left`
                  : "Out of Stock"}
              </p>
              <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
                <button
                  onClick={() => navigate(`/products/${product._id}`)}
                  style={{ flex: 1, padding: "5px" }}
                >
                  View Details
                </button>
                <button
                  onClick={() => handleRemove(product._id)}
                  style={{
                    flex: 1,
                    padding: "5px",
                    backgroundColor: "#e0245e",
                    color: "white",
                    border: "none",
                  }}
                >
                  Remove ♥
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
