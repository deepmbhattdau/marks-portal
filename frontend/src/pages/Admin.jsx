import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

// ── Defined outside the component to prevent remounting ──
const MARK_FIELDS = ["insem1", "insem2", "insem3", "assignment1", "assignment2", "lab1", "lab2", "midsem", "endsem"];

const Inp = ({ val, onChange, placeholder, type = "text" }) => (
  <input
    type={type}
    value={val}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    style={s.input}
  />
);

const s = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #1e293b 0%, #0f172a 100%)",
    padding: "2rem 1rem",
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  wrap: { maxWidth: "960px", margin: "0 auto" },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "2rem",
    background: "linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)",
    backdropFilter: "blur(10px)",
    padding: "1.5rem 2rem",
    borderRadius: "16px",
    border: "2px solid rgba(255, 255, 255, 0.1)",
  },
  h1: { fontSize: "28px", fontWeight: 700, margin: 0, color: "#fff" },
  tabs: { display: "flex", gap: "0.75rem", marginBottom: "2rem", flexWrap: "wrap" },
  tab: (active) => ({
    padding: "10px 20px",
    borderRadius: "12px",
    border: active ? "2px solid #3b82f6" : "2px solid rgba(255, 255, 255, 0.2)",
    background: active ? "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)" : "rgba(255, 255, 255, 0.05)",
    color: active ? "#fff" : "rgba(255, 255, 255, 0.7)",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: active ? 600 : 500,
    transition: "all 0.3s ease",
    backdropFilter: "blur(5px)",
  }),
  card: {
    background: "linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 255, 0.96) 100%)",
    borderRadius: "16px",
    border: "2px solid rgba(255, 255, 255, 0.2)",
    padding: "2rem",
    boxShadow: "0 25px 50px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.5)",
  },
  h2: { fontSize: "18px", fontWeight: 700, marginTop: 0, marginBottom: "1.25rem", background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" },
  label: { fontSize: "13px", fontWeight: 600, display: "block", marginBottom: "6px", color: "#1f2937" },
  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "10px",
    border: "2px solid #e5e7eb",
    background: "#f9fafb",
    color: "#1f2937",
    fontSize: "14px",
    marginBottom: "0.75rem",
    boxSizing: "border-box",
    transition: "all 0.3s ease",
  },
  select: {
    display: "block",
    width: "100%",
    padding: "10px 12px",
    borderRadius: "10px",
    border: "2px solid #e5e7eb",
    background: "#f9fafb",
    color: "#1f2937",
    fontSize: "14px",
    marginBottom: "0.75rem",
    marginTop: "6px",
    transition: "all 0.3s ease",
  },
  btn: {
    padding: "11px 24px",
    borderRadius: "10px",
    background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "14px",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: "0 10px 25px rgba(59, 130, 246, 0.4)",
  },
  logoutBtn: {
    padding: "10px 18px",
    borderRadius: "10px",
    border: "2px solid rgba(255, 255, 255, 0.3)",
    background: "rgba(255, 255, 255, 0.1)",
    color: "#fff",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 600,
    transition: "all 0.3s ease",
    backdropFilter: "blur(5px)",
  },
  success: {
    padding: "12px 16px",
    borderRadius: "12px",
    background: "linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)",
    color: "#059669",
    marginBottom: "1.5rem",
    fontSize: "14px",
    border: "2px solid #10b981",
    fontWeight: 500,
  },
  error: {
    padding: "12px 16px",
    borderRadius: "12px",
    background: "linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%)",
    color: "#dc2626",
    marginBottom: "1.5rem",
    fontSize: "14px",
    border: "2px solid #ef4444",
    fontWeight: 500,
  },
  hr: { margin: "2rem 0", borderColor: "#e5e7eb", borderStyle: "solid", borderWidth: "1px 0 0 0" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: "14px" },
  th: { padding: "10px 12px", fontWeight: 700, textAlign: "left", borderBottom: "2px solid #e5e7eb", color: "#1f2937", background: "#f9fafb" },
  td: { padding: "10px 12px", borderBottom: "1px solid #f3f4f6", color: "#1f2937" },
  tdMuted: { padding: "10px 12px", borderBottom: "1px solid #f3f4f6", color: "#6b7280" },
  code: {
    background: "linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)",
    padding: "3px 8px",
    borderRadius: "6px",
    fontSize: "12px",
    fontFamily: "monospace",
    color: "#3b82f6",
    border: "1px solid #bfdbfe",
  },
  note: { fontSize: "13px", color: "#4b5563", marginBottom: "1.25rem", lineHeight: 1.6, background: "#f9fafb", padding: "1rem 1.25rem", borderRadius: "10px", borderLeft: "4px solid #3b82f6" },
};

export default function Admin() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [tab, setTab] = useState("import");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const marksFileRef = useRef();
  const studentsFileRef = useRef();
  const [selectedSubject, setSelectedSubject] = useState("");

  const [manualStudentId, setManualStudentId] = useState("");
  const [manualSubject, setManualSubject] = useState("");
  const [manualMarks, setManualMarks] = useState({});

  const [subjCode, setSubjCode] = useState("");
  const [subjName, setSubjName] = useState("");
  const [subjSem, setSubjSem] = useState("");

  useEffect(() => {
    API.get("/admin/subjects").then((r) => setSubjects(r.data));
    API.get("/admin/students").then((r) => setStudents(r.data));
  }, []);

  const logout = () => {
    sessionStorage.clear();
    navigate("/login");
  };

  const flash = (m, isErr = false) => {
    if (isErr) {
      setErr(m);
      setTimeout(() => setErr(""), 5000);
    } else {
      setMsg(m);
      setTimeout(() => setMsg(""), 5000);
    }
  };

  const handleMarkChange = (field, value) => {
    setManualMarks((prev) => ({
      ...prev,
      [field]: value === "" ? undefined : parseFloat(value),
    }));
  };

  const importMarksExcel = async () => {
    if (!marksFileRef.current?.files[0] || !selectedSubject) {
      flash("Please select a subject and an Excel file.", true);
      return;
    }
    const form = new FormData();
    form.append("file", marksFileRef.current.files[0]);
    try {
      const r = await API.post(`/admin/import-excel?subject_code=${selectedSubject}`, form);
      const errCount = r.data.errors.length;
      flash(
        `Done! Updated: ${r.data.updated}, Created: ${r.data.created}${errCount ? `, Errors: ${errCount} (check console)` : ""}`
      );
      if (r.data.errors.length) console.warn("Import errors:", r.data.errors);
    } catch (e) {
      flash(e.response?.data?.detail || "Import failed", true);
    }
  };

  const importStudentsExcel = async () => {
    if (!studentsFileRef.current?.files[0]) {
      flash("Please select a file.", true);
      return;
    }
    const form = new FormData();
    form.append("file", studentsFileRef.current.files[0]);
    try {
      const r = await API.post("/admin/bulk-create-students", form);
      flash(`Created: ${r.data.created}, Skipped (already exist): ${r.data.skipped}`);
      API.get("/admin/students").then((res) => setStudents(res.data));
    } catch (e) {
      flash(e.response?.data?.detail || "Import failed", true);
    }
  };

  const saveManualMarks = async () => {
    if (!manualStudentId || !manualSubject) {
      flash("Fill in Student ID and select a subject.", true);
      return;
    }
    try {
      await API.put("/admin/marks", {
        student_id: manualStudentId,
        subject_code: manualSubject,
        ...manualMarks,
      });
      flash("Marks saved successfully!");
    } catch (e) {
      flash(e.response?.data?.detail || "Save failed", true);
    }
  };

  const addSubject = async () => {
    if (!subjCode || !subjName || !subjSem) {
      flash("Fill in all subject fields.", true);
      return;
    }
    try {
      await API.post(
        `/admin/subjects?code=${subjCode}&name=${encodeURIComponent(subjName)}&semester=${subjSem}`
      );
      flash("Subject added!");
      setSubjCode("");
      setSubjName("");
      setSubjSem("");
      API.get("/admin/subjects").then((r) => setSubjects(r.data));
    } catch (e) {
      flash(e.response?.data?.detail || "Error adding subject", true);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.wrap}>
        <div style={s.header}>
          <h1 style={s.h1}>Admin Panel</h1>
          <button style={s.logoutBtn} onClick={logout}>Sign out</button>
        </div>

        <div style={s.tabs}>
          {[
            ["import", "Excel Import"],
            ["marks", "Edit Marks"],
            ["subjects", "Subjects"],
            ["students", "Students"],
          ].map(([key, label]) => (
            <button key={key} style={s.tab(tab === key)} onClick={() => setTab(key)}>
              {label}
            </button>
          ))}
        </div>

        {msg && <div style={s.success}>{msg}</div>}
        {err && <div style={s.error}>{err}</div>}

        <div style={s.card}>

          {/* EXCEL IMPORT TAB */}
          {tab === "import" && (
            <div>
              <h2 style={s.h2}>Import marks from Excel</h2>
              <p style={s.note}>
                Required columns:{" "}
                <span style={s.code}>
                  student_id, insem1, insem2, insem3, assignment1, assignment2, lab1, lab2, midsem, endsem
                </span>
                <br />
                Leave cells blank for marks not yet entered. Make sure to add the subject first.
              </p>

              <label style={s.label}>Select subject</label>
              <select
                style={s.select}
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
              >
                <option value="">-- select subject --</option>
                {subjects.map((subj) => (
                  <option key={subj.code} value={subj.code}>
                    {subj.name} ({subj.code})
                  </option>
                ))}
              </select>

              <label style={s.label}>Marks Excel file (.xlsx)</label>
              <input
                ref={marksFileRef}
                type="file"
                accept=".xlsx,.xls"
                style={{ display: "block", marginTop: "4px", marginBottom: "0.75rem", fontSize: "14px" }}
              />
              <button style={s.btn} onClick={importMarksExcel}>Upload and Import</button>

              <hr style={s.hr} />

              <h2 style={s.h2}>Bulk create students from Excel</h2>
              <p style={s.note}>
                Required columns: <span style={s.code}>student_id, name</span>
                <br />
                Optional: <span style={s.code}>email, division, password</span> — if password is
                blank, defaults to the student_id.
              </p>
              <input
                ref={studentsFileRef}
                type="file"
                accept=".xlsx,.xls"
                style={{ display: "block", marginBottom: "0.75rem", fontSize: "14px" }}
              />
              <button style={s.btn} onClick={importStudentsExcel}>Upload Students</button>
            </div>
          )}

          {/* EDIT MARKS TAB */}
          {tab === "marks" && (
            <div>
              <h2 style={s.h2}>Edit marks manually</h2>
              <label style={s.label}>Student ID</label>
              <Inp
                val={manualStudentId}
                onChange={setManualStudentId}
                placeholder="e.g. 2021001"
              />
              <label style={s.label}>Subject</label>
              <select
                style={s.select}
                value={manualSubject}
                onChange={(e) => setManualSubject(e.target.value)}
              >
                <option value="">-- select subject --</option>
                {subjects.map((subj) => (
                  <option key={subj.code} value={subj.code}>
                    {subj.name} ({subj.code})
                  </option>
                ))}
              </select>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: "0.75rem",
                  marginBottom: "1rem",
                }}
              >
                {MARK_FIELDS.map((f) => (
                  <div key={f}>
                    <label style={{ ...s.label, fontSize: "12px", color: "#888780" }}>
                      {f.toUpperCase()}
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={manualMarks[f] ?? ""}
                      onChange={(e) => handleMarkChange(f, e.target.value)}
                      style={{ ...s.input, marginBottom: 0 }}
                    />
                  </div>
                ))}
              </div>
              <button style={s.btn} onClick={saveManualMarks}>Save marks</button>
            </div>
          )}

          {/* SUBJECTS TAB */}
          {tab === "subjects" && (
            <div>
              <h2 style={s.h2}>Add subject</h2>
              <label style={s.label}>Subject code</label>
              <input
                type="text"
                value={subjCode}
                onChange={(e) => setSubjCode(e.target.value)}
                placeholder="e.g. CS301"
                style={s.input}
              />
              <label style={s.label}>Subject name</label>
              <input
                type="text"
                value={subjName}
                onChange={(e) => setSubjName(e.target.value)}
                placeholder="e.g. Data Structures"
                style={s.input}
              />
              <label style={s.label}>Semester</label>
              <input
                type="number"
                value={subjSem}
                onChange={(e) => setSubjSem(e.target.value)}
                placeholder="e.g. 3"
                style={s.input}
              />
              <button style={s.btn} onClick={addSubject}>Add subject</button>

              <h2 style={{ ...s.h2, marginTop: "1.5rem" }}>
                Existing subjects ({subjects.length})
              </h2>
              <div style={{ overflowX: "auto" }}>
                <table style={s.table}>
                  <thead>
                    <tr>
                      <th style={s.th}>Code</th>
                      <th style={s.th}>Name</th>
                      <th style={s.th}>Semester</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjects.map((sub) => (
                      <tr key={sub.id}>
                        <td style={s.tdMuted}>{sub.code}</td>
                        <td style={s.td}>{sub.name}</td>
                        <td style={s.tdMuted}>{sub.semester}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* STUDENTS TAB */}
          {tab === "students" && (
            <div>
              <h2 style={s.h2}>Students ({students.length})</h2>
              <div style={{ overflowX: "auto" }}>
                <table style={s.table}>
                  <thead>
                    <tr>
                      <th style={s.th}>Student ID</th>
                      <th style={s.th}>Name</th>
                      <th style={s.th}>Division</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((st) => (
                      <tr key={st.student_id}>
                        <td style={s.tdMuted}>{st.student_id}</td>
                        <td style={s.td}>{st.name}</td>
                        <td style={s.tdMuted}>{st.division || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}