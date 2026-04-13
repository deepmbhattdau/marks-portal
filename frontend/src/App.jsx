import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";

function PrivateRoute({ children }) {
  return sessionStorage.getItem("token") ? children : <Navigate to="/login" />;
}

function AdminRoute({ children }) {
  const isAdmin = sessionStorage.getItem("is_admin") === "true";
  return sessionStorage.getItem("token") && isAdmin
    ? children
    : <Navigate to="/login" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
