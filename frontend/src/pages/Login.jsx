import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "transparent",
    fontFamily: "system-ui, -apple-system, sans-serif",
    padding: "1.25rem",
  },
  card: {
    background: "rgba(255, 255, 255, 0.88)",
    padding: "2.5rem",
    borderRadius: "18px",
    width: "100%",
    maxWidth: "380px",
    border: "1px solid #d7e2ee",
    boxShadow: "0 14px 38px rgba(20, 44, 71, 0.11)",
    backdropFilter: "blur(2px)",
  },
  title: { margin: "0 0 0.25rem", fontSize: "23px", fontWeight: 600, color: "#17334f" },
  subtitle: { color: "#5f7386", marginBottom: "1.75rem", fontSize: "14px" },
  label: { fontSize: "13px", fontWeight: 600, display: "block", marginBottom: "5px", color: "#264866" },
  input: {
    width: "100%",
    padding: "11px 12px",
    borderRadius: "10px",
    border: "1px solid #c9d8e8",
    background: "#f8fbff",
    color: "#1d354f",
    fontSize: "15px",
    marginBottom: "1rem",
    boxSizing: "border-box",
    outline: "none",
  },
  error: { color: "#b23838", fontSize: "13px", marginBottom: "0.75rem" },
  btn: {
    width: "100%",
    padding: "11px",
    borderRadius: "10px",
    background: "linear-gradient(135deg, #1f5d93, #2f74b2)",
    color: "#fff",
    fontWeight: 600,
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
