import { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import { CartContext } from "../context/CartContext";

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const { addToCart } = useContext(CartContext);
  const [addingCart, setAddingCart] = useState(false);
  const [cartMsg, setCartMsg] = useState("");

  const handleAddCart = async () => {
    setAddingCart(true);
    setCartMsg("");
    try {
      await addToCart(product._id);
      setCartMsg("✓ Added to Cart");
    } catch (error) {
      setCartMsg(error.response?.data?.message || "Failed to add to cart");
    } finally {
      setAddingCart(false);
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await api.get(`/products/${id}`);
        setProduct(data.product);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return <h3>Loading product details...</h3>;
  if (error || !product) return <h3>Product not found.</h3>;

  return (
    <div>
      <Navbar />
      <div
        style={{
          display: "flex",
          padding: "40px",
          gap: "40px",
          maxWidth: "1000px",
          margin: "0 auto",
        }}
      >
        <img
          src={product.image}
          alt={product.name}
          style={{ width: "400px", height: "400px", objectFit: "cover" }}
        />
        <div>
          <h2>{product.name}</h2>
          <p style={{ color: "#555", fontSize: "1.2rem" }}>
            {product.category}
          </p>
          <p>{product.description}</p>
          <h2 style={{ color: "#007bff" }}>₹{product.price}</h2>
          <p>
            Status:{" "}
            {product.stock > 0 ? `${product.stock} in stock` : "Out of Stock"}
          </p>

          <button
            onClick={handleAddCart}
            disabled={addingCart || product.stock === 0}
            style={{
              padding: "15px 30px",
              fontSize: "1.1rem",
              backgroundColor: product.stock > 0 ? "#28a745" : "#ccc",
              color: "white",
              border: "none",
              cursor: product.stock > 0 ? "pointer" : "not-allowed",
              marginTop: "20px",
            }}
          >
            {addingCart ? "⏳ Adding..." : "Add to Cart"}
          </button>

          {cartMsg && (
            <p
              style={{
                fontSize: "0.9rem",
                color: cartMsg.startsWith("✓") ? "#28a745" : "#e0245e",
                marginTop: "10px",
              }}
            >
              {cartMsg}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
