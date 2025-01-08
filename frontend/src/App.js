import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage"; // Importación del RegisterPage
import MainLayout from "./components/MainLayout";
import AdminDashboard from "./pages/AdminDashboard";
import AgentDashboard from "./pages/AgentDashboard";
import AdminHome from "./pages/AdminHome";
import ConversationsPage from "./pages/ConversationsPage";
import SettingsPage from "./pages/SettingsPage";

const ProtectedRoute = ({ children, role }) => {
  const { user, role: userRole } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (role && userRole !== role) {
    return <Navigate to={`/${userRole}`} />;
  }

  return children;
};

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Ruta de inicio de sesión */}
        <Route path="/login" element={<LoginPage />} />

        {/* Ruta de registro */}
        <Route path="/register" element={<RegisterPage />} />

        {/* Rutas protegidas con el MainLayout */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminHome />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="conversations" element={<ConversationsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Ruta protegida para agentes */}
        <Route
          path="/agent"
          element={
            <ProtectedRoute role="agent">
              <AgentDashboard />
            </ProtectedRoute>
          }
        />

        {/* Redirección desde la raíz */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default App;
