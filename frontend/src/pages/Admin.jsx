import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

const MARK_FIELDS = ["insem1", "insem2", "insem3", "practical", "assignment", "endsem"];

const s = {
  page: {
    minHeight: "100vh",
    background: "#f5f5f3",
    padding: "2rem 1rem",
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  wrap: { maxWidth: "860px", margin: "0 auto" },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.5rem",
  },
  h1: { fontSize: "22px", fontWeight: 500, margin: 0, color: "#1a1a18" },
  tabs: { display: "flex", gap: "0.5rem", marginBottom: "1.5rem", flexWrap: "wrap" },
  tab: (active) => ({
    padding: "8px 18px",
    borderRadius: "8px",
    border: "1px solid #d3d1c7",
    background: active ? "#185FA5" : "#fff",
    color: active ? "#fff" : "#3d3d3a",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: active ? 500 : 400,
  }),
  card: {
    background: "#fff",
    borderRadius: "12px",
    border: "1px solid #e5e5e3",
    padding: "1.5rem",
  },
  h2: { fontSize: "16px", fontWeight: 500, marginTop: 0, marginBottom: "1.25rem", color: "#1a1a18" },
  label: { fontSize: "13px", fontWeight: 500, display: "block", marginBottom: "4px", color: "#3d3d3a" },
  input: {
    width: "100%",
    padding: "9px 12px",
    borderRadius: "8px",
    border: "1px solid #d3d1c7",
    background: "#fafaf8",
    color: "#1a1a18",
    fontSize: "14px",
    marginBottom: "0.75rem",
    boxSizing: "border-box",
  },
  select: {
    display: "block",
    width: "100%",
    padding: "9px 12px",
    borderRadius: "8px",
    border: "1px solid #d3d1c7",
    background: "#fafaf8",
    color: "#1a1a18",
    fontSize: "14px",
    marginBottom: "0.75rem",
    marginTop: "4px",
  },
  btn: {
    padding: "10px 22px",
    borderRadius: "8px",
    background: "#185FA5",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    fontWeight: 500,
    fontSize: "14px",
  },
  logoutBtn: {
    padding: "8px 16px",
    borderRadius: "8px",
    border: "1px solid #d3d1c7",
    background: "transparent",
    color: "#5f5e5a",
    cursor: "pointer",
    fontSize: "14px",
  },
  success: {
    padding: "10px 14px",
    borderRadius: "8px",
    background: "#eaf3de",
    color: "#3b6d11",
    marginBottom: "1rem",
    fontSize: "14px",
  },
  error: {
    padding: "10px 14px",
    borderRadius: "8px",
    background: "#fcebeb",
    color: "#a32d2d",
    marginBottom: "1rem",
    fontSize: "14px",
  },
  hr: { margin: "1.5rem 0", borderColor: "#e5e5e3", borderStyle: "solid", borderWidth: "1px 0 0 0" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: "14px" },
  th: { padding: "6px 8px", fontWeight: 500, textAlign: "left", borderBottom: "1px solid #d3d1c7", color: "#3d3d3a" },
  td: { padding: "7px 8px", borderBottom: "1px solid #f1efe8", color: "#1a1a18" },
  tdMuted: { padding: "7px 8px", borderBottom: "1px solid #f1efe8", color: "#888780" },
  code: {
    background: "#f1efe8",
    padding: "2px 6px",
    borderRadius: "4px",
    fontSize: "12px",
    fontFamily: "monospace",
    color: "#3d3d3a",
  },
  note: { fontSize: "13px", color: "#888780", marginBottom: "1rem", lineHeight: 1.6 },
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

  const logout = () => { sessionStorage.clear(); navigate("/login"); };

  const flash = (m, isErr = false) => {
    if (isErr) { setErr(m); setTimeout(() => setErr(""), 5000); }
    else { setMsg(m); setTimeout(() => setMsg(""), 5000); }
  };

  const importMarksExcel = async () => {
    if (!marksFileRef.current?.files[0] || !selectedSubject) {
      flash("Please select a subject and an Excel file.", true); return;
    }
    const form = new FormData();
    form.append("file", marksFileRef.current.files[0]);
    try {
      const r = await API.post(`/admin/import-excel?subject_code=${selectedSubject}`, form);
      const errCount = r.data.errors.length;
      flash(`Done! Updated: ${r.data.updated}, Created: ${r.data.created}${errCount ? `, Errors: ${errCount} (check console)` : ""}`);
      if (r.data.errors.length) console.warn("Import errors:", r.data.errors);
    } catch (e) { flash(e.response?.data?.detail || "Import failed", true); }
  };

  const importStudentsExcel = async () => {
    if (!studentsFileRef.current?.files[0]) { flash("Please select a file.", true); return; }
    const form = new FormData();
    form.append("file", studentsFileRef.current.files[0]);
    try {
      const r = await API.post("/admin/bulk-create-students", form);
      flash(`Created: ${r.data.created}, Skipped (already exist): ${r.data.skipped}`);
      API.get("/admin/students").then((res) => setStudents(res.data));
    } catch (e) { flash(e.response?.data?.detail || "Import failed", true); }
  };

  const saveManualMarks = async () => {
    if (!manualStudentId || !manualSubject) {
      flash("Fill in Student ID and select a subject.", true); return;
    }
    try {
      await API.put("/admin/marks", {
        student_id: manualStudentId,
        subject_code: manualSubject,
        ...manualMarks,
      });
      flash("Marks saved successfully!");
    } catch (e) { flash(e.response?.data?.detail || "Save failed", true); }
  };

  const addSubject = async () => {
    if (!subjCode || !subjName || !subjSem) { flash("Fill in all subject fields.", true); return; }
    try {
      await API.post(`/admin/subjects?code=${subjCode}&name=${encodeURIComponent(subjName)}&semester=${subjSem}`);
      flash("Subject added!");
      setSubjCode(""); setSubjName(""); setSubjSem("");
      API.get("/admin/subjects").then((r) => setSubjects(r.data));
    } catch (e) { flash(e.response?.data?.detail || "Error adding subject", true); }
  };

  const Inp = ({ val, onChange, placeholder, type = "text" }) => (
    <input
      type={type}
      value={val}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={s.input}
    />
  );

  return (
    <div style={s.page}>
      <div style={s.wrap}>
        <div style={s.header}>
          <h1 style={s.h1}>Admin Panel</h1>
          <button style={s.logoutBtn} onClick={logout}>Sign out</button>
        </div>

        <div style={s.tabs}>
          {[["import", "Excel Import"], ["marks", "Edit Marks"], ["subjects", "Subjects"], ["students", "Students"]].map(
            ([key, label]) => (
              <button key={key} style={s.tab(tab === key)} onClick={() => setTab(key)}>
                {label}
              </button>
            )
          )}
        </div>

        {msg && <div style={s.success}>{msg}</div>}
        {err && <div style={s.error}>{err}</div>}

        <div style={s.card}>
          {/* ── EXCEL IMPORT TAB ── */}
          {tab === "import" && (
            <div>
              <h2 style={s.h2}>Import marks from Excel</h2>
              <p style={s.note}>
                Required columns:{" "}
                <span style={s.code}>student_id, insem1, insem2, insem3, practical, assignment, endsem</span>
                <br />
                Leave cells blank for marks not yet entered. Make sure to add the subject first.
              </p>

              <label style={s.label}>Select subject</label>
              <select style={s.select} value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}>
                <option value="">-- select subject --</option>
                {subjects.map((s) => (
                  <option key={s.code} value={s.code}>{s.name} ({s.code})</option>
                ))}
              </select>

              <label style={s.label}>Marks Excel file (.xlsx)</label>
              <input
                ref={marksFileRef}
                type="file"
                accept=".xlsx,.xls"
                style={{ display: "block", marginTop: "4px", marginBottom: "0.75rem", fontSize: "14px" }}
              />
              <button style={s.btn} onClick={importMarksExcel}>Upload &amp; Import</button>

              <hr style={s.hr} />
              <h2 style={s.h2}>Bulk create students from Excel</h2>
              <p style={s.note}>
                Required columns: <span style={s.code}>student_id, name</span><br />
                Optional: <span style={s.code}>email, division, password</span> — if password is blank, defaults to the student_id.
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

          {/* ── EDIT MARKS TAB ── */}
          {tab === "marks" && (
            <div>
              <h2 style={s.h2}>Edit marks manually</h2>
              <label style={s.label}>Student ID</label>
              <Inp val={manualStudentId} onChange={setManualStudentId} placeholder="e.g. 2021001" />
              <label style={s.label}>Subject</label>
              <select
                style={s.select}
                value={manualSubject}
                onChange={(e) => setManualSubject(e.target.value)}
              >
                <option value="">-- select subject --</option>
                {subjects.map((s) => (
                  <option key={s.code} value={s.code}>{s.name} ({s.code})</option>
                ))}
              </select>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem", marginBottom: "1rem" }}>
                {MARK_FIELDS.map((f) => (
                  <div key={f}>
                    <label style={{ ...s.label, fontSize: "12px", color: "#888780" }}>{f.toUpperCase()}</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={manualMarks[f] ?? ""}
                      onChange={(e) =>
                        setManualMarks((prev) => ({
                          ...prev,
                          [f]: e.target.value === "" ? undefined : parseFloat(e.target.value),
                        }))
                      }
                      style={{ ...s.input, marginBottom: 0 }}
                    />
                  </div>
                ))}
              </div>
              <button style={s.btn} onClick={saveManualMarks}>Save marks</button>
            </div>
          )}

          {/* ── SUBJECTS TAB ── */}
          {tab === "subjects" && (
            <div>
              <h2 style={s.h2}>Add subject</h2>
              <label style={s.label}>Subject code</label>
              <Inp val={subjCode} onChange={setSubjCode} placeholder="e.g. CS301" />
              <label style={s.label}>Subject name</label>
              <Inp val={subjName} onChange={setSubjName} placeholder="e.g. Data Structures" />
              <label style={s.label}>Semester</label>
              <Inp val={subjSem} onChange={setSubjSem} placeholder="e.g. 3" type="number" />
              <button style={s.btn} onClick={addSubject}>Add subject</button>

              <h2 style={{ ...s.h2, marginTop: "1.5rem" }}>Existing subjects ({subjects.length})</h2>
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

          {/* ── STUDENTS TAB ── */}
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
                        <td style={s.tdMuted}>{st.division || "—"}</td>
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
