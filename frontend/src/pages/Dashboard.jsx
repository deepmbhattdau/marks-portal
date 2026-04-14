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
    background: "#f5f5f3",
    padding: "2rem 1rem",
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  wrap: { maxWidth: "900px", margin: "0 auto" },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "2rem",
  },
  h1: { fontSize: "22px", fontWeight: 500, margin: 0, color: "#1a1a18" },
  meta: { color: "#888780", fontSize: "14px", margin: "4px 0 0" },
  logoutBtn: {
    padding: "8px 16px",
    borderRadius: "8px",
    border: "1px solid #d3d1c7",
    background: "transparent",
    color: "#5f5e5a",
    cursor: "pointer",
    fontSize: "14px",
  },
  card: {
    background: "#fff",
    borderRadius: "12px",
    border: "1px solid #e5e5e3",
    padding: "1.25rem 1.5rem",
    marginBottom: "1rem",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: "1rem",
  },
  subjectName: { fontWeight: 500, color: "#1a1a18" },
  subjectCode: { color: "#b4b2a9", fontSize: "13px", marginLeft: "8px" },
  semBadge: {
    fontSize: "12px",
    padding: "3px 10px",
    borderRadius: "20px",
    background: "#f1efe8",
    color: "#5f5e5a",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
    gap: "0.75rem",
  },
  markBox: {
    background: "#f5f5f3",
    borderRadius: "8px",
    padding: "0.6rem 0.8rem",
  },
  markLabel: { fontSize: "11px", color: "#b4b2a9", marginBottom: "2px" },
  markValue: (val) => ({
    fontSize: "20px",
    fontWeight: 500,
    color: val >= 40 ? "#3b6d11" : "#a32d2d",
  }),
  empty: { color: "#888780", fontSize: "14px" },
};

// 🔥 Helper to format labels nicely
const LABELS = {
  insem1: "InSem 1",
  insem2: "InSem 2",
  insem3: "InSem 3",
  assignment1: "Assignment 1",
  assignment2: "Assignment 2",
  lab1: "Lab 1",
  lab2: "Lab 2",
  midsem: "Mid Sem",
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
          <div>
            <h1 style={s.h1}>My Marks</h1>
            {user && (
              <p style={s.meta}>
                {user.name} · {user.student_id}
                {user.division ? ` · Division ${user.division}` : ""}
              </p>
            )}
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