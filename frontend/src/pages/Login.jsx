import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f5f5f3",
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  card: {
    background: "#fff",
    padding: "2.5rem",
    borderRadius: "16px",
    width: "100%",
    maxWidth: "380px",
    border: "1px solid #e5e5e3",
    boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
  },
  title: { margin: "0 0 0.25rem", fontSize: "22px", fontWeight: 500, color: "#1a1a18" },
  subtitle: { color: "#888780", marginBottom: "1.75rem", fontSize: "14px" },
  label: { fontSize: "13px", fontWeight: 500, display: "block", marginBottom: "5px", color: "#3d3d3a" },
  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #d3d1c7",
    background: "#fafaf8",
    color: "#1a1a18",
    fontSize: "15px",
    marginBottom: "1rem",
    boxSizing: "border-box",
    outline: "none",
  },
  error: { color: "#a32d2d", fontSize: "13px", marginBottom: "0.75rem" },
  btn: {
    width: "100%",
    padding: "11px",
    borderRadius: "8px",
    background: "#185FA5",
    color: "#fff",
    fontWeight: 500,
    fontSize: "15px",
    border: "none",
    cursor: "pointer",
    transition: "opacity 0.15s",
  },
};

export default function Login() {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const form = new URLSearchParams();
      form.append("username", id.trim());
      form.append("password", password);
      const res = await API.post("/auth/login", form, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      sessionStorage.setItem("token", res.data.access_token);
      sessionStorage.setItem("is_admin", res.data.is_admin);
      navigate(res.data.is_admin ? "/admin" : "/");
    } catch {
      setError("Invalid student ID or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Student Portal</h1>
        <p style={styles.subtitle}>Sign in with your student ID and password</p>
        <form onSubmit={handleLogin}>
          <label style={styles.label}>Student ID</label>
          <input
            style={styles.input}
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="e.g. 2021001"
            required
          />
          <label style={styles.label}>Password</label>
          <input
            style={styles.input}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />
          {error && <p style={styles.error}>{error}</p>}
          <button
            type="submit"
            style={{ ...styles.btn, opacity: loading ? 0.7 : 1 }}
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
