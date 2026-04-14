import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%)",
    backgroundSize: "400% 400%",
    animation: "gradient 15s ease infinite",
    fontFamily: "system-ui, -apple-system, sans-serif",
    padding: "1.25rem",
    position: "relative",
    overflow: "hidden",
  },
  // Animated background styles
  animationKeyframes: `
    @keyframes gradient {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
  `,
  card: {
    background: "rgba(255, 255, 255, 0.95)",
    padding: "2.5rem",
    borderRadius: "20px",
    width: "100%",
    maxWidth: "420px",
    border: "2px solid rgba(255, 255, 255, 0.3)",
    boxShadow: "0 25px 50px rgba(20, 44, 71, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.5)",
    backdropFilter: "blur(10px)",
    position: "relative",
    zIndex: 10,
  },
  logoContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: "1.75rem",
  },
  logo: {
    width: "auto",
    height: "70px",
    marginBottom: "1rem",
    animation: "bounce 2s infinite",
  },
  title: { 
    margin: 0, 
    fontSize: "28px", 
    fontWeight: 700, 
    textAlign: "center",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  subtitle: { color: "#6b7280", marginBottom: "1.75rem", fontSize: "14px", fontWeight: 500, textAlign: "center" },
  label: { fontSize: "13px", fontWeight: 600, display: "block", marginBottom: "6px", color: "#374151" },
  input: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "12px",
    border: "2px solid #e5e7eb",
    background: "#f9fafb",
    color: "#1f2937",
    fontSize: "15px",
    marginBottom: "1rem",
    boxSizing: "border-box",
    outline: "none",
    transition: "all 0.3s ease",
  },
  error: { color: "#dc2626", fontSize: "13px", marginBottom: "0.75rem", fontWeight: 500 },
  btn: {
    width: "100%",
    padding: "12px 16px",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "#fff",
    fontWeight: 600,
    fontSize: "15px",
    border: "none",
    cursor: "pointer",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: "0 10px 25px rgba(102, 126, 234, 0.4)",
  },
};

export default function Login() {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
      <style>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
      <div style={styles.card}>
        <div style={styles.logoContainer}>
          <img src="/dau_logo.png" alt="DAU Logo" style={styles.logo} />
          <h1 style={styles.title}>Student Portal</h1>
        </div>
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
          <div style={{ position: "relative" }}>
  <input
    style={styles.input}
    type={showPassword ? "text" : "password"}
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    placeholder="Enter your password"
    required
  />
  
  <span
    onClick={() => setShowPassword(!showPassword)}
    style={{
      position: "absolute",
      right: "12px",
      top: "50%",
      transform: "translateY(-50%)",
      cursor: "pointer",
      fontSize: "13px",
      color: "#667eea",
      fontWeight: 600,
    }}
  >
    {showPassword ? "Hide" : "Show"}
  </span>
</div>
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
