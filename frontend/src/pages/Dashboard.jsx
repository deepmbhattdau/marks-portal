import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
const MARK_FIELDS = [
  "insem1",
  "insem2",
  "insem3",
  "assignment1",
  "assignment2",
  "lab1",
  "lab2",
  "midsem",
  "endsem",
];

const s = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
    padding: "2rem 1rem",
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  wrap: { maxWidth: "900px", margin: "0 auto" },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "2rem",
    background: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(10px)",
    padding: "1.5rem",
    borderRadius: "16px",
    border: "1px solid rgba(255, 255, 255, 0.2)",
  },
  logo: {
    height: "50px",
    width: "auto",
    marginRight: "1.5rem",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },
  headerContent: {
    display: "flex",
    flexDirection: "column",
  },
  h1: { fontSize: "28px", fontWeight: 700, margin: 0, color: "#fff" },
  meta: { color: "rgba(255, 255, 255, 0.85)", fontSize: "14px", margin: "4px 0 0", fontWeight: 500 },
  logoutBtn: {
    padding: "10px 18px",
    borderRadius: "12px",
    border: "2px solid rgba(255, 255, 255, 0.3)",
    background: "rgba(255, 255, 255, 0.1)",
    color: "#fff",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 600,
    transition: "all 0.3s ease",
    backdropFilter: "blur(5px)",
  },
  card: {
    background: "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 255, 0.9) 100%)",
    borderRadius: "16px",
    border: "2px solid rgba(255, 255, 255, 0.3)",
    padding: "1.5rem",
    marginBottom: "1.2rem",
    boxShadow: "0 20px 40px rgba(20, 44, 71, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.5)",
    transition: "all 0.3s ease",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: "1.2rem",
    paddingBottom: "1rem",
    borderBottom: "2px solid #e5e7eb",
  },
  subjectName: { fontWeight: 700, color: "#667eea", fontSize: "17px" },
  subjectCode: { color: "#9ca3af", fontSize: "13px", marginLeft: "8px", fontWeight: 500 },
  semBadge: {
    fontSize: "12px",
    padding: "4px 12px",
    borderRadius: "20px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "#fff",
    fontWeight: 600,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
    gap: "0.9rem",
  },
  markBox: {
    background: "linear-gradient(135deg, #f0f4ff 0%, #f5f3ff 100%)",
    borderRadius: "12px",
    padding: "0.9rem",
    border: "2px solid #e0e7ff",
    transition: "all 0.3s ease",
    textAlign: "center",
  },
  markValue: () => ({
    fontSize: "24px",
    fontWeight: 700,
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  }),
  empty: { color: "#fff", fontSize: "16px", background: "rgba(255, 255, 255, 0.1)", padding: "2rem", borderRadius: "12px", textAlign: "center", backdropFilter: "blur(5px)" },
};

// 🔥 Helper to format labels nicely
const LABELS = {
  insem1: "InSem 1",
  insem2: "InSem 2",
  insem3: "InSem 3",
  lab1: "Lab 1",
  lab2: "Lab 2",
  lab3: "Lab 3",
  endsem: "End Sem",
};

const formatLabel = (key) => LABELS[key] || key.toUpperCase();

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [marks, setMarks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    API.get("/me").then((r) => setUser(r.data));
    API.get("/marks").then((r) => setMarks(r.data));
  }, []);

  const logout = () => {
    sessionStorage.clear();
    navigate("/login");
  };
  console.log("MARKS DATA:", marks);
  return (
    <div style={s.page}>
      <div style={s.wrap}>
        {/* Header */}
        <div style={s.header}>
          <div style={s.headerLeft}>
            <img src="/dau_logo.png" alt="DAU Logo" style={s.logo} />
            <div style={s.headerContent}>
              <h1 style={s.h1}>My Marks</h1>
              {user && (
                <p style={s.meta}>
                  {user.name} · {user.student_id}
                  {user.division ? ` · Division ${user.division}` : ""}
                </p>
              )}
            </div>
          </div>
          <button style={s.logoutBtn} onClick={logout}>
            Sign out
          </button>
        </div>

        {/* Empty state */}
        {marks.length === 0 && (
          <p style={s.empty}>
            No marks available yet. Check back after results are published.
          </p>
        )}
        
        {/* Marks Cards */}
        {marks.map((m, i) => (
          <div key={i} style={s.card}>
            <div style={s.cardHeader}>
              <div>
                <span style={s.subjectName}>{m.subject_name}</span>
                <span style={s.subjectCode}>{m.subject_code}</span>
              </div>
              <span style={s.semBadge}>Semester {m.semester}</span>
            </div>

            <div style={s.grid}>
              {MARK_FIELDS.map((key) => {
                const value = m[key]; // ✅ directly access from m

                if (value === undefined || value === null) return null;

                return (
                  <div key={key} style={s.markBox}>
                    <div style={s.markLabel}>{formatLabel(key)}</div>
                    <div style={s.markValue(value)}>{value}</div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}